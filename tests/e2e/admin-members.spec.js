import { test, expect } from '@playwright/test';
import { loginAsAdmin, mockMembersTable } from './mock-supabase.js';

const activeMember = {
  id: 'member-1',
  email: 'jamie@example.com',
  active: true,
  created_at: '2026-08-20T00:00:00Z',
};

const inactiveMember = {
  id: 'member-2',
  email: 'alex@example.com',
  active: false,
  created_at: '2026-08-10T00:00:00Z',
};

test.describe('Admin — members', () => {
  test('lists members with their active status', async ({ page }) => {
    await loginAsAdmin(page, {}, { list: [activeMember, inactiveMember] });

    const rows = page.locator('#members-list .recipe-row');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText(activeMember.email);
    await expect(rows.nth(0)).toContainText('Active');
    await expect(rows.nth(1)).toContainText(inactiveMember.email);
    await expect(rows.nth(1)).toContainText('Deactivated');
  });

  test('shows a message when there are no members yet', async ({ page }) => {
    await loginAsAdmin(page, {}, { list: [] });
    await expect(page.locator('#members-status')).toContainText(/no members yet/i);
    await expect(page.locator('#members-list .recipe-row')).toHaveCount(0);
  });

  test('adding a member inserts the email and refreshes the list', async ({ page }) => {
    let insertedBody = null;
    await loginAsAdmin(page, {}, { list: [] });
    await mockMembersTable(page, {
      list: [activeMember],
      onInsert: (body) => {
        insertedBody = body;
      },
    });

    await page.getByLabel('Add a member').fill('jamie@example.com');
    await page.getByRole('button', { name: 'Add Member' }).click();

    expect(insertedBody).toEqual({ email: 'jamie@example.com' });
    await expect(page.locator('#add-member-status')).toContainText(/added jamie@example\.com/i);
    await expect(page.locator('#members-list .recipe-row')).toHaveCount(1);
  });

  test('adding a duplicate email shows a specific error', async ({ page }) => {
    await loginAsAdmin(page, {}, { list: [] });
    await mockMembersTable(page, {
      list: [],
      onInsert: () => ({
        status: 409,
        body: { code: '23505', message: 'duplicate key value violates unique constraint "active_members_email_key"' },
      }),
    });

    await page.getByLabel('Add a member').fill('jamie@example.com');
    await page.getByRole('button', { name: 'Add Member' }).click();

    await expect(page.locator('#add-member-status')).toContainText(/already a member/i);
  });

  test('Deactivate and Reactivate toggle a member\'s active flag', async ({ page }) => {
    let updatedId = null;
    let updatedBody = null;
    await loginAsAdmin(page, {}, { list: [activeMember] });
    await mockMembersTable(page, {
      list: [{ ...activeMember, active: false }],
      onUpdate: (id, body) => {
        updatedId = id;
        updatedBody = body;
      },
    });

    await page.locator('#members-list .recipe-row').getByRole('button', { name: 'Deactivate' }).click();

    expect(updatedId).toBe(activeMember.id);
    expect(updatedBody).toEqual({ active: false });
    await expect(page.locator('#members-list .recipe-row')).toContainText('Deactivated');
    await expect(page.locator('#members-list .recipe-row').getByRole('button', { name: 'Reactivate' })).toBeVisible();
  });
});
