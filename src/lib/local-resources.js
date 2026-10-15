// Pure helpers for the Local Resources page (Requirement #22). Like resources.js,
// safe to import from Astro frontmatter at build time.

// The page's sections, in the order they appear.
export const LOCAL_CATEGORIES = ['Supply Shops', 'Clubs', 'Classes', 'Local Makers'];

// Entries grouped by category, in LOCAL_CATEGORIES order, alphabetical within
// each. Categories with no entries are left out.
export function groupByCategory(entries) {
  return LOCAL_CATEGORIES.map((category) => ({
    category,
    entries: entries.filter((e) => e.category === category).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.entries.length > 0);
}

// "2026-10-15" → "October 2026". Parsed by hand rather than with new Date(),
// which would read a bare date as UTC midnight and can land on the previous
// month in US time zones.
export function checkedLabel(isoDate) {
  const [year, month] = isoDate.split('-').map(Number);
  const name = new Date(2000, month - 1, 1).toLocaleString('en-US', { month: 'long' });
  return `${name} ${year}`;
}
