import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './mock-supabase.js';
import { TIME_STAGE_SUGGESTIONS } from '../../src/lib/constants.js';

test.describe('Admin — time-stage editor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  for (const [category, stages] of Object.entries(TIME_STAGE_SUGGESTIONS)) {
    test(`selecting "${category}" pre-populates its suggested stages`, async ({ page }) => {
      await page.getByLabel('Category').selectOption(category);

      const rows = page.locator('.stage-row');
      await expect(rows).toHaveCount(stages.length);
      for (let i = 0; i < stages.length; i++) {
        await expect(rows.nth(i).locator('.stage-label')).toHaveValue(stages[i]);
      }
    });
  }

  test('switching category never overwrites stages already typed in', async ({ page }) => {
    await page.getByLabel('Category').selectOption('Bread & Sourdough');
    const rows = page.locator('.stage-row');
    await expect(rows).toHaveCount(3);

    await rows.nth(1).locator('.stage-value').fill('4-6 hr');

    await page.getByLabel('Category').selectOption('Cheese');

    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0).locator('.stage-label')).toHaveValue('Prep');
    await expect(rows.nth(1).locator('.stage-label')).toHaveValue('Rise');
    await expect(rows.nth(1).locator('.stage-value')).toHaveValue('4-6 hr');
  });

  test('"+ Add stage" appends a blank row', async ({ page }) => {
    await expect(page.locator('.stage-row')).toHaveCount(0);
    await page.getByRole('button', { name: '+ Add stage' }).click();
    await expect(page.locator('.stage-row')).toHaveCount(1);
    await expect(page.locator('.stage-row .stage-label')).toHaveValue('');
  });

  test('removing a stage row deletes only that row', async ({ page }) => {
    await page.getByLabel('Category').selectOption('Bread & Sourdough');
    const rows = page.locator('.stage-row');
    await expect(rows).toHaveCount(3);

    await rows.nth(1).getByRole('button', { name: 'Remove stage' }).click();

    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0).locator('.stage-label')).toHaveValue('Prep');
    await expect(rows.nth(1).locator('.stage-label')).toHaveValue('Bake');
  });
});
