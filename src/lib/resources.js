// Pure, dependency-free data and helpers for the Resources page (Requirement #20).
// No Firebase here, so — like constants.js — it's safe to import from Astro
// frontmatter at build time as well as from the page's client-side script.
import resourceSchema from '../data/schemas/fermentation-resource.schema.json';

const schemaEnum = (field) => resourceSchema.properties[field].items.enum;

export const AREAS = schemaEnum('area');
export const RESOURCE_TYPES = schemaEnum('resourceType');
export const MEDIA_TYPES = schemaEnum('mediaType');

// Within a panel, tags are listed alphabetically by their on-page label, except
// these, which stay at the top of their panel.
const PINNED_FIRST = ['US and Canadian'];

function inDisplayOrder(areas) {
  const pinned = PINNED_FIRST.filter((a) => areas.includes(a));
  const rest = areas.filter((a) => !pinned.includes(a)).sort((a, b) => areaLabel(a).localeCompare(areaLabel(b)));
  return [...pinned, ...rest];
}

// The Area filter's 8 panels. A UI grouping only — it changes nothing about how
// resources are tagged or matched, so it can be regrouped without touching the
// data. Every schema `area` value must appear in exactly one panel, including ones
// no resource uses yet (resources.test.js checks this, so a schema update that adds
// a tag fails the tests until it's given a panel).
const AREA_GROUPS_UNSORTED = [
  {
    label: 'Region',
    areas: [
      'US and Canadian',
      'European',
      'Asian Fermented Foods',
      'African Fermented Foods',
      'Latin American Fermented Foods',
      'Middle Eastern Fermented Foods',
      'Mexican Fermented Foods',
      'Turkish Fermented Foods',
    ],
  },
  {
    label: 'General & Traditional',
    areas: ['General Fermentation', 'Traditional & Indigenous Fermentation', 'Wild & Foraged Fermentation'],
  },
  { label: 'Produce', areas: ['Vegetables', 'Fruit', 'Kimchi'] },
  {
    label: 'Grains & Bread',
    areas: ['Sourdough', 'Bread', 'Cereals & Grains', 'Maize', 'Rice Fermentation', 'Cassava', 'Legumes'],
  },
  { label: 'Dairy & Meats', areas: ['Cheese', 'Cultured Dairy', 'Yogurt', 'Kefir', 'Fermented Meats'] },
  {
    label: 'Beverages',
    areas: [
      'Beer',
      'Wild & Sour Beer',
      'Wine',
      'Mead',
      'Cider',
      'Kombucha',
      'Vinegar',
      'Sake',
      'Shochu',
      'Pulque',
      'Chicha',
      'Cocoa',
      'Coffee',
    ],
  },
  { label: 'Soy & Koji', areas: ['Koji', 'Soy Fermentation', 'Miso', 'Tempeh', 'Natto'] },
  { label: 'Science & Safety', areas: ['Fermentation Science', 'Microbiology', 'Food Safety'] },
];

export const AREA_GROUPS = AREA_GROUPS_UNSORTED.map((g) => ({ ...g, areas: inDisplayOrder(g.areas) }));

// How an area tag reads on the page. The regional tags covering what a resource is
// about ("Asian Fermented Foods") read as just the region, matching the newer tags
// for where a resource is from ("European"). The data keeps the full names.
export function areaLabel(area) {
  return area.replace(/ Fermented Foods$/, '');
}

// True when `values` shares at least one entry with the selected set. An empty
// selection means the facet isn't in use, so everything passes it.
function matchesAny(values, selected) {
  return selected.size === 0 || values.some((v) => selected.has(v));
}

// Requirement #20's matching: search text AND each facet, where a facet matches if
// the resource has any of its selected values (OR within a facet). Search is a
// case-insensitive substring match on name and description only. Keeps the input
// order, so ranked lists (AI search results) stay ranked after filtering.
export function filterResources(resources, { text = '', areas, types, media }) {
  const needle = text.trim().toLowerCase();
  return resources.filter(
    (r) =>
      (!needle || r.name.toLowerCase().includes(needle) || r.description.toLowerCase().includes(needle)) &&
      matchesAny(r.area, areas) &&
      matchesAny(r.resourceType, types) &&
      matchesAny(r.mediaType, media),
  );
}

// Requirement #21 (AI search). The model never sees a URL or returns prose — it
// gets every resource as one line keyed by its position in the bundled dataset,
// and answers with a short ranked list of those positions. Positions only need to
// agree within a single request (the list is rebuilt from the same bundled file
// every time), so the data needs no ID field of its own.
export const AI_MAX_MATCHES = 8;

export function resourcesForPrompt(resources) {
  return resources
    .map(
      (r, i) =>
        `[${i}] ${r.name} — ${r.description} (Areas: ${r.area.join(', ')}; ` +
        `Type: ${r.resourceType.join(', ')}; Media: ${r.mediaType.join(', ')})`,
    )
    .join('\n');
}

// Turns the model's JSON reply into dataset positions: ones that don't name a real
// resource are dropped rather than rendered, duplicates keep their first (best)
// rank, and the list is capped. Returns null when the reply isn't the expected
// shape at all, so the page can tell "no matches" apart from "the AI failed."
export function matchIdsFromResponse(text, resourceCount) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!parsed || !Array.isArray(parsed.ids)) return null;
  const ids = [];
  for (const id of parsed.ids) {
    if (Number.isInteger(id) && id >= 0 && id < resourceCount && !ids.includes(id)) ids.push(id);
  }
  return ids.slice(0, AI_MAX_MATCHES);
}
