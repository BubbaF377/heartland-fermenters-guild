// Helpers for running e2e specs against the Firebase Local Emulator Suite (started
// around the Playwright run by `npm run test:e2e` — see package.json). Unlike the
// old Supabase network mocks, nothing here fakes a response: specs seed real
// documents/users/files into the emulators, drive the real UI, then read the
// emulators' state back to assert on what actually got written — with the real
// firestore.rules and storage.rules enforced the whole way.
//
// Seeding and read-back go through @firebase/rules-unit-testing with rules
// disabled, so fixtures can put the database in any state (e.g. a pending recipe)
// without needing a signed-in user who'd be allowed to create it.
import { test as baseTest, expect } from '@playwright/test';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { Timestamp, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { getMetadata, ref, uploadBytes } from 'firebase/storage';
import { ADMIN_EMAIL, RECIPE_PHOTOS_PATH } from '../../src/lib/constants.js';

// Must match EMULATOR_PROJECT_ID in src/lib/firebase-app.js and the --project flag in
// package.json's test scripts.
export const PROJECT_ID = 'demo-heartland-fermenters-guild';
export const ADMIN_PASSWORD = 'test-admin-password';
const AUTH_EMULATOR = 'http://127.0.0.1:9099';
// The bucket the site itself uses under the emulators (src/lib/firebase.js) — the
// test library's own default bucket name differs, so it's passed explicitly.
const BUCKET = `gs://${PROJECT_ID}.appspot.com`;

let testEnvPromise;
function testEnv() {
  testEnvPromise ??= initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { host: '127.0.0.1', port: 8180 },
    storage: { host: '127.0.0.1', port: 9199 },
  });
  return testEnvPromise;
}

async function asAdminBypass(callback) {
  const env = await testEnv();
  let result;
  await env.withSecurityRulesDisabled(async (context) => {
    result = await callback(context);
  });
  return result;
}

// Wipes every emulator back to empty. Specs share one set of emulators and run
// one at a time (workers: 1 in playwright.config.js), so each starts clean.
export async function resetEmulators() {
  const env = await testEnv();
  await env.clearFirestore();
  await env.clearStorage();
  await fetch(`${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/accounts`, { method: 'DELETE' });
}

// A tiny valid PNG, so a seeded photo_path points at a real, loadable object.
const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

// Fixtures use plain objects with an ISO created_at string and the slug as a
// field; stored documents use the slug as their ID and a Timestamp.
export async function seedRecipes(recipes) {
  await asAdminBypass(async (context) => {
    for (const { slug, created_at, ...fields } of recipes) {
      await setDoc(doc(context.firestore(), 'recipes', slug), {
        ...fields,
        created_at: Timestamp.fromDate(new Date(created_at)),
      });
      if (fields.photo_path) {
        await uploadBytes(ref(context.storage(BUCKET), `${RECIPE_PHOTOS_PATH}/${fields.photo_path}`), PIXEL_PNG, {
          contentType: 'image/png',
        });
      }
    }
  });
}

// A member is stored under their email, or under `id` when they have none
// (the admin page generates a no-email-… ID for those).
export async function seedMembers(members) {
  await asAdminBypass(async (context) => {
    for (const { email, id, created_at, ...fields } of members) {
      await setDoc(doc(context.firestore(), 'active_members', email ?? id), {
        ...fields,
        created_at: Timestamp.fromDate(new Date(created_at)),
      });
    }
  });
}

// Returns the stored recipe's fields (created_at left as a Timestamp), or null.
export async function getRecipe(slug) {
  return asAdminBypass(async (context) => {
    const snap = await getDoc(doc(context.firestore(), 'recipes', slug));
    return snap.exists() ? snap.data() : null;
  });
}

export async function listRecipeSlugs() {
  return asAdminBypass(async (context) => {
    const snapshot = await getDocs(collection(context.firestore(), 'recipes'));
    return snapshot.docs.map((snap) => snap.id).sort();
  });
}

// Looks a member up by their document ID: their email, or a no-email-… ID.
export async function getMember(id) {
  return asAdminBypass(async (context) => {
    const snap = await getDoc(doc(context.firestore(), 'active_members', id));
    return snap.exists() ? snap.data() : null;
  });
}

// Every roster entry, with its document ID as `id`.
export async function listMembers() {
  return asAdminBypass(async (context) => {
    const snapshot = await getDocs(collection(context.firestore(), 'active_members'));
    return snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() }));
  });
}

export async function photoExists(photoPath) {
  return asAdminBypass(async (context) => {
    try {
      await getMetadata(ref(context.storage(BUCKET), `${RECIPE_PHOTOS_PATH}/${photoPath}`));
      return true;
    } catch {
      return false;
    }
  });
}

async function authEmulatorPost(endpoint, body) {
  const response = await fetch(`${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/${endpoint}?key=demo-api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Auth emulator ${endpoint} failed: ${await response.text()}`);
  return response.json();
}

// The one shared admin account — in production this is created by hand in the
// Firebase console (see README.md).
export async function createAdminUser() {
  await authEmulatorPost('accounts:signUp', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, returnSecureToken: true });
}

// Every email-link sign-in the Auth emulator "sent," newest last.
export async function emailLinkCodesFor(email) {
  const response = await fetch(`${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/oobCodes`);
  const { oobCodes } = await response.json();
  return oobCodes.filter((code) => code.email === email && code.requestType === 'EMAIL_SIGNIN');
}

// Has the Auth emulator issue a login link for `email` (as if the member had
// requested it), and returns the /submit/ URL that link would land on.
export async function requestEmailLink(email) {
  await authEmulatorPost('accounts:sendOobCode', {
    requestType: 'EMAIL_SIGNIN',
    email,
    continueUrl: 'http://localhost:4329/submit/',
    canHandleCodeInApp: true,
  });
  const codes = await emailLinkCodesFor(email);
  const { oobCode } = codes[codes.length - 1];
  return `/submit/?mode=signIn&oobCode=${encodeURIComponent(oobCode)}&apiKey=demo-api-key&lang=en`;
}

// Signs a member in through the real email-link flow: request a link, then open
// it in the same browser that "requested" it (so the page finds the email it
// remembered and completes sign-in without asking again).
export async function signInAsMember(page, email) {
  const link = await requestEmailLink(email);
  await page.goto('/submit/');
  await page.evaluate((value) => window.localStorage.setItem('hfg-member-login-email', value), email);
  await page.goto(link);
  await page.locator('#submit-section').waitFor();
}

// Logs in through the real UI rather than poking at DOM state directly, so each
// spec exercises the actual login flow. Seeds any recipes/members first, since
// logging in immediately loads both admin lists. Lands on Recipes → Stored
// Recipes, the admin page's default view.
export async function loginAsAdmin(page, { recipes = [], members = [] } = {}) {
  await seedRecipes(recipes);
  await seedMembers(members);
  await createAdminUser();
  await page.goto('/admin/');
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('tab', { name: 'Stored Recipes' }).waitFor();
}

// Opens an admin tab or Recipes sub-tab by its label: 'Members', 'Pending
// Recipes', 'Add a Recipe', ...
export async function openAdminTab(page, name) {
  await page.getByRole('tab', { name }).click();
}

// Specs import `test`/`expect` from here instead of @playwright/test, so every test
// automatically starts against empty emulators.
export const test = baseTest.extend({
  cleanEmulators: [
    async ({}, use) => {
      await resetEmulators();
      await use();
    },
    { auto: true },
  ],
});

export { expect };
