import { defineConfig, devices } from '@playwright/test';

// Tests run against the built + previewed site, not `astro dev` — dev and the real
// production build behave differently (see the <script type="module"> bundling
// gotcha in project history), so testing against dev would validate the wrong thing.
//
// PUBLIC_SUPABASE_URL/PUBLIC_SUPABASE_PUBLISHABLE_KEY just need to be syntactically
// valid at build time: createClient() throws synchronously if the URL is unset, which
// would break every page's script before Playwright's route mocks ever get a chance
// to intercept anything. No real network calls happen — every spec mocks Supabase.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
      PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_key_for_e2e',
    },
  },
});
