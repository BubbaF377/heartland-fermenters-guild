import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the header banner image', async ({ page }) => {
    const banner = page.locator('.hero-image');
    await expect(banner).toBeVisible();
    // A broken image has naturalWidth 0; confirm it actually loaded.
    await expect(async () => {
      const naturalWidth = await banner.evaluate((img) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }).toPass();
  });

  test('does not show the circular crest logo on the landing page', async ({ page }) => {
    await expect(page.locator('.crest-wrap')).toHaveCount(0);
  });

  test('shows a welcome paragraph explaining the guild', async ({ page }) => {
    const welcome = page.locator('.welcome');
    await expect(welcome).toBeVisible();
    await expect(welcome).toContainText(/fermented/i);
  });

  test('shows the Join the Conversation section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Join the Conversation' })).toBeVisible();
  });

  test('email link uses a mailto: address', async ({ page }) => {
    const link = page.getByRole('link', { name: /Email the Guild/i });
    await expect(link).toHaveAttribute('href', /^mailto:/);
  });

  test('Facebook Page and Group links point to different destinations', async ({ page }) => {
    const pageLink = page.getByRole('link', { name: /Facebook Page/i });
    const groupLink = page.getByRole('link', { name: /Facebook Group/i });
    await expect(pageLink).toHaveAttribute('href', /facebook\.com\/profile\.php/);
    await expect(groupLink).toHaveAttribute('href', /facebook\.com\/groups/);
    await expect(pageLink).toHaveAttribute('target', '_blank');
    await expect(groupLink).toHaveAttribute('target', '_blank');
  });

  test('Instagram link points to the guild profile', async ({ page }) => {
    const link = page.getByRole('link', { name: /Instagram/i });
    await expect(link).toHaveAttribute('href', /instagram\.com\/heartlandfermentersguild/);
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('Meetup link points to the guild group', async ({ page }) => {
    const link = page.getByRole('link', { name: /Meetup/i });
    await expect(link).toHaveAttribute('href', /meetup\.com\/heartland-fermenters-guild/);
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('YouTube link points to the guild channel', async ({ page }) => {
    const link = page.getByRole('link', { name: /YouTube/i });
    await expect(link).toHaveAttribute('href', 'https://www.youtube.com/@HeartlandFermentersGuild');
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('footer shows copyright and the Starter Culture Studio logo', async ({ page }) => {
    await expect(page.locator('.site-footer')).toContainText(/Heartland Fermenters Guild/);
    await expect(page.locator('.starter-culture-logo')).toBeVisible();
  });
});
