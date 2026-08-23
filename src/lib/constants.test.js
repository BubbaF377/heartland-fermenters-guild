import { describe, it, expect } from 'vitest';
import {
  slugify,
  linesToList,
  linesToPairs,
  pairsToLines,
  timeStageChipLabel,
  extractYouTubeId,
} from './constants.js';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Farmhouse Sauerkraut')).toBe('farmhouse-sauerkraut');
  });

  it('collapses runs of non-alphanumeric characters into a single hyphen', () => {
    expect(slugify('Beer & Wine!! (v2)')).toBe('beer-wine-v2');
  });

  it('strips leading and trailing hyphens', () => {
    expect(slugify('  --Hello World--  ')).toBe('hello-world');
  });

  it('truncates to 80 characters', () => {
    const long = 'a'.repeat(200);
    expect(slugify(long)).toHaveLength(80);
  });

  it('returns an empty string for input with no alphanumeric characters', () => {
    expect(slugify('!!!')).toBe('');
  });
});

describe('linesToList', () => {
  it('splits on newlines and trims each line', () => {
    expect(linesToList('Flour\n Water \nSalt')).toEqual(['Flour', 'Water', 'Salt']);
  });

  it('drops blank and whitespace-only lines', () => {
    expect(linesToList('Flour\n\n   \nSalt\n')).toEqual(['Flour', 'Salt']);
  });

  it('returns an empty array for null, undefined, or empty input', () => {
    expect(linesToList(null)).toEqual([]);
    expect(linesToList(undefined)).toEqual([]);
    expect(linesToList('')).toEqual([]);
  });
});

describe('linesToPairs', () => {
  it('splits each line on the first colon', () => {
    expect(linesToPairs('Prep: 20 min\nFerment: 1–4 weeks')).toEqual([
      { label: 'Prep', value: '20 min' },
      { label: 'Ferment', value: '1–4 weeks' },
    ]);
  });

  it('only splits on the first colon, keeping the rest in the value', () => {
    expect(linesToPairs('Note: something: else')).toEqual([
      { label: 'Note', value: 'something: else' },
    ]);
  });

  it('skips lines with no colon', () => {
    expect(linesToPairs('Prep: 20 min\njust some text')).toEqual([
      { label: 'Prep', value: '20 min' },
    ]);
  });

  it('skips lines with an empty label or empty value', () => {
    expect(linesToPairs(': 20 min\nPrep:\nFerment: 1 week')).toEqual([
      { label: 'Ferment', value: '1 week' },
    ]);
  });

  it('returns an empty array for null or empty input', () => {
    expect(linesToPairs(null)).toEqual([]);
    expect(linesToPairs('')).toEqual([]);
  });
});

describe('pairsToLines', () => {
  it('joins label/value pairs into newline-separated "Label: Value" lines', () => {
    expect(
      pairsToLines([
        { label: 'Prep', value: '20 min' },
        { label: 'Ferment', value: '1–4 weeks' },
      ]),
    ).toBe('Prep: 20 min\nFerment: 1–4 weeks');
  });

  it('drops pairs with an empty label or value after trimming', () => {
    expect(
      pairsToLines([
        { label: 'Prep', value: '20 min' },
        { label: '  ', value: '10 min' },
        { label: 'Bake', value: '' },
      ]),
    ).toBe('Prep: 20 min');
  });

  it('trims label and value whitespace', () => {
    expect(pairsToLines([{ label: '  Prep  ', value: '  20 min  ' }])).toBe('Prep: 20 min');
  });

  it('returns an empty string for an empty array', () => {
    expect(pairsToLines([])).toBe('');
  });

  it('round-trips with linesToPairs', () => {
    const original = 'Prep: 20 min\nRise: 4–6 hr\nBake: 45 min';
    expect(pairsToLines(linesToPairs(original))).toBe(original);
  });
});

describe('timeStageChipLabel', () => {
  it('renames "Prep" to "Active prep"', () => {
    expect(timeStageChipLabel('Prep')).toBe('Active prep');
  });

  it('renames "Ferment" to "Ferment time"', () => {
    expect(timeStageChipLabel('Ferment')).toBe('Ferment time');
  });

  it('matches case-insensitively and ignores surrounding whitespace', () => {
    expect(timeStageChipLabel('  prep  ')).toBe('Active prep');
    expect(timeStageChipLabel('FERMENT')).toBe('Ferment time');
  });

  it('passes through any other label unchanged', () => {
    expect(timeStageChipLabel('Rise')).toBe('Rise');
    expect(timeStageChipLabel('Cold Proof')).toBe('Cold Proof');
  });
});

describe('extractYouTubeId', () => {
  it('extracts the id from a watch URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('extracts the id from a watch URL with extra query params', () => {
    expect(
      extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123'),
    ).toBe('dQw4w9WgXcQ');
  });

  it('extracts the id from a youtu.be short link', () => {
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts the id from an embed URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('extracts the id from a shorts URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('works without a www subdomain', () => {
    expect(extractYouTubeId('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('returns null for a non-YouTube URL', () => {
    expect(extractYouTubeId('https://vimeo.com/12345')).toBeNull();
  });

  it('returns null for an unparseable string', () => {
    expect(extractYouTubeId('not a url')).toBeNull();
  });

  it('returns null for null, undefined, or empty input', () => {
    expect(extractYouTubeId(null)).toBeNull();
    expect(extractYouTubeId(undefined)).toBeNull();
    expect(extractYouTubeId('')).toBeNull();
  });
});
