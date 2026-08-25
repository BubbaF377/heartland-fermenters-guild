// Route-mocking helpers for Supabase's REST/Auth/Storage endpoints, verified against
// the actual installed @supabase/supabase-js client (not guessed from docs) — see
// project history for how these exact shapes were confirmed. Must match the fake
// PUBLIC_SUPABASE_URL set in playwright.config.js's webServer env.
export const SUPABASE_URL = 'https://test-project.supabase.co';

// Mocks the `recipes` table for read (list / single-by-slug), insert, update, and
// delete — everything the public pages and the admin form/list do.
//
// `list` answers plain list queries (recipes/index.astro and the admin recipe list).
// `bySlug` is a { [slug]: recipeRow } map answering `?slug=eq.<slug>` queries — used
// both for the detail page's lookup and the admin form's slug-collision check (an
// entry present means "taken", absent means "available").
// `onInsert(body)` / `onUpdate(id, body)` / `onDelete(id)` are called with the parsed
// request; each can return { status, body } to simulate that request failing.
export async function mockRecipesTable(
  page,
  { list = [], bySlug = {}, onInsert, onUpdate, onDelete } = {},
) {
  await page.route(`${SUPABASE_URL}/rest/v1/recipes**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const idFilter = url.searchParams.get('id'); // e.g. "eq.abc-123"
    const id = idFilter ? idFilter.replace(/^eq\./, '') : null;

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

    if (request.method() === 'PATCH') {
      const body = request.postDataJSON();
      const failure = onUpdate?.(id, body);
      if (failure) {
        return route.fulfill({
          status: failure.status,
          contentType: 'application/json',
          body: JSON.stringify(failure.body),
        });
      }
      // A real update (no .select() chained) returns 204 with an empty body.
      return route.fulfill({ status: 204, contentType: 'application/json', body: '' });
    }

    if (request.method() === 'DELETE') {
      const failure = onDelete?.(id);
      if (failure) {
        return route.fulfill({
          status: failure.status,
          contentType: 'application/json',
          body: JSON.stringify(failure.body),
        });
      }
      return route.fulfill({ status: 204, contentType: 'application/json', body: '' });
    }

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

// Mocks the `active_members` table — list, insert (add a member), and update
// (toggle active). Same shape/conventions as mockRecipesTable.
export async function mockMembersTable(page, { list = [], onInsert, onUpdate } = {}) {
  await page.route(`${SUPABASE_URL}/rest/v1/active_members**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const idFilter = url.searchParams.get('id');
    const id = idFilter ? idFilter.replace(/^eq\./, '') : null;

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
      return route.fulfill({ status: 201, contentType: 'application/json', body: '' });
    }

    if (request.method() === 'PATCH') {
      const body = request.postDataJSON();
      const failure = onUpdate?.(id, body);
      if (failure) {
        return route.fulfill({
          status: failure.status,
          contentType: 'application/json',
          body: JSON.stringify(failure.body),
        });
      }
      return route.fulfill({ status: 204, contentType: 'application/json', body: '' });
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

// Storage delete hits the bucket-level endpoint with the paths in the body
// (`{"prefixes": [...]}`) — a different URL shape than upload's per-object POST,
// confirmed against the real client the same way as the other mocks here.
export async function mockPhotoDelete(page, { succeeds = true } = {}) {
  await page.route(`${SUPABASE_URL}/storage/v1/object/recipe-photos`, async (route) => {
    if (succeeds) {
      const { prefixes } = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(prefixes.map((name) => ({ name }))),
      });
    }
    return route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Delete failed' }),
    });
  });
}

// Mocks the email magic-link request itself (POST /auth/v1/otp). This never
// establishes a session on its own — in real life the member has to click the
// emailed link. mockMemberSession below is what simulates "already clicked it."
export async function mockSignInWithOtp(page, { succeeds = true } = {}) {
  await page.route(`${SUPABASE_URL}/auth/v1/otp**`, async (route) => {
    if (succeeds) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
    return route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ error_code: 'over_email_send_rate_limit', msg: 'Too many requests.' }),
    });
  });
}

// Simulates a member who has already clicked their magic link and holds a real
// session — supabase-js validates a persisted session by calling GET
// /auth/v1/user, so an authenticated-session test needs that mocked too, not just
// the OTP request itself.
export async function mockMemberSession(page, { email = 'member@example.com' } = {}) {
  await page.route(`${SUPABASE_URL}/auth/v1/user**`, async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-member-id',
        email,
        aud: 'authenticated',
        role: 'authenticated',
      }),
    });
  });

  await page.addInitScript(
    ({ url, session }) => {
      const key = `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
      window.localStorage.setItem(key, JSON.stringify(session));
    },
    {
      url: SUPABASE_URL,
      session: {
        access_token: 'test-member-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'test-member-refresh-token',
        user: { id: 'test-member-id', email, aud: 'authenticated', role: 'authenticated' },
      },
    },
  );
}

// Logs in through the real UI (mocking only the network) rather than poking at DOM
// state directly, so the test exercises the actual login flow. Also mocks the
// recipes and active_members tables before navigating, since logging in
// immediately triggers both the admin recipe list's and the members list's fetch —
// registering a mock after login would be too late for those first requests
// (though tests can still safely re-mock afterward to override what a later
// action, like a submit, sees).
export async function loginAsAdmin(page, recipesTableConfig = {}, membersTableConfig = {}) {
  await mockRecipesTable(page, recipesTableConfig);
  await mockMembersTable(page, membersTableConfig);
  await mockAuth(page, { succeeds: true });
  await page.goto('/admin/');
  await page.getByLabel('Password').fill('whatever-the-mock-accepts');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('heading', { name: 'Add a Recipe' }).waitFor();
}
