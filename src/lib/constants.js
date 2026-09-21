// Pure, dependency-free constants and helpers shared by the recipes/admin pages.
// Kept separate from firebase.js on purpose: this file has no side effects, so it's
// safe to import from Astro frontmatter at build time (e.g. to render the category
// <select> options) — importing firebase.js initializes the Firebase app and its
// browser-only Auth/Storage clients, which has no business running during the build.

// There is one shared admin login for the whole guild ("anyone who has the password
// can log in"), not individual accounts. Firebase Authentication still needs an email as the
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

// Requirement #11: recipe photos live under this Firebase Storage path (publicly
// readable per storage.rules). A recipe's photo_path is relative to it.
export const RECIPE_PHOTOS_PATH = 'recipe-photos';

// Photo requirements, shown next to every photo field and checked the moment a
// file is picked. storage.rules enforces the same types and size server-side —
// keep the two in step. Only formats every browser can display: HEIC (iPhones'
// native format) is left out. iOS is expected to convert HEIC to JPEG when the
// file picker only offers these types — unverified on a device; see
// docs/PRODUCT.md Requirement #11's History.
export const PHOTO_TYPES = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
};
export const MAX_PHOTO_MB = 10;

const photoTypeNames = Object.values(PHOTO_TYPES);
// "JPG, PNG, or WebP" — for hint text and error messages.
export const PHOTO_TYPE_NAMES = `${photoTypeNames.slice(0, -1).join(', ')}, or ${photoTypeNames.at(-1)}`;

// Returns a message explaining why `file` can't be used as a recipe photo, or
// null if it's fine (or there's no file at all — the photo is optional).
export function photoFileProblem(file) {
  if (!file) return null;
  if (!(file.type in PHOTO_TYPES)) {
    return `That file isn't a ${PHOTO_TYPE_NAMES} image — please choose a different photo.`;
  }
  if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `That photo is ${sizeMb} MB — the limit is ${MAX_PHOTO_MB} MB. Try a smaller copy (most phones can share or export a reduced size).`;
  }
  return null;
}

// localStorage key the recipe forms' Preview button hands the unsaved recipe to
// /recipes/view?preview=1 through.
export const RECIPE_PREVIEW_STORAGE_KEY = 'hfg-recipe-preview';

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
// string rather than a Firestore array, to keep the schema and the plain <textarea>
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
