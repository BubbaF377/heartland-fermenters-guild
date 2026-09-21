import { test, expect, loginAsAdmin } from './emulator.js';
import { pendingRecipe } from './fixtures/recipes.js';

test.describe('Admin — Recipes and Members tabs', () => {
  test('opens on the Recipes tab, with pending submissions first', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [pendingRecipe] });

    await expect(page.getByRole('tab', { name: 'Recipes' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByRole('heading', { name: 'Pending Recipes' })).toBeVisible();
    await expect(page.locator('#pending-list .recipe-row')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Add a Recipe' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Members' })).toBeHidden();
  });

  test('the Members tab shows members and hides recipes', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('tab', { name: 'Members' }).click();

    await expect(page.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: 'Members' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add a member' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pending Recipes' })).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Add a Recipe' })).toBeHidden();
  });

  test('the Members tab is remembered in the address, so a reload stays on it', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole('tab', { name: 'Members' }).click();
    await expect(page).toHaveURL(/\/admin\/#members$/);

    await page.reload();

    await expect(page.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: 'Add a member' })).toBeVisible();

    await page.getByRole('tab', { name: 'Recipes' }).click();
    await expect(page).toHaveURL(/\/admin\/$/);
  });

  test('arrow keys, Home, and End move between tabs; only the selected tab is in the Tab order', async ({ page }) => {
    await loginAsAdmin(page);
    const recipesTab = page.getByRole('tab', { name: 'Recipes' });
    const membersTab = page.getByRole('tab', { name: 'Members' });
    await expect(recipesTab).toHaveAttribute('tabindex', '0');
    await expect(membersTab).toHaveAttribute('tabindex', '-1');

    await recipesTab.focus();
    await page.keyboard.press('ArrowRight');
    await expect(membersTab).toBeFocused();
    await expect(membersTab).toHaveAttribute('aria-selected', 'true');
    await expect(membersTab).toHaveAttribute('tabindex', '0');

    await page.keyboard.press('ArrowRight'); // wraps around
    await expect(recipesTab).toBeFocused();
    await expect(recipesTab).toHaveAttribute('aria-selected', 'true');

    await page.keyboard.press('End');
    await expect(membersTab).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home');
    await expect(recipesTab).toHaveAttribute('aria-selected', 'true');
  });
});
