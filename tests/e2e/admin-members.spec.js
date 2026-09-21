import { test, expect, getMember, loginAsAdmin } from './emulator.js';

const activeMember = {
  email: 'jamie@example.com',
  active: true,
  created_at: '2026-08-20T00:00:00Z',
};

const inactiveMember = {
  email: 'alex@example.com',
  active: false,
  created_at: '2026-08-10T00:00:00Z',
};

test.describe('Admin — members', () => {
  test('lists members with their active status', async ({ page }) => {
    await loginAsAdmin(page, { members: [activeMember, inactiveMember] });

    const rows = page.locator('#members-list .recipe-row');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText(activeMember.email);
    await expect(rows.nth(0)).toContainText('Active');
    await expect(rows.nth(1)).toContainText(inactiveMember.email);
    await expect(rows.nth(1)).toContainText('Deactivated');
  });

  test('shows a message when there are no members yet', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator('#members-status')).toContainText(/no members yet/i);
    await expect(page.locator('#members-list .recipe-row')).toHaveCount(0);
  });

  test('adding a member stores the lowercased email as active and refreshes the list', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByLabel('Add a member').fill('Jamie@Example.com');
    await page.getByRole('button', { name: 'Add Member' }).click();

    await expect(page.locator('#add-member-status')).toContainText(/added jamie@example\.com/i);
    await expect(page.locator('#members-list .recipe-row')).toHaveCount(1);
    expect(await getMember('jamie@example.com')).toMatchObject({ active: true });
  });

  test('adding a duplicate email shows a specific error and leaves the member as-is', async ({ page }) => {
    await loginAsAdmin(page, { members: [inactiveMember] });

    await page.getByLabel('Add a member').fill(inactiveMember.email);
    await page.getByRole('button', { name: 'Add Member' }).click();

    await expect(page.locator('#add-member-status')).toContainText(/already a member/i);
    expect(await getMember(inactiveMember.email)).toMatchObject({ active: false });
  });

  test('Deactivate and Reactivate toggle a member\'s active flag', async ({ page }) => {
    await loginAsAdmin(page, { members: [activeMember] });
    const row = page.locator('#members-list .recipe-row');

    await row.getByRole('button', { name: 'Deactivate' }).click();
    await expect(row).toContainText('Deactivated');
    await expect(row.getByRole('button', { name: 'Reactivate' })).toBeVisible();
    expect(await getMember(activeMember.email)).toMatchObject({ active: false });

    await row.getByRole('button', { name: 'Reactivate' }).click();
    await expect(row.getByRole('button', { name: 'Deactivate' })).toBeVisible();
    expect(await getMember(activeMember.email)).toMatchObject({ active: true });
  });
});
