import { test, expect, getRecipe, loginAsAdmin, openAdminTab, photoExists } from './emulator.js';
import { pendingRecipe } from './fixtures/recipes.js';

// Pending submissions live on the Recipes tab's Pending Recipes sub-tab.
async function loginToPendingTab(page, seed) {
  await loginAsAdmin(page, seed);
  await openAdminTab(page, 'Pending Recipes');
}

test.describe('Admin — pending recipes', () => {
  test('lists pending submissions separately from published recipes, with who submitted it', async ({ page }) => {
    await loginToPendingTab(page, { recipes: [pendingRecipe] });

    const pendingRows = page.locator('#pending-list .recipe-row');
    await expect(pendingRows).toHaveCount(1);
    await expect(pendingRows.first()).toContainText(pendingRecipe.title);
    await expect(pendingRows.first()).toContainText(`From ${pendingRecipe.submitted_by}`);
    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(0);
  });

  test('shows a message when there are no pending submissions', async ({ page }) => {
    await loginToPendingTab(page);
    await expect(page.locator('#pending-list-status')).toContainText(/no pending submissions/i);
    await expect(page.locator('#pending-list .recipe-row')).toHaveCount(0);
  });

  test('the Preview link points at the recipe detail page in a new tab', async ({ page }) => {
    await loginToPendingTab(page, { recipes: [pendingRecipe] });
    const preview = page.locator('#pending-list .recipe-row').getByRole('link', { name: 'Preview' });
    await expect(preview).toHaveAttribute('href', `/recipes/view?slug=${pendingRecipe.slug}`);
    await expect(preview).toHaveAttribute('target', '_blank');
  });

  test('Approve publishes the recipe and moves it out of the pending list', async ({ page }) => {
    await loginToPendingTab(page, { recipes: [pendingRecipe] });

    await page.locator('#pending-list .recipe-row').getByRole('button', { name: 'Approve' }).click();

    await expect(page.locator('#pending-list .recipe-row')).toHaveCount(0);
    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(1);
    expect((await getRecipe(pendingRecipe.slug)).status).toBe('published');
  });

  test('Reject asks for confirmation, then removes the submission and its photo', async ({ page }) => {
    await loginToPendingTab(page, { recipes: [pendingRecipe] });

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#pending-list .recipe-row').getByRole('button', { name: 'Reject' }).click();

    await expect(page.locator('#pending-list .recipe-row')).toHaveCount(0);
    expect(await getRecipe(pendingRecipe.slug)).toBeNull();
    expect(await photoExists(pendingRecipe.photo_path)).toBe(false);
  });

  test('Reject does nothing if the confirmation is dismissed', async ({ page }) => {
    await loginToPendingTab(page, { recipes: [pendingRecipe] });

    page.once('dialog', (dialog) => dialog.dismiss());
    await page.locator('#pending-list .recipe-row').getByRole('button', { name: 'Reject' }).click();
    await page.waitForTimeout(300);

    await expect(page.locator('#pending-list .recipe-row')).toHaveCount(1);
    expect(await getRecipe(pendingRecipe.slug)).not.toBeNull();
  });
});
