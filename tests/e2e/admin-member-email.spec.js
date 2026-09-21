import { test, expect, loginAsAdmin, openAdminTab } from './emulator.js';

const member = (email, extra = {}) => ({
  name: email.split('@')[0],
  email,
  active: true,
  created_at: '2026-08-20T00:00:00Z',
  ...extra,
});

const roster = [
  member('jamie@example.com'),
  member('alex@example.com'),
  member('former@example.com', { active: false }), // deactivated: left out
  { id: 'no-email-1', name: 'Pat Moore', phone: '4025550177', active: true, created_at: '2026-08-15T00:00:00Z' }, // no email: left out
];

async function openMemberList(page, members) {
  await loginAsAdmin(page, { members });
  await openAdminTab(page, 'Members');
  await page.locator('#members-list .recipe-row').first().waitFor();
}

// The addresses in the Email all link's BCC, in order.
async function bccAddresses(page) {
  const href = await page.getByRole('link', { name: 'Email all members' }).getAttribute('href');
  expect(href.startsWith('mailto:?bcc=')).toBe(true);
  return href.slice('mailto:?bcc='.length).split(',').map(decodeURIComponent).sort();
}

test.describe('Admin — email all members', () => {
  test('Email all members puts every active member with an email in BCC, and no one else', async ({ page }) => {
    await openMemberList(page, roster);

    await expect(page.locator('#member-email-count')).toHaveText('2 active members have an email.');
    expect(await bccAddresses(page)).toEqual(['alex@example.com', 'jamie@example.com']);
  });

  test('Copy emails copies the same addresses, comma-separated', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await openMemberList(page, roster);

    await page.getByRole('button', { name: 'Copy emails' }).click();

    await expect(page.locator('#member-email-note')).toHaveText(
      'Copied 2 emails. Paste them into the BCC field of a new message.',
    );
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied.split(', ').sort()).toEqual(['alex@example.com', 'jamie@example.com']);
  });

  test('if the browser refuses clipboard access, the emails are shown selected to copy by hand', async ({ page }) => {
    await openMemberList(page, roster);
    await page.evaluate(() => {
      navigator.clipboard.writeText = () => Promise.reject(new Error('denied'));
    });

    await page.getByRole('button', { name: 'Copy emails' }).click();

    await expect(page.locator('#member-email-note')).toContainText("Couldn't copy automatically");
    const fallback = page.getByLabel('Addresses to copy');
    await expect(fallback).toBeVisible();
    expect((await fallback.inputValue()).split(', ').sort()).toEqual(['alex@example.com', 'jamie@example.com']);
    const selected = await fallback.evaluate((el) => el.selectionEnd - el.selectionStart);
    expect(selected).toBe((await fallback.inputValue()).length);
  });

  test('with nobody to email, the buttons are hidden and the reason is shown', async ({ page }) => {
    await openMemberList(page, [roster[2], roster[3]]);

    await expect(page.locator('#member-email-count')).toHaveText('No active members have an email yet.');
    await expect(page.getByRole('link', { name: 'Email all members' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Copy emails' })).toBeHidden();
  });

  test('a list too long for one email link falls back to Copy', async ({ page }) => {
    const many = Array.from({ length: 80 }, (_, i) => member(`a-rather-long-member-address-${i}@example.com`));
    await openMemberList(page, many);

    await expect(page.locator('#member-email-count')).toHaveText('80 active members have an email.');
    await expect(page.getByRole('link', { name: 'Email all members' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Copy emails' })).toBeVisible();
    await expect(page.locator('#member-email-note')).toContainText('Too many addresses');
  });

  test('the count follows deactivating and reactivating a member', async ({ page }) => {
    await openMemberList(page, [member('jamie@example.com')]);
    await expect(page.locator('#member-email-count')).toHaveText('1 active member has an email.');

    await page.locator('#members-list .recipe-row').getByRole('button', { name: 'Deactivate' }).click();
    await expect(page.locator('#member-email-count')).toHaveText('No active members have an email yet.');

    await page.locator('#members-list .recipe-row').getByRole('button', { name: 'Reactivate' }).click();
    await expect(page.locator('#member-email-count')).toHaveText('1 active member has an email.');
  });
});
