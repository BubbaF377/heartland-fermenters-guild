import { describe, it, expect } from 'vitest';
import resources from '../data/fermentation-resources.json';
import {
  AI_MAX_MATCHES,
  AREAS,
  AREA_GROUPS,
  MEDIA_TYPES,
  RESOURCE_TYPES,
  areaLabel,
  filterResources,
  aiFailureKind,
  matchIdsFromResponse,
  resourcesForPrompt,
} from './resources.js';

const none = { areas: new Set(), types: new Set(), media: new Set() };

const sample = [
  {
    name: 'Kraut Club',
    description: 'Sauerkraut and kimchi basics.',
    area: ['Vegetables', 'Kimchi'],
    resourceType: ['Learn to Ferment'],
    mediaType: ['Website'],
  },
  {
    name: 'Brew Science',
    description: 'Yeast and beer chemistry.',
    area: ['Beer', 'Fermentation Science'],
    resourceType: ['Go Deeper'],
    mediaType: ['YouTube Channel'],
  },
  {
    name: 'Starter Stories',
    description: 'Sourdough starters from around the world.',
    area: ['Sourdough', 'Bread'],
    resourceType: ['Learn to Ferment', 'Go Deeper'],
    mediaType: ['Podcast'],
  },
];

const names = (list) => list.map((r) => r.name);

describe('AREA_GROUPS', () => {
  it('assigns every schema area to exactly one panel', () => {
    const grouped = AREA_GROUPS.flatMap((g) => g.areas);
    expect(new Set(grouped).size).toBe(grouped.length);
    expect([...grouped].sort()).toEqual([...AREAS].sort());
  });

  it('has the 8 panels from Requirement #20', () => {
    expect(AREA_GROUPS.map((g) => g.label)).toEqual([
      'Region',
      'General & Traditional',
      'Produce',
      'Grains & Bread',
      'Dairy & Meats',
      'Beverages',
      'Soy & Koji',
      'Science & Safety',
    ]);
  });
});

describe('areaLabel', () => {
  it('drops "Fermented Foods" from regional tags only', () => {
    expect(areaLabel('Asian Fermented Foods')).toBe('Asian');
    expect(areaLabel('Middle Eastern Fermented Foods')).toBe('Middle Eastern');
    expect(areaLabel('US and Canadian')).toBe('US and Canadian');
    expect(areaLabel('General Fermentation')).toBe('General Fermentation');
  });

  it('lists the Region panel as plain region names', () => {
    const globe = AREA_GROUPS.find((g) => g.label === 'Region');
    expect(globe.areas.map(areaLabel)).toEqual([
      'US and Canadian',
      'African',
      'Asian',
      'European',
      'Latin American',
      'Mexican',
      'Middle Eastern',
      'Turkish',
    ]);
  });

  it('lists every other panel alphabetically by label', () => {
    for (const group of AREA_GROUPS.filter((g) => g.label !== 'Region')) {
      const labels = group.areas.map(areaLabel);
      expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
    }
  });
});

describe('schema enums', () => {
  it('exposes the 4 types and 5 media types', () => {
    expect(RESOURCE_TYPES).toHaveLength(4);
    expect(MEDIA_TYPES).toEqual(['Website', 'YouTube Channel', 'YouTube Playlist', 'Video Collection', 'Podcast']);
  });

  it('every resource in the dataset uses only schema values', () => {
    for (const r of resources) {
      expect(AREAS).toEqual(expect.arrayContaining(r.area));
      expect(RESOURCE_TYPES).toEqual(expect.arrayContaining(r.resourceType));
      expect(MEDIA_TYPES).toEqual(expect.arrayContaining(r.mediaType));
    }
  });
});

