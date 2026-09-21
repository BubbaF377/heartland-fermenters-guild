import { test, expect, listRecipeSlugs, loginAsAdmin, seedMembers, seedRecipes, signInAsMember } from './emulator.js';
import { fullRecipe } from './fixtures/recipes.js';

// Clicks the form's Preview button and returns the tab it opens.
async function openPreview(page) {
  const [preview] = await Promise.all([
    page.context().waitForEvent('page'),
    page.getByRole('button', { name: 'Preview' }).click(),
  ]);
  await preview.waitForLoadState();
  return preview;
}

async function fillRecipe(page) {
  await page.getByLabel('Title').fill('Preview Pickles');
  await page.getByLabel('Category').selectOption('Vegetables & Pickles');
  await page.getByLabel('Short summary').fill('Crunchy and sour.');
  await page.getByLabel(/^Ingredients/).fill('Cucumbers\nBrine\nDill');
  await page.getByLabel(/^Instructions/).fill('Pack the jar.\nWait a week.');
  await page.getByLabel(/^Notes/).fill('Keep them submerged.');
}

test.describe('Recipe preview — admin', () => {
  test('shows the unsaved recipe on the real recipe page, including a not-yet-uploaded photo', async ({ page }) => {
    await loginAsAdmin(page);
    await fillRecipe(page);
    await page.setInputFiles('#photo', {
      name: 'pickles.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64',
      ),
    });

    const preview = await openPreview(page);

    await expect(preview).toHaveURL(/\/recipes\/view\?preview=1$/);
    await expect(preview.locator('#preview-banner')).toBeVisible();
    await expect(preview.locator('#back-link')).toBeHidden();
    await expect(preview.locator('#recipe-title')).toHaveText('Preview Pickles');
    await expect(preview.locator('#recipe-category')).toHaveText('Vegetables & Pickles');
    await expect(preview.locator('#recipe-summary')).toHaveText('Crunchy and sour.');
    await expect(preview.locator('#recipe-ingredients li')).toHaveCount(3);
    await expect(preview.locator('#recipe-instructions li')).toHaveCount(2);
    await expect(preview.locator('#recipe-notes-text')).toHaveText('Keep them submerged.');
    await expect(preview.locator('#recipe-meta-strip')).toContainText('Submitted by');
    await expect(preview.locator('#recipe-photo')).toBeVisible();
    await expect(preview.locator('#recipe-photo-img')).toHaveAttribute('src', /^blob:/);

    // Nothing was saved — preview is read-only.
    expect(await listRecipeSlugs()).toEqual([]);
  });

  test('previewing again updates the same preview tab', async ({ page }) => {
    await loginAsAdmin(page);
    await fillRecipe(page);
    const preview = await openPreview(page);
    await expect(preview.locator('#recipe-title')).toHaveText('Preview Pickles');

    await page.getByLabel('Title').fill('Renamed Pickles');
    await page.getByRole('button', { name: 'Preview' }).click();

    await expect(preview.locator('#recipe-title')).toHaveText('Renamed Pickles');
    expect(page.context().pages()).toHaveLength(2);
  });

  test('while editing, the preview shows the recipe\'s existing photo and original date', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [fullRecipe] });
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Title').fill('Edited Boule');

    const preview = await openPreview(page);

    await expect(preview.locator('#recipe-title')).toHaveText('Edited Boule');
    await expect(preview.locator('#recipe-photo')).toBeVisible();
    await expect(preview.locator('#recipe-photo-img')).toHaveAttribute('src', /127\.0\.0\.1:9199/);
    const originalDate = new Date(fullRecipe.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    await expect(preview.locator('#recipe-meta-strip')).toContainText(originalDate);
  });

  test('an empty form still previews, with a placeholder title', async ({ page }) => {
    await loginAsAdmin(page);
    const preview = await openPreview(page);
    await expect(preview.locator('#recipe-title')).toHaveText('Untitled recipe');
  });
});

test.describe('Recipe preview — member', () => {
  test('a member can preview a submission before sending it for review', async ({ page }) => {
    await seedMembers([{ email: 'jamie@example.com', active: true, created_at: '2026-08-20T00:00:00Z' }]);
    await signInAsMember(page, 'jamie@example.com');
    await fillRecipe(page);

    const preview = await openPreview(page);

    await expect(preview.locator('#preview-banner')).toBeVisible();
    await expect(preview.locator('#recipe-title')).toHaveText('Preview Pickles');
    expect(await listRecipeSlugs()).toEqual([]);
  });
});

test.describe('Recipe preview — direct visit', () => {
  test('opening the preview URL with nothing to preview says so', async ({ page }) => {
    await page.goto('/recipes/view?preview=1');
    await expect(page.locator('#recipe-status')).toContainText(/nothing to preview/i);
    await expect(page.locator('#preview-banner')).toBeHidden();
  });

  test('a normal recipe page never shows the preview banner', async ({ page }) => {
    await seedRecipes([fullRecipe]);
    await page.goto(`/recipes/view?slug=${fullRecipe.slug}`);
    await expect(page.locator('#recipe-title')).toHaveText(fullRecipe.title);
    await expect(page.locator('#preview-banner')).toBeHidden();
  });
});
