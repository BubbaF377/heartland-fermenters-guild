import {
  test,
  expect,
  emailLinkCodesFor,
  getRecipe,
  listRecipeSlugs,
  photoExists,
  requestEmailLink,
  seedMembers,
  seedRecipes,
  signInAsMember,
} from './emulator.js';
import { pendingRecipe } from './fixtures/recipes.js';

const MEMBER_EMAIL = 'jamie@example.com';

async function fillRequiredFields(page, title = 'Test Submission') {
  await page.getByLabel('Title').fill(title);
  await page.getByLabel(/^Ingredients/).fill('Flour\nWater\nSalt');
  await page.getByLabel(/^Instructions/).fill('Mix.\nBake.');
}

test.describe('Submit a Recipe — login', () => {
  test('requesting a login link sends one and shows a confirmation message', async ({ page }) => {
    await page.goto('/submit/');

    await page.getByLabel('Email').fill(MEMBER_EMAIL);
    await page.getByRole('button', { name: 'Email me a login link' }).click();

    await expect(page.locator('#login-status')).toContainText(/check jamie@example\.com/i);
    await expect(page.locator('#submit-section')).toBeHidden();
    expect(await emailLinkCodesFor(MEMBER_EMAIL)).toHaveLength(1);
  });

  test('shows an error if the login link request fails', async ({ page }) => {
    await page.route('**/accounts:sendOobCode**', (route) => route.abort());
    await page.goto('/submit/');

    await page.getByLabel('Email').fill(MEMBER_EMAIL);
    await page.getByRole('button', { name: 'Email me a login link' }).click();

    await expect(page.locator('#login-status')).toContainText(/could not send/i);
  });

  test('opening the link in the same browser signs in and cleans up the URL', async ({ page }) => {
    await signInAsMember(page, MEMBER_EMAIL);

    await expect(page.locator('#login-section')).toBeHidden();
    await expect(page.locator('#logged-in-as')).toContainText(MEMBER_EMAIL);
    await expect(page).toHaveURL(/\/submit\/$/);
  });

  test('opening the link in a different browser asks for the email first', async ({ page }) => {
    const link = await requestEmailLink(MEMBER_EMAIL);
    await page.goto(link);

    await expect(page.locator('#login-status')).toContainText(/confirm the email/i);
    await page.getByLabel('Email').fill(MEMBER_EMAIL);
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.locator('#logged-in-as')).toContainText(MEMBER_EMAIL);
  });

  test('a returning member stays signed in across reloads', async ({ page }) => {
    await signInAsMember(page, MEMBER_EMAIL);
    await page.reload();

    await expect(page.locator('#submit-section')).toBeVisible();
    await expect(page.locator('#logged-in-as')).toContainText(MEMBER_EMAIL);
  });
});

test.describe('Submit a Recipe — signed-in member', () => {
  test.beforeEach(async () => {
    await seedMembers([{ email: MEMBER_EMAIL, active: true, created_at: '2026-08-20T00:00:00Z' }]);
  });

  test('the default category (Beer) shows its suggested stages with no interaction at all', async ({ page }) => {
    // Regression: Beer is the <select>'s first option, already selected on load
    // with no "change" event ever firing for it — a member who submits without
    // touching the category dropdown must still see suggested stages.
    await signInAsMember(page, MEMBER_EMAIL);

    await expect(page.getByLabel('Category')).toHaveValue('Beer');
    const rows = page.locator('.stage-row');
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0).locator('.stage-label')).toHaveValue('Prep');
  });

  test('submitting stores the recipe as pending, with its photo', async ({ page }) => {
    await signInAsMember(page, MEMBER_EMAIL);
    await fillRequiredFields(page);
    await page.setInputFiles('#photo', {
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data'),
    });
    await page.getByRole('button', { name: 'Submit Recipe' }).click();

    await expect(page.locator('#recipe-status')).toContainText(/waiting for admin review/i);
    const saved = await getRecipe('test-submission');
    expect(saved).toMatchObject({ title: 'Test Submission', status: 'pending' });
    expect(await photoExists(saved.photo_path)).toBe(true);
  });

  test('a title colliding with a pending recipe gets a suffixed slug, even though members can\'t read it', async ({ page }) => {
    await seedRecipes([pendingRecipe]);
    await signInAsMember(page, MEMBER_EMAIL);
    await fillRequiredFields(page, pendingRecipe.title);
    await page.getByRole('button', { name: 'Submit Recipe' }).click();

    await expect(page.locator('#recipe-status')).toContainText(/waiting for admin review/i);
    expect(await listRecipeSlugs()).toEqual([pendingRecipe.slug, `${pendingRecipe.slug}-2`]);
    expect((await getRecipe(pendingRecipe.slug)).submitted_by).toBe(pendingRecipe.submitted_by);
  });

  test('shows a friendly message, and saves nothing, when the submitter is not an active member', async ({ page }) => {
    await seedMembers([{ email: 'former@example.com', active: false, created_at: '2026-08-20T00:00:00Z' }]);
    await signInAsMember(page, 'former@example.com');
    await fillRequiredFields(page);
    await page.getByRole('button', { name: 'Submit Recipe' }).click();

    await expect(page.locator('#recipe-status')).toContainText(/isn't on the active member list/i);
    expect(await listRecipeSlugs()).toEqual([]);
  });

  test('logging out returns to the login form', async ({ page }) => {
    await signInAsMember(page, MEMBER_EMAIL);

    await page.getByRole('button', { name: 'Log out' }).click();

    await expect(page.locator('#login-section')).toBeVisible();
    await expect(page.locator('#submit-section')).toBeHidden();
  });
});