describe('filterResources', () => {
  it('returns everything when nothing is selected', () => {
    expect(names(filterResources(sample, none))).toEqual(['Kraut Club', 'Brew Science', 'Starter Stories']);
  });

  it('matches search text case-insensitively in name or description', () => {
    expect(names(filterResources(sample, { ...none, text: 'KIMCHI' }))).toEqual(['Kraut Club']);
    expect(names(filterResources(sample, { ...none, text: 'brew' }))).toEqual(['Brew Science']);
    expect(names(filterResources(sample, { ...none, text: '  yeast ' }))).toEqual(['Brew Science']);
  });

  it('does not match search text against tags', () => {
    // Requirement #20: name and description only (tag matching is an open question).
    expect(filterResources(sample, { ...none, text: 'Fermentation Science' })).toEqual([]);
  });

  it('ORs selections within a facet', () => {
    const areas = new Set(['Kimchi', 'Beer']);
    expect(names(filterResources(sample, { ...none, areas }))).toEqual(['Kraut Club', 'Brew Science']);
  });

  it('ANDs across facets and search text', () => {
    const types = new Set(['Learn to Ferment']);
    const media = new Set(['Podcast']);
    expect(names(filterResources(sample, { ...none, types, media }))).toEqual(['Starter Stories']);
    expect(filterResources(sample, { ...none, types, media, text: 'kraut' })).toEqual([]);
  });

  it('keeps the input order', () => {
    const reversed = [...sample].reverse();
    expect(names(filterResources(reversed, none))).toEqual(['Starter Stories', 'Brew Science', 'Kraut Club']);
  });
});

describe('resourcesForPrompt', () => {
  it('writes one line per resource, keyed by position, with its tags', () => {
    const lines = resourcesForPrompt(sample).split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe(
      '[1] Brew Science — Yeast and beer chemistry. (Areas: Beer, Fermentation Science; Type: Go Deeper; Media: YouTube Channel)',
    );
  });

  it('never includes URLs', () => {
    expect(resourcesForPrompt(resources)).not.toMatch(/https?:\/\//);
  });
});

describe('aiFailureKind', () => {
  const aiError = (status, message) => Object.assign(new Error(message), { customErrorData: { status } });

  it("is 'paused' when the prepaid credits ran out (the error actually seen)", () => {
    expect(aiFailureKind(aiError(429, '[429 ] Your prepayment credits are depleted.'))).toBe('paused');
  });

  it("is 'paused' for a spend cap or any payment error, whatever the wording", () => {
    expect(aiFailureKind(aiError(429, '[429 ] Project has exceeded its monthly spend cap'))).toBe('paused');
    expect(aiFailureKind(aiError(429, '[429 ] Spending limit reached for billing account'))).toBe('paused');
    expect(aiFailureKind(aiError(402, '[402 ] Payment Required'))).toBe('paused');
  });

  it("is 'busy' for any other 429", () => {
    expect(aiFailureKind(aiError(429, "[429 ] Quota exceeded for quota metric 'Generate content requests'"))).toBe('busy');
  });

  it("is 'failed' for everything else", () => {
    expect(aiFailureKind(aiError(403, '[403 ] deactivated'))).toBe('failed');
    expect(aiFailureKind(aiError(500, '[500 ] boom'))).toBe('failed');
    expect(aiFailureKind(new Error('Unexpected AI response'))).toBe('failed');
    expect(aiFailureKind(undefined)).toBe('failed');
  });
});

describe('matchIdsFromResponse', () => {
  it('returns the ranked positions', () => {
    expect(matchIdsFromResponse('{"ids":[2,0]}', 3)).toEqual([2, 0]);
  });

  it('drops positions that are not real resources, and duplicates', () => {
    expect(matchIdsFromResponse('{"ids":[5,-1,1.5,"1",2,2,0]}', 3)).toEqual([2, 0]);
  });

  it('caps the list', () => {
    const ids = Array.from({ length: 20 }, (_, i) => i);
    expect(matchIdsFromResponse(JSON.stringify({ ids }), 61)).toHaveLength(AI_MAX_MATCHES);
  });

  it('treats an empty list as no matches, not a failure', () => {
    expect(matchIdsFromResponse('{"ids":[]}', 3)).toEqual([]);
  });

  it('returns null for a reply that is not the expected shape', () => {
    expect(matchIdsFromResponse('Sure! Here are some resources.', 3)).toBeNull();
    expect(matchIdsFromResponse('{"matches":[1]}', 3)).toBeNull();
    expect(matchIdsFromResponse('null', 3)).toBeNull();
  });
});
