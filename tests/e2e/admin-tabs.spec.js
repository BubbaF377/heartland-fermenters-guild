import { test, expect, loginAsAdmin, openAdminTab } from './emulator.js';
import { fullRecipe, pendingRecipe } from './fixtures/recipes.js';

const pendingTwo = { ...pendingRecipe, slug: 'second-submission', title: 'Second Submission' };

function tab(page, name) {
  return page.getByRole('tab', { name });
}

test.describe('Admin — Recipes and Members tabs', () => {
  test('opens on Recipes → Stored Recipes', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [fullRecipe] });

    await expect(tab(page, 'Recipes').first()).toHaveAttribute('aria-selected', 'true');
    await expect(tab(page, 'Stored Recipes')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#recipe-list .recipe-row')).toBeVisible();
    await expect(page.locator('#pending-list')).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Add a Recipe' })).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Members' })).toBeHidden();
  });

  test('each Recipes sub-tab shows only its own section', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [fullRecipe, pendingRecipe] });

    await openAdminTab(page, 'Pending Recipes');
    await expect(page.locator('#pending-list .recipe-row')).toBeVisible();
    await expect(page.locator('#recipe-list')).toBeHidden();

    await openAdminTab(page, 'Add a Recipe');
    await expect(page.getByRole('heading', { name: 'Add a Recipe' })).toBeVisible();
    await expect(page.locator('#pending-list')).toBeHidden();
  });

  test('the Pending Recipes tab shows how many submissions are waiting', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [pendingRecipe, pendingTwo] });
    await expect(tab(page, 'Pending Recipes')).toHaveText('Pending Recipes (2)');

    await openAdminTab(page, 'Pending Recipes');
    await page.locator('#pending-list .recipe-row').first().getByRole('button', { name: 'Approve' }).click();
    await expect(tab(page, 'Pending Recipes')).toHaveText('Pending Recipes (1)');
  });

  test('with nothing pending, the Pending tab shows no count', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [fullRecipe] });
    await expect(page.locator('#recipe-list .recipe-row')).toHaveCount(1);
    await expect(tab(page, 'Pending Recipes')).toHaveText('Pending Recipes');
  });

  test('Edit opens the form tab, renamed "Edit Recipe"; Cancel returns to Stored Recipes', async ({ page }) => {
    await loginAsAdmin(page, { recipes: [fullRecipe] });
    await page.locator('#recipe-list .recipe-row').getByRole('button', { name: 'Edit' }).click();

    await expect(tab(page, 'Edit Recipe')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByLabel('Title')).toHaveValue(fullRecipe.title);

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(tab(page, 'Stored Recipes')).toHaveAttribute('aria-selected', 'true');
    await expect(tab(page, 'Add a Recipe')).toBeVisible();
  });

  test('the Members tab opens on Member List, with Add a Member beside it', async ({ page }) => {
    await loginAsAdmin(page, {
      members: [{ name: 'Jamie Rivera', email: 'jamie@example.com', active: true, created_at: '2026-08-20T00:00:00Z' }],
    });
    await openAdminTab(page, 'Members');

    await expect(tab(page, 'Members')).toHaveAttribute('aria-selected', 'true');
    await expect(tab(page, 'Member List')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#members-list .recipe-row')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add a Member' })).toBeHidden();
    await expect(tab(page, 'Stored Recipes')).toBeHidden();

    await openAdminTab(page, 'Add a Member');
    await expect(page.getByRole('heading', { name: 'Add a Member' })).toBeVisible();
    await expect(page.locator('#members-list')).toBeHidden();
  });

  test('Edit on a member opens the form tab, renamed "Edit Member"; Cancel returns to Member List', async ({ page }) => {
    await loginAsAdmin(page, {
      members: [{ name: 'Jamie Rivera', email: 'jamie@example.com', active: true, created_at: '2026-08-20T00:00:00Z' }],
    });
    await openAdminTab(page, 'Members');
    await page.locator('#members-list .recipe-row').getByRole('button', { name: 'Edit' }).click();

    await expect(tab(page, 'Edit Member')).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByLabel('Member name')).toHaveValue('Jamie Rivera');

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(tab(page, 'Member List')).toHaveAttribute('aria-selected', 'true');
    await expect(tab(page, 'Add a Member')).toBeVisible();
  });

  test('switching top-level tabs keeps each one\'s sub-tab', async ({ page }) => {
    await loginAsAdmin(page);
    await openAdminTab(page, 'Pending Recipes');
    await openAdminTab(page, 'Members');
    await openAdminTab(page, 'Add a Member');

    await page.locator('#tab-recipes').click();
    await expect(tab(page, 'Pending Recipes')).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/\/admin\/#pending$/);

    await openAdminTab(page, 'Members');
    await expect(tab(page, 'Add a Member')).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/\/admin\/#add-member$/);
  });

  // [view, its address, the tabs to click to get there]
  for (const [name, hash, path] of [
    ['Pending Recipes', '#pending', ['Pending Recipes']],
    ['Add a Recipe', '#add-recipe', ['Add a Recipe']],
    ['Member List', '#members', ['Members']],
    ['Add a Member', '#add-member', ['Members', 'Add a Member']],
  ]) {
    test(`the "${name}" view is remembered in the address (${hash}) across a reload`, async ({ page }) => {
      await loginAsAdmin(page);
      for (const step of path) await openAdminTab(page, step);
      await expect(page).toHaveURL(new RegExp(`/admin/${hash}$`));

      await page.reload();
      await expect(tab(page, name)).toHaveAttribute('aria-selected', 'true');
    });
  }

  test('going back to Stored Recipes clears the address', async ({ page }) => {
    await loginAsAdmin(page);
    await openAdminTab(page, 'Pending Recipes');
    await openAdminTab(page, 'Stored Recipes');
    await expect(page).toHaveURL(/\/admin\/$/);
  });

  test('arrow keys, Home, and End move within each tab group; only its selected tab is in the Tab order', async ({ page }) => {
    await loginAsAdmin(page);
    const recipesTab = page.locator('#tab-recipes');
    const membersTab = tab(page, 'Members');
    await expect(recipesTab).toHaveAttribute('tabindex', '0');
    await expect(membersTab).toHaveAttribute('tabindex', '-1');

    await recipesTab.focus();
    await page.keyboard.press('ArrowRight');
    await expect(membersTab).toBeFocused();
    await expect(membersTab).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowRight'); // wraps around
    await expect(recipesTab).toBeFocused();

    const stored = tab(page, 'Stored Recipes');
    const form = tab(page, 'Add a Recipe');
    await stored.focus();
    await page.keyboard.press('End');
    await expect(form).toBeFocused();
    await expect(form).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowRight'); // wraps within the sub-tabs, not into Recipes/Members
    await expect(stored).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(form).toBeFocused();
    await page.keyboard.press('Home');
    await expect(stored).toHaveAttribute('aria-selected', 'true');
  });

  test('at phone width, list rows wrap their buttons below the title instead of overlapping it', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await loginAsAdmin(page, { recipes: [pendingRecipe] });
    await openAdminTab(page, 'Pending Recipes');

    const row = page.locator('#pending-list .recipe-row');
    const title = await row.locator('.recipe-row-title').boundingBox();
    const actions = await row.locator('.recipe-row-actions').boundingBox();
    // Buttons start below the title's line, and the title isn't squeezed.
    expect(actions.y).toBeGreaterThanOrEqual(title.y + title.height);
    const titleIsCut = await row.locator('.recipe-row-title').evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(titleIsCut).toBe(false);
    // Nothing spills past the row.
    const rowBox = await row.boundingBox();
    expect(actions.x + actions.width).toBeLessThanOrEqual(rowBox.x + rowBox.width + 1);
  });
});
