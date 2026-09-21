import { describe, it, expect } from 'vitest';
import {
  slugify,
  linesToList,
  linesToPairs,
  pairsToLines,
  timeStageChipLabel,
  extractYouTubeId,
  photoFileProblem,
  phoneDigits,
  formatPhone,
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

describe('photoFileProblem', () => {
  const MB = 1024 * 1024;
  const file = (type, size) => ({ type, size });

  it('accepts no file at all, since the photo is optional', () => {
    expect(photoFileProblem(null)).toBeNull();
    expect(photoFileProblem(undefined)).toBeNull();
  });

  it('accepts JPG, PNG, and WebP up to 10 MB', () => {
    expect(photoFileProblem(file('image/jpeg', 3 * MB))).toBeNull();
    expect(photoFileProblem(file('image/png', 10 * MB))).toBeNull();
    expect(photoFileProblem(file('image/webp', 1))).toBeNull();
  });

  it('rejects other formats, including images most browsers cannot display', () => {
    expect(photoFileProblem(file('image/heic', MB))).toMatch(/isn't a JPG, PNG, or WebP/);
    expect(photoFileProblem(file('image/gif', MB))).toMatch(/isn't a JPG, PNG, or WebP/);
    expect(photoFileProblem(file('application/pdf', MB))).toMatch(/isn't a JPG, PNG, or WebP/);
    expect(photoFileProblem(file('', MB))).toMatch(/isn't a JPG, PNG, or WebP/);
  });

  it('rejects files over 10 MB, saying how big the file was', () => {
    expect(photoFileProblem(file('image/jpeg', 10 * MB + 1))).toMatch(/10\.0 MB — the limit is 10 MB/);
    expect(photoFileProblem(file('image/jpeg', 14.25 * MB))).toMatch(/14\.3 MB/);
  });
});

describe('phoneDigits', () => {
  it('accepts the common ways of writing a 10-digit number', () => {
    for (const input of [
      '4025550134',
      '(402) 555-0134',
      '402-555-0134',
      '402.555.0134',
      '402 555 0134',
      '(402)555-0134',
      '  402-555-0134  ',
    ]) {
      expect(phoneDigits(input), input).toBe('4025550134');
    }
  });

  it('accepts a leading 1 or +1 country code', () => {
    expect(phoneDigits('1-402-555-0134')).toBe('4025550134');
    expect(phoneDigits('+1 (402) 555-0134')).toBe('4025550134');
    expect(phoneDigits('14025550134')).toBe('4025550134');
  });

  it('returns an empty string for an empty field, since the phone is optional', () => {
    expect(phoneDigits('')).toBe('');
    expect(phoneDigits('   ')).toBe('');
    expect(phoneDigits(null)).toBe('');
    expect(phoneDigits(undefined)).toBe('');
  });

  it('rejects anything that is not 10 digits', () => {
    expect(phoneDigits('555-0134')).toBeNull();
    expect(phoneDigits('402-555-013')).toBeNull();
    expect(phoneDigits('402-555-01345')).toBeNull();
    expect(phoneDigits('24025550134')).toBeNull(); // 11 digits, not a leading 1
    expect(phoneDigits('402-555-0134 ext 5')).toBeNull();
    expect(phoneDigits('402-JKL-0134')).toBeNull();
  });
});

describe('formatPhone', () => {
  it('formats a stored 10-digit number as (123) 456-7890', () => {
    expect(formatPhone('4025550134')).toBe('(402) 555-0134');
  });

  it('formats older phones saved as typed, when they hold 10 digits', () => {
    expect(formatPhone('402.555.0134')).toBe('(402) 555-0134');
    expect(formatPhone('+1 402 555 0134')).toBe('(402) 555-0134');
  });

  it('shows anything else exactly as stored', () => {
    expect(formatPhone('555-0100')).toBe('555-0100');
    expect(formatPhone('call the shop')).toBe('call the shop');
  });

  it('returns an empty string when there is no phone', () => {
    expect(formatPhone(null)).toBe('');
    expect(formatPhone(undefined)).toBe('');
    expect(formatPhone('')).toBe('');
  });
});
