import { test, expect } from '@playwright/test';
import { loginAsAdmin, mockRecipesTable, mockPhotoDelete } from './mock-supabase.js';
import { fullRecipe, minimalRecipe, deactivatedRecipe } from './fixtures/recipes.js';

test.describe('Admin — recipe list', () => {
  test('lists existing recipes with a thumbnail only when a photo is set', async ({ page }) => {
    await loginAsAdmin(page, { list: [fullRecipe, minimalRecipe] });

    const rows = page.locator('#recipe-list .recipe-row');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText(fullRecipe.title);
    await expect(rows.nth(0)).toContainText(fullRecipe.category);
    await expect(rows.nth(0).locator('.recipe-row-thumb')).toHaveCount(1);
    await expect(rows.nth(1)).toContainText(minimalRecipe.title);
    await expect(rows.nth(1).locator('.recipe-row-thumb')).toHaveCount(0);
  });

  test('shows a message when there are no recipes yet', async ({ page }) => {
    await loginAsAdmin(page, { list: [] });
    await expect(page.locator('#recipe-list-status')).toContainText(/no recipes yet/i);
    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(0);
  });

  test('reloading a page with an already-persisted session does not duplicate rows', async ({ page }) => {
    // Supabase fires onAuthStateChange multiple times for a page load that already
    // has a persisted session (INITIAL_SESSION, then SIGNED_IN), plus the explicit
    // getSession() check — three overlapping triggers for one list load. A reload
    // after logging in reproduces that exact "already logged in" scenario (a fresh
    // login only ever fires one SIGNED_IN event, so it can't catch this on its own).
    await loginAsAdmin(page, { list: [fullRecipe] });
    await page.reload();

    await expect(page.getByRole('heading', { name: 'Add a Recipe' })).toBeVisible();
    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(1);
  });
});

test.describe('Admin — edit a recipe', () => {
  test('Edit populates the form and switches it into edit mode', async ({ page }) => {
    await loginAsAdmin(page, { list: [fullRecipe] });
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Edit' }).click();

    await expect(page.getByRole('heading', { name: 'Edit Recipe' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Update Recipe' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

    await expect(page.getByLabel('Title')).toHaveValue(fullRecipe.title);
    await expect(page.getByLabel('Category')).toHaveValue(fullRecipe.category);
    await expect(page.getByLabel(/^Yield/)).toHaveValue(fullRecipe.yield_text);
    await expect(page.getByLabel(/^Ingredients/)).toHaveValue(fullRecipe.ingredients);

    const stageRows = page.locator('.stage-row');
    await expect(stageRows).toHaveCount(4);
    await expect(stageRows.nth(0).locator('.stage-label')).toHaveValue('Prep');
    await expect(stageRows.nth(0).locator('.stage-value')).toHaveValue('30 min');
  });

  test('changing category while editing does not replace the recipe\'s loaded stages', async ({ page }) => {
    await loginAsAdmin(page, { list: [fullRecipe] });
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Edit' }).click();
    await expect(page.locator('.stage-row')).toHaveCount(4);

    await page.getByLabel('Category').selectOption('Cheese');

    // Still the recipe's own 4 loaded stages, not Cheese's 3 suggested ones.
    const stageRows = page.locator('.stage-row');
    await expect(stageRows).toHaveCount(4);
    await expect(stageRows.nth(0).locator('.stage-label')).toHaveValue('Prep');
    await expect(stageRows.nth(0).locator('.stage-value')).toHaveValue('30 min');
  });

  test('submitting an edit sends an update with the id and keeps the slug unchanged', async ({ page }) => {
    let updatedId = null;
    let updatedBody = null;
    await loginAsAdmin(page, { list: [fullRecipe] });
    await mockRecipesTable(page, {
      list: [fullRecipe],
      onUpdate: (id, body) => {
        updatedId = id;
        updatedBody = body;
      },
    });

    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Title').fill('Updated Title');
    await page.getByRole('button', { name: 'Update Recipe' }).click();

    await expect(page.locator('#recipe-status')).toContainText(/updated/i);
    expect(updatedId).toBe(fullRecipe.id);
    expect(updatedBody.slug).toBe(fullRecipe.slug);
    expect(updatedBody.title).toBe('Updated Title');
    // No new photo was chosen, so the existing photo_path is resubmitted unchanged.
    expect(updatedBody.photo_path).toBe(fullRecipe.photo_path);

    // Back to add mode after a successful save.
    await expect(page.getByRole('heading', { name: 'Add a Recipe' })).toBeVisible();
  });

  test('Cancel restores add mode without submitting anything', async ({ page }) => {
    await loginAsAdmin(page, { list: [fullRecipe] });
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit Recipe' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('heading', { name: 'Add a Recipe' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Recipe' })).toBeVisible();
    await expect(page.getByLabel('Title')).toHaveValue('');
    // Category resets to Beer (the default), whose suggested stages get
    // re-populated fresh — not left empty.
    await expect(page.getByLabel('Category')).toHaveValue('Beer');
    await expect(page.locator('.stage-row')).toHaveCount(3);
  });
});

