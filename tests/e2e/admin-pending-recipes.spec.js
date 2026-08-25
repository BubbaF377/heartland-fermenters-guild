import { test, expect } from '@playwright/test';
import { loginAsAdmin, mockRecipesTable } from './mock-supabase.js';
import { pendingRecipe } from './fixtures/recipes.js';

test.describe('Admin — pending recipes', () => {
  test('lists pending submissions separately from published recipes, with who submitted it', async ({ page }) => {
    await loginAsAdmin(page, { list: [pendingRecipe] });

    const pendingRows = page.locator('#pending-list .recipe-row');
    await expect(pendingRows).toHaveCount(1);
    await expect(pendingRows.first()).toContainText(pendingRecipe.title);
    await expect(pendingRows.first()).toContainText(`From ${pendingRecipe.submitted_by}`);
    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(0);
  });

  test('shows a message when there are no pending submissions', async ({ page }) => {
    await loginAsAdmin(page, { list: [] });
    await expect(page.locator('#pending-list-status')).toContainText(/no pending submissions/i);
    await expect(page.locator('#pending-list .recipe-row')).toHaveCount(0);
  });

  test('the Preview link points at the recipe detail page in a new tab', async ({ page }) => {
    await loginAsAdmin(page, { list: [pendingRecipe] });
    const preview = page.locator('#pending-list .recipe-row').getByRole('link', { name: 'Preview' });
    await expect(preview).toHaveAttribute('href', `/recipes/view?slug=${pendingRecipe.slug}`);
    await expect(preview).toHaveAttribute('target', '_blank');
  });

  test('Approve publishes the recipe and moves it out of the pending list', async ({ page }) => {
    let updatedId = null;
    let updatedBody = null;
    await loginAsAdmin(page, { list: [pendingRecipe] });
    await mockRecipesTable(page, {
      list: [{ ...pendingRecipe, status: 'published' }],
      onUpdate: (id, body) => {
        updatedId = id;
        updatedBody = body;
      },
    });

    await page.locator('#pending-list .recipe-row').getByRole('button', { name: 'Approve' }).click();

    expect(updatedId).toBe(pendingRecipe.id);
    expect(updatedBody).toEqual({ status: 'published' });
    await expect(page.locator('#pending-list .recipe-row')).toHaveCount(0);
    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(1);
  });

  test('Reject asks for confirmation, then removes the submission and its photo', async ({ page }) => {
    const list = [pendingRecipe];
    let deletedId = null;
    let deletedPhotoPrefixes = null;
    await loginAsAdmin(page, { list });
    await mockRecipesTable(page, {
      list,
      onDelete: (id) => {
        deletedId = id;
        list.splice(0, list.length, ...list.filter((r) => r.id !== id));
      },
    });
    await page.route('https://test-project.supabase.co/storage/v1/object/recipe-photos', async (route) => {
      deletedPhotoPrefixes = route.request().postDataJSON().prefixes;
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#pending-list .recipe-row').getByRole('button', { name: 'Reject' }).click();

    await expect(page.locator('#pending-list .recipe-row')).toHaveCount(0);
    expect(deletedId).toBe(pendingRecipe.id);
    expect(deletedPhotoPrefixes).toEqual([pendingRecipe.photo_path]);
  });

  test('Reject does nothing if the confirmation is dismissed', async ({ page }) => {
    let deleteCalled = false;
    await loginAsAdmin(page, { list: [pendingRecipe] });
    await mockRecipesTable(page, {
      list: [pendingRecipe],
      onDelete: () => {
        deleteCalled = true;
      },
    });

    page.once('dialog', (dialog) => dialog.dismiss());
    await page.locator('#pending-list .recipe-row').getByRole('button', { name: 'Reject' }).click();
    await page.waitForTimeout(300);

    await expect(page.locator('#pending-list .recipe-row')).toHaveCount(1);
    expect(deleteCalled).toBe(false);
  });
});
