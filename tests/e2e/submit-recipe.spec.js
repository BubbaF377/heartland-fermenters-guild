import { test, expect } from '@playwright/test';
import { mockSignInWithOtp, mockMemberSession, mockRecipesTable, mockPhotoUpload } from './mock-supabase.js';

test.describe('Submit a Recipe — login', () => {
  test('requesting a login link shows a confirmation message', async ({ page }) => {
    await mockSignInWithOtp(page, { succeeds: true });
    await page.goto('/submit/');

    await page.getByLabel('Email').fill('member@example.com');
    await page.getByRole('button', { name: 'Email me a login link' }).click();

    await expect(page.locator('#login-status')).toContainText(/check member@example\.com/i);
    await expect(page.locator('#submit-section')).toBeHidden();
  });

  test('shows an error if the login link request fails', async ({ page }) => {
    await mockSignInWithOtp(page, { succeeds: false });
    await page.goto('/submit/');

    await page.getByLabel('Email').fill('member@example.com');
    await page.getByRole('button', { name: 'Email me a login link' }).click();

    await expect(page.locator('#login-status')).toContainText(/could not send/i);
  });
});

test.describe('Submit a Recipe — authenticated member', () => {
  test('an already-authenticated session (post magic-link) shows the recipe form', async ({ page }) => {
    await mockMemberSession(page, { email: 'jamie@example.com' });
    await page.goto('/submit/');

    await expect(page.locator('#login-section')).toBeHidden();
    await expect(page.locator('#logged-in-as')).toContainText('jamie@example.com');
    await expect(page.getByRole('button', { name: 'Submit Recipe' })).toBeVisible();
  });

  test('the default category (Beer) shows its suggested stages with no interaction at all', async ({ page }) => {
    // Regression: Beer is the <select>'s first option, already selected on load
    // with no "change" event ever firing for it — a member who submits without
    // touching the category dropdown must still see suggested stages.
    await mockMemberSession(page, { email: 'jamie@example.com' });
    await page.goto('/submit/');

    await expect(page.getByLabel('Category')).toHaveValue('Beer');
    const rows = page.locator('.stage-row');
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0).locator('.stage-label')).toHaveValue('Prep');
  });

  test('submitting inserts the recipe as pending', async ({ page }) => {
    let insertedBody = null;
    await mockMemberSession(page, { email: 'jamie@example.com' });
    await mockRecipesTable(page, {
      bySlug: {},
      onInsert: (body) => {
        insertedBody = body;
      },
    });
    await mockPhotoUpload(page, { succeeds: true });

    await page.goto('/submit/');
    await page.getByLabel('Title').fill('Test Submission');
    await page.getByLabel(/^Ingredients/).fill('Flour\nWater\nSalt');
    await page.getByLabel(/^Instructions/).fill('Mix.\nBake.');
    await page.getByRole('button', { name: 'Submit Recipe' }).click();

    await expect(page.locator('#recipe-status')).toContainText(/waiting for admin review/i);
    expect(insertedBody).toMatchObject({
      title: 'Test Submission',
      status: 'pending',
      slug: 'test-submission',
    });
  });

  test('shows a friendly message when the submitter is not an active member', async ({ page }) => {
    await mockMemberSession(page, { email: 'stranger@example.com' });
    await mockRecipesTable(page, {
      bySlug: {},
      onInsert: () => ({
        status: 403,
        body: { code: '42501', message: 'new row violates row-level security policy for table "recipes"' },
      }),
    });

    await page.goto('/submit/');
    await page.getByLabel('Title').fill('Test Submission');
    await page.getByLabel(/^Ingredients/).fill('Flour');
    await page.getByLabel(/^Instructions/).fill('Mix.');
    await page.getByRole('button', { name: 'Submit Recipe' }).click();

    await expect(page.locator('#recipe-status')).toContainText(/isn't on the active member list/i);
  });

  test('logging out returns to the login form', async ({ page }) => {
    await mockMemberSession(page, { email: 'jamie@example.com' });
    await page.goto('/submit/');
    await expect(page.locator('#submit-section')).toBeVisible();

    await page.getByRole('button', { name: 'Log out' }).click();

    await expect(page.locator('#login-section')).toBeVisible();
    await expect(page.locator('#submit-section')).toBeHidden();
  });
});
