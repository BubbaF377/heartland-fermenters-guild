import { test, expect } from '@playwright/test';
import { mockAuth, mockRecipesTable, mockPhotoUpload, loginAsAdmin } from './mock-supabase.js';

test.describe('Admin — login', () => {
  test('wrong password shows an error and keeps the login form visible', async ({ page }) => {
    await mockAuth(page, { succeeds: false });
    await page.goto('/admin/');

    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.locator('#login-error')).toContainText(/incorrect password/i);
    await expect(page.getByRole('heading', { name: 'Add a Recipe' })).toBeHidden();
  });

  test('correct password reveals the add-a-recipe form', async ({ page }) => {
    await mockAuth(page, { succeeds: true });
    await page.goto('/admin/');

    await page.getByLabel('Password').fill('correct-password');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByRole('heading', { name: 'Add a Recipe' })).toBeVisible();
    await expect(page.locator('#login-section')).toBeHidden();
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

  test('submits the expected payload, including photo upload', async ({ page }) => {
    let insertedBody = null;
    await mockRecipesTable(page, {
      bySlug: {},
      onInsert: (body) => {
        insertedBody = body;
      },
    });
    await mockPhotoUpload(page, { succeeds: true });

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
    expect(insertedBody).toMatchObject({
      title: 'Test Sourdough',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      yield_text: '1 loaf',
      notes: 'Test note.',
      ingredients: 'Flour\nWater\nSalt',
      instructions: 'Mix.\nBake.',
    });
    expect(insertedBody.photo_path).toMatch(/\.jpg$/);
    expect(insertedBody.slug).toBe('test-sourdough');
  });

  test('the "View the recipe" success link points at the new slug', async ({ page }) => {
    await mockRecipesTable(page, { bySlug: {} });
    await fillRequiredFields(page);
    await page.getByRole('button', { name: 'Save Recipe' }).click();

    await expect(page.getByRole('link', { name: 'View the recipe' })).toHaveAttribute(
      'href',
      '/recipes/view?slug=test-sourdough',
    );
  });

  test('retries with a suffixed slug when the base slug is already taken', async ({ page }) => {
    let insertedBody = null;
    await mockRecipesTable(page, {
      // "test-sourdough" is taken; "test-sourdough-2" is not.
      bySlug: { 'test-sourdough': { slug: 'test-sourdough' } },
      onInsert: (body) => {
        insertedBody = body;
      },
    });

    await fillRequiredFields(page);
    await page.getByRole('button', { name: 'Save Recipe' }).click();

    await expect(page.locator('#recipe-status')).toContainText(/saved/i);
    expect(insertedBody.slug).toBe('test-sourdough-2');
  });

  test('shows an error and re-enables the submit button when saving fails', async ({ page }) => {
    await mockRecipesTable(page, {
      bySlug: {},
      onInsert: () => ({ status: 500, body: { message: 'boom' } }),
    });

    await fillRequiredFields(page);
    const submitButton = page.getByRole('button', { name: 'Save Recipe' });
    await submitButton.click();

    await expect(page.locator('#recipe-status')).toContainText(/could not save the recipe/i);
    await expect(submitButton).toBeEnabled();
  });
});
