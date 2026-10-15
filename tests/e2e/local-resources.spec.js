import { test, expect } from '@playwright/test';
import localResources from '../../src/data/local-resources.json' with { type: 'json' };

// Like the Resources page, Local Resources (Requirement #22) is built from a
// bundled JSON file and reads no Firestore data, so no emulator seeding.
test.describe('Local Resources page', () => {
  test('is linked from the Resources page', async ({ page }) => {
    await page.goto('/resources/');
    await page.getByRole('link', { name: 'Local Resources' }).click();
    await expect(page).toHaveURL(/\/resources\/local\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Local Resources');
  });

  test('lists every entry under its category, with the endorsement note', async ({ page }) => {
    await page.goto('/resources/local/');
    await expect(page.locator('.disclaimer')).toHaveText('This listing is provided for reference, not as an endorsement.');
    await expect(page.locator('.local-card')).toHaveCount(localResources.length);

    const shop = localResources.find((r) => r.category === 'Supply Shops');
    const card = page.locator('#supply-shops .local-card', { hasText: shop.name });
    await expect(card.getByRole('link', { name: shop.name })).toHaveAttribute('href', shop.website);
    await expect(card.getByRole('link', { name: shop.name })).toHaveAttribute('target', '_blank');
    await expect(card).toContainText(shop.town);
    await expect(card).toContainText(/Last checked \w+ \d{4}/);
  });

  test('offers a way to suggest a spot', async ({ page }) => {
    await page.goto('/resources/local/');
    await expect(page.locator('.suggest').getByRole('link', { name: 'Let us know' })).toHaveAttribute(
      'href',
      /^mailto:makers@heartlandfermentersguild\.org/,
    );
  });
});
