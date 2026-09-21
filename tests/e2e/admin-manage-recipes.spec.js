import { test, expect, getRecipe, listRecipeSlugs, loginAsAdmin, photoExists } from './emulator.js';
import { fullRecipe, minimalRecipe, deactivatedRecipe } from './fixtures/recipes.js';

test.describe('Admin — recipe list', () => {
  test('lists existing recipes with a thumbnail only when a photo is set', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [fullRecipe, minimalRecipe] });

    const rows = page.locator('#recipe-list .recipe-row');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText(fullRecipe.title);
    await expect(rows.nth(0)).toContainText(fullRecipe.category);
    await expect(rows.nth(0).locator('.recipe-row-thumb')).toHaveCount(1);
    await expect(rows.nth(1)).toContainText(minimalRecipe.title);
    await expect(rows.nth(1).locator('.recipe-row-thumb')).toHaveCount(0);
  });

  test('shows a message when there are no recipes yet', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator('#recipe-list-status')).toContainText(/no recipes yet/i);
    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(0);
  });

  test('reloading a page with an already-persisted session does not duplicate rows', async ({ page }) => {
    // Overlapping list loads (a restored session plus any later auth-state
    // change) must not each append their own copy of the rows.
    await loginAsAdmin(page, { recipes: [fullRecipe] });
    await page.reload();

    await expect(page.getByRole('heading', { name: 'Add a Recipe' })).toBeVisible();
    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(1);
  });
});

test.describe('Admin — edit a recipe', () => {
  test('Edit populates the form and switches it into edit mode', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [fullRecipe] });
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
    await loginAsAdmin(page, { recipes: [fullRecipe] });
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Edit' }).click();
    await expect(page.locator('.stage-row')).toHaveCount(4);

    await page.getByLabel('Category').selectOption('Cheese');

    // Still the recipe's own 4 loaded stages, not Cheese's 3 suggested ones.
    const stageRows = page.locator('.stage-row');
    await expect(stageRows).toHaveCount(4);
    await expect(stageRows.nth(0).locator('.stage-label')).toHaveValue('Prep');
    await expect(stageRows.nth(0).locator('.stage-value')).toHaveValue('30 min');
  });

  test('submitting an edit updates the same document, keeping its slug, status, and photo', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [fullRecipe] });

    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Title').fill('Updated Title');
    await page.getByRole('button', { name: 'Update Recipe' }).click();

    await expect(page.locator('#recipe-status')).toContainText(/updated/i);
    expect(await listRecipeSlugs()).toEqual([fullRecipe.slug]);
    const saved = await getRecipe(fullRecipe.slug);
    expect(saved.title).toBe('Updated Title');
    expect(saved.status).toBe('published');
    // No new photo was chosen, so the existing photo_path is resubmitted unchanged.
    expect(saved.photo_path).toBe(fullRecipe.photo_path);

    // Back to add mode after a successful save.
    await expect(page.getByRole('heading', { name: 'Add a Recipe' })).toBeVisible();
  });

  test('Cancel restores add mode without submitting anything', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [fullRecipe] });
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit Recipe' })).toBeVisible();
    await page.getByLabel('Title').fill('Changed but not saved');

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('heading', { name: 'Add a Recipe' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Recipe' })).toBeVisible();
    await expect(page.getByLabel('Title')).toHaveValue('');
    // Category resets to Beer (the default), whose suggested stages get
    // re-populated fresh — not left empty.
    await expect(page.getByLabel('Category')).toHaveValue('Beer');
    await expect(page.locator('.stage-row')).toHaveCount(3);
    expect((await getRecipe(fullRecipe.slug)).title).toBe(fullRecipe.title);
  });
});

test.describe('Admin — delete a recipe', () => {
  test('deletes the recipe and its photo after confirming', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [fullRecipe] });
    expect(await photoExists(fullRecipe.photo_path)).toBe(true);

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Delete' }).click();

    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(0);
    expect(await getRecipe(fullRecipe.slug)).toBeNull();
    expect(await photoExists(fullRecipe.photo_path)).toBe(false);
  });

  test('deletes a recipe that has no photo', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [minimalRecipe] });

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Delete' }).click();

    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(0);
    expect(await getRecipe(minimalRecipe.slug)).toBeNull();
  });

  test('does nothing if the confirmation is dismissed', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [fullRecipe] });

    page.once('dialog', (dialog) => dialog.dismiss());
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(300);

    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(1);
    expect(await getRecipe(fullRecipe.slug)).not.toBeNull();
    expect(await photoExists(fullRecipe.photo_path)).toBe(true);
  });
});

test.describe('Admin — deactivate/reactivate a recipe', () => {
  test('Deactivate updates status and shows a "Deactivated" flag after refresh', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [fullRecipe] });

    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Deactivate' }).click();

    await expect(page.locator('#recipe-list .recipe-row')).toContainText('Deactivated');
    await expect(page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Reactivate' })).toBeVisible();
    expect((await getRecipe(fullRecipe.slug)).status).toBe('deactivated');
  });

  test('Reactivate on an already-deactivated recipe sets status back to published', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [deactivatedRecipe] });

    await expect(page.locator('#recipe-list .recipe-row')).toContainText('Deactivated');
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Reactivate' }).click();

    await expect(page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Deactivate' })).toBeVisible();
    expect((await getRecipe(deactivatedRecipe.slug)).status).toBe('published');
  });
});