test.describe('Admin — delete a recipe', () => {
  test('deletes the recipe and its photo after confirming', async ({ page }) => {
    // A mutable list, not a fresh array per mock call: the admin page re-fetches
    // the list after a successful delete, so the mock has to actually reflect the
    // deletion for that refetch to come back empty, the same as a real backend would.
    const list = [fullRecipe];
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
    await page.route(`https://test-project.supabase.co/storage/v1/object/recipe-photos`, async (route) => {
      deletedPhotoPrefixes = route.request().postDataJSON().prefixes;
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Delete' }).click();

    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(0);
    expect(deletedId).toBe(fullRecipe.id);
    expect(deletedPhotoPrefixes).toEqual([fullRecipe.photo_path]);
  });

  test('does not delete the photo for a recipe that has none', async ({ page }) => {
    const list = [minimalRecipe];
    let photoDeleteCalled = false;
    let deletedId = null;
    await loginAsAdmin(page, { list });
    await mockRecipesTable(page, {
      list,
      onDelete: (id) => {
        deletedId = id;
        list.splice(0, list.length, ...list.filter((r) => r.id !== id));
      },
    });
    await mockPhotoDelete(page, { succeeds: true });
    page.on('request', (request) => {
      if (request.url().includes('/storage/v1/object/recipe-photos')) photoDeleteCalled = true;
    });

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Delete' }).click();

    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(0);
    expect(deletedId).toBe(minimalRecipe.id);
    expect(photoDeleteCalled).toBe(false);
  });

  test('does nothing if the confirmation is dismissed', async ({ page }) => {
    let deleteCalled = false;
    await loginAsAdmin(page, { list: [fullRecipe] });
    await mockRecipesTable(page, {
      list: [fullRecipe],
      onDelete: () => {
        deleteCalled = true;
      },
    });

    page.once('dialog', (dialog) => dialog.dismiss());
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(300);

    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(1);
    expect(deleteCalled).toBe(false);
  });
});

test.describe('Admin — deactivate/reactivate a recipe', () => {
  test('Deactivate updates status and shows a "Deactivated" flag after refresh', async ({ page }) => {
    let updatedId = null;
    let updatedBody = null;
    await loginAsAdmin(page, { list: [fullRecipe] });
    await mockRecipesTable(page, {
      list: [{ ...fullRecipe, status: 'deactivated' }],
      onUpdate: (id, body) => {
        updatedId = id;
        updatedBody = body;
      },
    });

    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Deactivate' }).click();

    expect(updatedId).toBe(fullRecipe.id);
    expect(updatedBody).toEqual({ status: 'deactivated' });
    await expect(page.locator('#recipe-list .recipe-row')).toContainText('Deactivated');
    await expect(page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Reactivate' })).toBeVisible();
  });

  test('Reactivate on an already-deactivated recipe sets status back to published', async ({ page }) => {
    let updatedBody = null;
    await loginAsAdmin(page, { list: [deactivatedRecipe] });
    await mockRecipesTable(page, {
      list: [{ ...deactivatedRecipe, status: 'published' }],
      onUpdate: (id, body) => {
        updatedBody = body;
      },
    });

    await expect(page.locator('#recipe-list .recipe-row')).toContainText('Deactivated');
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Reactivate' }).click();

    expect(updatedBody).toEqual({ status: 'published' });
  });
});
