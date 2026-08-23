import { getViteConfig } from 'astro/config';

// Inherits the project's real Vite config (env handling, aliases) rather than
// maintaining a second, separate config that could drift from astro.config.mjs.
export default getViteConfig({
  test: {
    include: ['src/**/*.test.js'],
  },
});
