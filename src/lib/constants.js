// Pure, dependency-free constants and helpers shared by the recipes/admin pages.
// Kept separate from supabase.js on purpose: this file has no side effects, so it's
// safe to import from Astro frontmatter at build time (e.g. to render the category
// <select> options) without needing PUBLIC_SUPABASE_URL to be set — importing
// supabase.js itself constructs a real client and throws if that env var is missing.

// There is one shared admin login for the whole guild ("anyone who has the password
// can log in"), not individual accounts. Supabase Auth still needs an email as the
// account identifier, so it's fixed here — the actual secret is the password, entered
// by whoever's logging in, never stored or checked client-side.
export const ADMIN_EMAIL = 'admin@heartlandfermentersguild.org';

export const RECIPE_CATEGORIES = [
  'Beer',
  'Wine',
  'Bread & Sourdough',
  'Vegetables & Pickles',
  'Kombucha',
  'Cheese',
  'Other',
];

export function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Multi-line free text (ingredients, instructions) is stored as one newline-separated
// string rather than a Postgres array, to keep the schema and the plain <textarea>
// form simple. This turns it into a clean list of non-empty, trimmed lines for display.
export function linesToList(text) {
  return (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
