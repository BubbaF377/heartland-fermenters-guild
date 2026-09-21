import { test, expect, createAdminUser, getRecipe, loginAsAdmin, openAdminTab, photoExists, seedRecipes, signInAsMember, seedMembers, ADMIN_PASSWORD } from './emulator.js';
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

  test('correct password reveals the admin panel', async ({ page }) => {
    await page.goto('/admin/');

    await page.getByLabel('Password').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByRole('tab', { name: 'Stored Recipes' })).toBeVisible();
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
    await openAdminTab(page, 'Add a Recipe');
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

  test('shows the photo requirements next to the photo field', async ({ page }) => {
    await expect(page.locator('#photo-requirements')).toContainText('JPG, PNG, or WebP, up to 10 MB');
    await expect(page.locator('#photo')).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
  });

  test('picking an unsupported or oversized photo explains why and clears the file', async ({ page }) => {
    const photoInput = page.locator('#photo');
    const photoError = page.locator('#photo-error');

    await photoInput.setInputFiles({ name: 'dish.heic', mimeType: 'image/heic', buffer: Buffer.from('x') });
    await expect(photoError).toContainText(/isn't a JPG, PNG, or WebP image/);
    expect(await photoInput.evaluate((input) => input.files.length)).toBe(0);

    await photoInput.setInputFiles({
      name: 'huge.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.alloc(11 * 1024 * 1024),
    });
    await expect(photoError).toContainText(/11\.0 MB — the limit is 10 MB/);
    expect(await photoInput.evaluate((input) => input.files.length)).toBe(0);

    // A good file clears the message.
    await photoInput.setInputFiles({ name: 'ok.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fine') });
    await expect(photoError).toBeHidden();
  });

  test('a failed photo upload shows an error, saves nothing, and re-enables the button', async ({ page }) => {
    // A refusal rather than a dropped connection: the Storage SDK retries network
    // errors for minutes before giving up, but fails immediately on a 403.
    await page.route('http://127.0.0.1:9199/**', (route) =>
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 403, message: 'Permission denied.' } }),
      }),
    );
    await fillRequiredFields(page);
    await page.setInputFiles('#photo', { name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('img') });
    const submitButton = page.getByRole('button', { name: 'Save Recipe' });
    await submitButton.click();

    await expect(page.locator('#recipe-status')).toContainText(/could not save the recipe/i);
    await expect(submitButton).toBeEnabled();
    expect(await getRecipe('test-sourdough')).toBeNull();
  });
});
