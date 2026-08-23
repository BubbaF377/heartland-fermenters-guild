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

// Requirement #11: recipe photos live in this public Supabase Storage bucket.
export const RECIPE_PHOTOS_BUCKET = 'recipe-photos';

// Requirement #10: suggested starting time stages per category, used only to
// pre-populate the admin form's stage editor — never enforced. "Other" has no
// suggestions since it covers everything that doesn't fit the named categories.
export const TIME_STAGE_SUGGESTIONS = {
  Beer: ['Prep', 'Ferment', 'Condition/Carbonate'],
  Wine: ['Prep', 'Ferment', 'Age'],
  'Bread & Sourdough': ['Prep', 'Rise', 'Bake'],
  'Vegetables & Pickles': ['Prep', 'Ferment'],
  Kombucha: ['Prep', 'Ferment'],
  Cheese: ['Prep', 'Culture', 'Age'],
  Other: [],
};

// A couple of stage labels get a friendlier chip label at render time, per the
// reviewed wireframe (e.g. a "Prep" stage reads "Active Prep" as a chip).
// Everything else displays exactly as the submitter typed it.
const TIME_STAGE_CHIP_LABELS = {
  prep: 'Active prep',
  ferment: 'Ferment time',
};

export function timeStageChipLabel(stageLabel) {
  return TIME_STAGE_CHIP_LABELS[stageLabel.trim().toLowerCase()] || stageLabel;
}

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

// Time stages (Requirement #10) use the same newline-separated convention, one
// "Label: Duration" pair per line. Splits only on the first colon, so a duration
// like "1–4 weeks" (no colon) or a label containing one still round-trips.
export function linesToPairs(text) {
  return linesToList(text)
    .map((line) => {
      const i = line.indexOf(':');
      if (i === -1) return null;
      const label = line.slice(0, i).trim();
      const value = line.slice(i + 1).trim();
      return label && value ? { label, value } : null;
    })
    .filter(Boolean);
}

export function pairsToLines(pairs) {
  return pairs
    .map(({ label, value }) => [String(label || '').trim(), String(value || '').trim()])
    .filter(([label, value]) => label && value)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
}

// Pulls the video ID out of the handful of URL shapes people paste from YouTube
// (watch?v=, youtu.be/, embed/, shorts/). Returns null for anything else, so the
// caller can just skip rendering an embed rather than guessing.
export function extractYouTubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null;
    if (u.hostname.replace(/^www\./, '') === 'youtube.com') {
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      const match = u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/);
      if (match) return match[1];
    }
  } catch {
    return null;
  }
  return null;
}
