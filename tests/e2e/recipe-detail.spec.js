import { test, expect } from '@playwright/test';
import { mockRecipesTable } from './mock-supabase.js';
import { fullRecipe, minimalRecipe } from './fixtures/recipes.js';

function expectedDate(createdAt) {
  // Mirrors the app's own formatting exactly, so this doesn't hardcode a date
  // string that would only match in one timezone.
  return new Date(createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

test.describe('Recipe detail page', () => {
  test('renders title, category, summary, ingredients, and instructions', async ({ page }) => {
    await mockRecipesTable(page, { bySlug: { [fullRecipe.slug]: fullRecipe } });
    await page.goto(`/recipes/view?slug=${fullRecipe.slug}`);

    await expect(page.locator('#recipe-title')).toHaveText(fullRecipe.title);
    await expect(page.locator('#recipe-category')).toHaveText(fullRecipe.category);
    await expect(page.locator('#recipe-summary')).toHaveText(fullRecipe.summary);
    await expect(page.locator('#recipe-ingredients li')).toHaveCount(4);
    await expect(page.locator('#recipe-instructions li')).toHaveCount(4);
  });

  test('renames Prep and Ferment stage chips, leaves other labels as typed', async ({ page }) => {
    await mockRecipesTable(page, { bySlug: { [fullRecipe.slug]: fullRecipe } });
    await page.goto(`/recipes/view?slug=${fullRecipe.slug}`);

    const strip = page.locator('#recipe-meta-strip');
    await expect(strip.getByText('Active prep', { exact: true })).toBeVisible();
    await expect(strip.getByText('30 min', { exact: true })).toBeVisible();
    await expect(strip.getByText('Rise', { exact: true })).toBeVisible();
    await expect(strip.getByText('Cold Proof', { exact: true })).toBeVisible();
    await expect(strip.getByText('Bake', { exact: true })).toBeVisible();
  });

  test('shows the yield chip and the "Makes ..." line in the ingredients column', async ({ page }) => {
    await mockRecipesTable(page, { bySlug: { [fullRecipe.slug]: fullRecipe } });
    await page.goto(`/recipes/view?slug=${fullRecipe.slug}`);

    await expect(page.locator('#recipe-meta-strip')).toContainText(fullRecipe.yield_text);
    await expect(page.locator('#recipe-yield')).toHaveText(`Makes ${fullRecipe.yield_text}`);
  });

  test('shows the submitted-by/date chip, with and without a submitter name', async ({ page }) => {
    await mockRecipesTable(page, {
      bySlug: { [fullRecipe.slug]: fullRecipe, [minimalRecipe.slug]: minimalRecipe },
    });

    await page.goto(`/recipes/view?slug=${fullRecipe.slug}`);
    await expect(page.locator('#recipe-meta-strip')).toContainText(
      `${fullRecipe.submitted_by} · ${expectedDate(fullRecipe.created_at)}`,
    );

    await page.goto(`/recipes/view?slug=${minimalRecipe.slug}`);
    await expect(page.locator('#recipe-meta-strip')).toContainText(expectedDate(minimalRecipe.created_at));
  });

  test('shows notes only when present', async ({ page }) => {
    await mockRecipesTable(page, {
      bySlug: { [fullRecipe.slug]: fullRecipe, [minimalRecipe.slug]: minimalRecipe },
    });

    await page.goto(`/recipes/view?slug=${fullRecipe.slug}`);
    await expect(page.locator('#recipe-notes')).toBeVisible();
    await expect(page.locator('#recipe-notes-text')).toHaveText(fullRecipe.notes);

    await page.goto(`/recipes/view?slug=${minimalRecipe.slug}`);
    await expect(page.locator('#recipe-notes')).toBeHidden();
  });

  test('photo and video render independently of each other', async ({ page }) => {
    const both = fullRecipe;
    const photoOnly = { ...fullRecipe, slug: 'photo-only', video_url: null };
    const videoOnly = { ...fullRecipe, slug: 'video-only', photo_path: null };
    const neither = minimalRecipe;

    await mockRecipesTable(page, {
      bySlug: {
        [both.slug]: both,
        [photoOnly.slug]: photoOnly,
        [videoOnly.slug]: videoOnly,
        [neither.slug]: neither,
      },
    });

    await page.goto(`/recipes/view?slug=${both.slug}`);
    await expect(page.locator('#recipe-photo')).toBeVisible();
    await expect(page.locator('#recipe-video')).toBeVisible();

    await page.goto(`/recipes/view?slug=${photoOnly.slug}`);
    await expect(page.locator('#recipe-photo')).toBeVisible();
    await expect(page.locator('#recipe-video')).toBeHidden();

    await page.goto(`/recipes/view?slug=${videoOnly.slug}`);
    await expect(page.locator('#recipe-photo')).toBeHidden();
    await expect(page.locator('#recipe-video')).toBeVisible();

    await page.goto(`/recipes/view?slug=${neither.slug}`);
    await expect(page.locator('#recipe-photo')).toBeHidden();
    await expect(page.locator('#recipe-video')).toBeHidden();
  });

  test('shows a message when no slug is given', async ({ page }) => {
    await page.goto('/recipes/view');
    await expect(page.locator('#recipe-status')).toContainText(/no recipe was specified/i);
  });

  test('shows a not-found message for an unknown slug', async ({ page }) => {
    await mockRecipesTable(page, { bySlug: {} });
    await page.goto('/recipes/view?slug=does-not-exist');
    await expect(page.locator('#recipe-status')).toContainText(/couldn.t be found/i);
  });
});
