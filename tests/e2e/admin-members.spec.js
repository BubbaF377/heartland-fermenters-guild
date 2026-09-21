import { test, expect, getMember, loginAsAdmin } from './emulator.js';

const activeMember = {
  name: 'Jamie Rivera',
  email: 'jamie@example.com',
  phone: '(402) 555-0134',
  active: true,
  created_at: '2026-08-20T00:00:00Z',
};

// Added before names/phones were collected — email only.
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
    await expect(rows.nth(0).locator('.recipe-row-title')).toHaveText(activeMember.name);
    await expect(rows.nth(0).locator('.member-contact')).toHaveText(`${activeMember.email} · ${activeMember.phone}`);
    await expect(rows.nth(0)).toContainText('Active');
    // No name on file: the email stands in as the title, with no contact line.
    await expect(rows.nth(1).locator('.recipe-row-title')).toHaveText(inactiveMember.email);
    await expect(rows.nth(1).locator('.member-contact')).toHaveCount(0);
    await expect(rows.nth(1)).toContainText('Deactivated');
  });

  test('shows a message when there are no members yet', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator('#members-status')).toContainText(/no members yet/i);
    await expect(page.locator('#members-list .recipe-row')).toHaveCount(0);
  });

  test('adding a member stores their name, lowercased email, and phone, as active', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByLabel('Member name').fill('Jamie Rivera');
    await page.getByLabel(/^Member email/).fill('Jamie@Example.com');
    await page.getByLabel(/^Member phone/).fill('(402) 555-0134');
    await page.getByRole('button', { name: 'Add Member' }).click();

    await expect(page.locator('#add-member-status')).toContainText('Added Jamie Rivera (jamie@example.com).');
    await expect(page.locator('#members-list .recipe-row')).toHaveCount(1);
    await expect(page.locator('#members-list .recipe-row-title')).toHaveText('Jamie Rivera');
    expect(await getMember('jamie@example.com')).toMatchObject({
      name: 'Jamie Rivera',
      phone: '(402) 555-0134',
      active: true,
    });
    // The form clears for the next member.
    await expect(page.getByLabel('Member name')).toHaveValue('');
  });

  test('phone is optional; name and email are required', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByLabel(/^Member email/).fill('sam@example.com');
    await page.getByRole('button', { name: 'Add Member' }).click();
    expect(await getMember('sam@example.com')).toBeNull();

    await page.getByLabel('Member name').fill('Sam Lee');
    await page.getByRole('button', { name: 'Add Member' }).click();

    await expect(page.locator('#add-member-status')).toContainText('Added Sam Lee');
    expect(await getMember('sam@example.com')).toMatchObject({ name: 'Sam Lee', phone: null });
  });

  test('adding a duplicate email shows a specific error and leaves the member as-is', async ({ page }) => {
    await loginAsAdmin(page, { members: [inactiveMember] });

    await page.getByLabel('Member name').fill('Someone Else');
    await page.getByLabel(/^Member email/).fill(inactiveMember.email);
    await page.getByRole('button', { name: 'Add Member' }).click();

    await expect(page.locator('#add-member-status')).toContainText(/already a member/i);
    const stored = await getMember(inactiveMember.email);
    expect(stored).toMatchObject({ active: false });
    expect(stored.name).toBeUndefined();
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
