import { defineConfig } from 'vitest/config';

// Security Rules tests (tests/rules/) run against the Firestore and Storage
// emulators, so they need `npm run test:rules` (which starts them) rather than
// the plain unit-test run — kept in a separate config so `npm run test:unit`
// stays emulator-free.
export default defineConfig({
  test: {
    include: ['tests/rules/**/*.test.js'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 15_000,
  },
});
