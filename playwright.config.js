import { defineConfig, devices } from '@playwright/test';

// Tests run against the built + previewed site, not `astro dev` — dev and the real
// production build behave differently (see the <script type="module"> bundling
// gotcha in project history), so testing against dev would validate the wrong thing.
//
// The site is built with PUBLIC_FIREBASE_EMULATORS=true so every page talks to the
// Firebase Local Emulator Suite, which `npm run test:e2e` starts around this run
// (see package.json) — no real Firebase project involved. Specs share that one set
// of emulators and wipe it before each test (tests/e2e/emulator.js), so they run
// one at a time rather than in parallel.
//
// Its own port, never reused: a `npm run dev` left running on 4321 talks to the
// *real* Firebase project, and reusing it once pointed the whole suite at
// production. If 4329 is taken, the run fails instead.
const PORT = 4329;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      PUBLIC_FIREBASE_EMULATORS: 'true',
    },
  },
});
