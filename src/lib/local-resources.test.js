import { describe, it, expect } from 'vitest';
import localResources from '../data/local-resources.json';
import { LOCAL_CATEGORIES, checkedLabel, groupByCategory } from './local-resources.js';

describe('local resources data', () => {
  it('gives every entry the fields the page shows', () => {
    for (const r of localResources) {
      expect(r.name, JSON.stringify(r)).toBeTruthy();
      expect(r.town, r.name).toBeTruthy();
      expect(r.description, r.name).toBeTruthy();
      expect(r.website, r.name).toMatch(/^https?:\/\//);
      expect(r.lastChecked, r.name).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('uses only known categories', () => {
    for (const r of localResources) expect(LOCAL_CATEGORIES, r.name).toContain(r.category);
  });

  it('has no duplicate links', () => {
    const urls = localResources.map((r) => r.website);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe('groupByCategory', () => {
  it('orders sections by LOCAL_CATEGORIES and names alphabetically, skipping empty ones', () => {
    const groups = groupByCategory([
      { name: 'Zed Winery', category: 'Local Makers' },
      { name: 'Brew Club', category: 'Clubs' },
      { name: 'Apple Mill', category: 'Local Makers' },
    ]);
    expect(groups.map((g) => g.category)).toEqual(['Clubs', 'Local Makers']);
    expect(groups[1].entries.map((e) => e.name)).toEqual(['Apple Mill', 'Zed Winery']);
  });
});

describe('checkedLabel', () => {
  it('shows month and year', () => {
    expect(checkedLabel('2026-10-15')).toBe('October 2026');
    expect(checkedLabel('2027-01-01')).toBe('January 2027');
  });
});
