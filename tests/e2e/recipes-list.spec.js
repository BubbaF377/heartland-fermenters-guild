import { test, expect, seedRecipes } from './emulator.js';
import { fullRecipe, minimalRecipe, pendingRecipe, deactivatedRecipe } from './fixtures/recipes.js';

test.describe('Recipes list page', () => {
  test('renders a card per recipe with title, category, summary, and meta', async ({ page }) => {
    await seedRecipes([fullRecipe, minimalRecipe]);
    await page.goto('/recipes/');

    const cards = page.locator('.recipe-card');
    await expect(cards).toHaveCount(2);

    const first = cards.first();
    await expect(first).toContainText(fullRecipe.title);
    await expect(first).toContainText(fullRecipe.category);
    await expect(first).toContainText(fullRecipe.summary);
    await expect(first).toContainText(fullRecipe.submitted_by);
  });

  test('shows a photo thumbnail only for recipes with a photo', async ({ page }) => {
    await seedRecipes([fullRecipe, minimalRecipe]);
    await page.goto('/recipes/');

    const cards = page.locator('.recipe-card');
    await expect(cards.nth(0).locator('.card-thumb')).toHaveCount(1);
    await expect(cards.nth(1).locator('.card-thumb')).toHaveCount(0);
  });

  test('shows only published recipes — never pending or deactivated ones', async ({ page }) => {
    await seedRecipes([fullRecipe, pendingRecipe, deactivatedRecipe]);
    await page.goto('/recipes/');

    const cards = page.locator('.recipe-card');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText(fullRecipe.title);
  });

  test('shows an empty-state message when there are no recipes', async ({ page }) => {
    await page.goto('/recipes/');

    await expect(page.locator('#recipes-status')).toContainText(/no recipes yet/i);
    await expect(page.locator('.recipe-card')).toHaveCount(0);
  });

  test('footer stays pinned to the bottom of the viewport when the page is short', async ({ page }) => {
    // A short page (e.g. the empty-recipes state) shouldn't leave the footer
    // stranded right under the content — it should sit at the viewport bottom.
    await page.goto('/recipes/');

    const viewport = page.viewportSize();
    const footerBox = await page.locator('.site-footer').boundingBox();
    expect(footerBox.y + footerBox.height).toBeGreaterThanOrEqual(viewport.height - 1);
  });

  test('shows an error message when the recipes fetch fails', async ({ page }) => {
    await page.route('http://127.0.0.1:8180/**', (route) => route.abort());
    await page.goto('/recipes/');

    await expect(page.locator('#recipes-status')).toContainText(/could not load recipes/i);
  });

  test('recipe card links to the detail page for its slug', async ({ page }) => {
    await seedRecipes([fullRecipe]);
    await page.goto('/recipes/');

    await expect(page.locator('.recipe-card').first()).toHaveAttribute(
      'href',
      `/recipes/view?slug=${fullRecipe.slug}`,
    );
  });
});
