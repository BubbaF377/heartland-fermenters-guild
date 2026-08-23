import { test, expect } from '@playwright/test';
import { mockRecipesTable } from './mock-supabase.js';
import { fullRecipe, minimalRecipe } from './fixtures/recipes.js';

test.describe('Recipes list page', () => {
  test('renders a card per recipe with title, category, summary, and meta', async ({ page }) => {
    await mockRecipesTable(page, { list: [fullRecipe, minimalRecipe] });
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
    await mockRecipesTable(page, { list: [fullRecipe, minimalRecipe] });
    await page.goto('/recipes/');

    const cards = page.locator('.recipe-card');
    await expect(cards.nth(0).locator('.card-thumb')).toHaveCount(1);
    await expect(cards.nth(1).locator('.card-thumb')).toHaveCount(0);
  });

  test('shows an empty-state message when there are no recipes', async ({ page }) => {
    await mockRecipesTable(page, { list: [] });
    await page.goto('/recipes/');

    await expect(page.locator('#recipes-status')).toContainText(/no recipes yet/i);
    await expect(page.locator('.recipe-card')).toHaveCount(0);
  });

  test('shows an error message when the recipes fetch fails', async ({ page }) => {
    await page.route('https://test-project.supabase.co/rest/v1/recipes**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'boom' }) }),
    );
    await page.goto('/recipes/');

    await expect(page.locator('#recipes-status')).toContainText(/could not load recipes/i);
  });

  test('recipe card links to the detail page for its slug', async ({ page }) => {
    await mockRecipesTable(page, { list: [fullRecipe] });
    await page.goto('/recipes/');

    await expect(page.locator('.recipe-card').first()).toHaveAttribute(
      'href',
      `/recipes/view?slug=${fullRecipe.slug}`,
    );
  });
});
