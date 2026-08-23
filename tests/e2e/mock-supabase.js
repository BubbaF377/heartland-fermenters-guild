// Route-mocking helpers for Supabase's REST/Auth/Storage endpoints, verified against
// the actual installed @supabase/supabase-js client (not guessed from docs) — see
// project history for how these exact shapes were confirmed. Must match the fake
// PUBLIC_SUPABASE_URL set in playwright.config.js's webServer env.
export const SUPABASE_URL = 'https://test-project.supabase.co';

// Mocks the `recipes` table for both read (list / single-by-slug, used by the
// recipes list, detail, and admin slug-availability check) and insert (admin submit).
//
// `list` answers plain list queries (recipes/index.astro).
// `bySlug` is a { [slug]: recipeRow } map answering `?slug=eq.<slug>` queries — used
// both for the detail page's lookup and the admin form's slug-collision check (an
// entry present means "taken", absent means "available").
// `onInsert(body)` is called with the parsed insert payload; if provided, it can
// throw or return { status, body } to simulate an insert failure.
export async function mockRecipesTable(page, { list = [], bySlug = {}, onInsert } = {}) {
  await page.route(`${SUPABASE_URL}/rest/v1/recipes**`, async (route) => {
    const request = route.request();

    if (request.method() === 'POST') {
      const body = request.postDataJSON();
      const failure = onInsert?.(body);
      if (failure) {
        return route.fulfill({
          status: failure.status,
          contentType: 'application/json',
          body: JSON.stringify(failure.body),
        });
      }
      // A real insert (no .select() chained) returns 201 with an empty body.
      return route.fulfill({ status: 201, contentType: 'application/json', body: '' });
    }

    const url = new URL(request.url());
    const slugFilter = url.searchParams.get('slug'); // e.g. "eq.classic-sourdough-boule"
    if (slugFilter) {
      const slug = slugFilter.replace(/^eq\./, '');
      const match = bySlug[slug];
      // .maybeSingle() unwraps a one-item array client-side; an empty array becomes
      // { data: null, error: null } — that's the real "not found" shape, not a 406.
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(match ? [match] : []),
      });
    }

    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(list) });
  });
}

// Mocks password sign-in. Omit `password` to accept any password; pass it to only
// succeed for that exact value (so a wrong-password test can share the same mock).
export async function mockAuth(page, { succeeds = true, password } = {}) {
  await page.route(`${SUPABASE_URL}/auth/v1/token**`, async (route) => {
    const body = route.request().postDataJSON();
    const isCorrect = succeeds && (password === undefined || body.password === password);

    if (isCorrect) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'test-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          refresh_token: 'test-refresh-token',
          user: {
            id: 'test-admin-id',
            email: 'admin@heartlandfermentersguild.org',
            aud: 'authenticated',
            role: 'authenticated',
          },
        }),
      });
    }

    return route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials' }),
    });
  });
}

export async function mockPhotoUpload(page, { succeeds = true } = {}) {
  await page.route(`${SUPABASE_URL}/storage/v1/object/recipe-photos/**`, async (route) => {
    if (succeeds) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ Key: 'recipe-photos/mock.jpg', Id: 'mock-id' }),
      });
    }
    return route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Upload failed' }),
    });
  });
}

// Logs in through the real UI (mocking only the network) rather than poking at DOM
// state directly, so the test exercises the actual login flow.
export async function loginAsAdmin(page) {
  await mockAuth(page, { succeeds: true });
  await page.goto('/admin/');
  await page.getByLabel('Password').fill('whatever-the-mock-accepts');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('heading', { name: 'Add a Recipe' }).waitFor();
}
