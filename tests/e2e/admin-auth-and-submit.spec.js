import { test, expect, createAdminUser, getRecipe, loginAsAdmin, photoExists, seedRecipes, signInAsMember, seedMembers, ADMIN_PASSWORD } from './emulator.js';
import { minimalRecipe } from './fixtures/recipes.js';

test.describe('Admin — login', () => {
  test.beforeEach(async () => {
    await createAdminUser();
  });

  test('wrong password shows an error and keeps the login form visible', async ({ page }) => {
    await page.goto('/admin/');

    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.locator('#login-error')).toContainText(/incorrect password/i);
    await expect(page.getByRole('heading', { name: 'Add a Recipe' })).toBeHidden();
  });

  test('correct password reveals the add-a-recipe form', async ({ page }) => {
    await page.goto('/admin/');

    await page.getByLabel('Password').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByRole('heading', { name: 'Add a Recipe' })).toBeVisible();
    await expect(page.locator('#login-section')).toBeHidden();
  });

  test('a signed-in member visiting /admin/ still sees the password form, not the admin panel', async ({ page }) => {
    await seedMembers([{ email: 'jamie@example.com', active: true, created_at: '2026-08-20T00:00:00Z' }]);
    await signInAsMember(page, 'jamie@example.com');

    await page.goto('/admin/');

    await expect(page.locator('#login-section')).toBeVisible();
    await expect(page.locator('#admin-section')).toBeHidden();
  });
});

test.describe('Admin — add a recipe', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  async function fillRequiredFields(page) {
    await page.getByLabel('Title').fill('Test Sourdough');
    await page.getByLabel(/^Ingredients/).fill('Flour\nWater\nSalt');
    await page.getByLabel(/^Instructions/).fill('Mix.\nBake.');
  }

  test('saves a published recipe with every field, including the uploaded photo', async ({ page }) => {
    await fillRequiredFields(page);
    await page.getByLabel(/^How-to video/).fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.getByLabel(/^Yield/).fill('1 loaf');
    await page.getByLabel(/^Notes/).fill('Test note.');
    await page.setInputFiles('#photo', {
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    });

    await page.getByRole('button', { name: 'Save Recipe' }).click();

    await expect(page.locator('#recipe-status')).toContainText(/saved/i);
    const saved = await getRecipe('test-sourdough');
    expect(saved).toMatchObject({
      title: 'Test Sourdough',
      status: 'published',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      yield_text: '1 loaf',
      notes: 'Test note.',
      ingredients: 'Flour\nWater\nSalt',
      instructions: 'Mix.\nBake.',
      time_stages: null,
    });
    expect(saved.photo_path).toMatch(/^test-sourdough-\d+\.jpg$/);
    expect(await photoExists(saved.photo_path)).toBe(true);
  });

  test('the "View the recipe" success link points at the new slug', async ({ page }) => {
    await fillRequiredFields(page);
    await page.getByRole('button', { name: 'Save Recipe' }).click();

    await expect(page.getByRole('link', { name: 'View the recipe' })).toHaveAttribute(
      'href',
      '/recipes/view?slug=test-sourdough',
    );
  });

  test('uses a suffixed slug when the base slug is already taken, leaving the existing recipe untouched', async ({ page }) => {
    await seedRecipes([{ ...minimalRecipe, slug: 'test-sourdough', title: 'The Original' }]);

    await fillRequiredFields(page);
    await page.getByRole('button', { name: 'Save Recipe' }).click();

    await expect(page.locator('#recipe-status')).toContainText(/saved/i);
    expect((await getRecipe('test-sourdough')).title).toBe('The Original');
    expect((await getRecipe('test-sourdough-2')).title).toBe('Test Sourdough');
  });

  test('a rejected photo upload shows an error, saves nothing, and re-enables the button', async ({ page }) => {
    // storage.rules only accept images — a non-image upload is refused, which
    // must stop the recipe from being saved with a broken photo reference.
    await fillRequiredFields(page);
    await page.setInputFiles('#photo', {
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not an image'),
    });
    const submitButton = page.getByRole('button', { name: 'Save Recipe' });
    await submitButton.click();

    await expect(page.locator('#recipe-status')).toContainText(/could not save the recipe/i);
    await expect(submitButton).toBeEnabled();
    expect(await getRecipe('test-sourdough')).toBeNull();
  });
});
