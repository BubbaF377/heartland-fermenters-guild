// Canned recipe rows reused across specs — one with every optional field set, one
// with only the required fields, so tests can check both "field is shown" and
// "field is correctly omitted" without each spec building its own fixture data.

export const fullRecipe = {
  id: 'recipe-full',
  slug: 'classic-sourdough-boule',
  title: 'Classic Sourdough Boule',
  category: 'Bread & Sourdough',
  summary: 'A crusty, open-crumb loaf built on a mature starter.',
  photo_path: 'classic-sourdough-boule-123.jpg',
  video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  yield_text: '1 loaf',
  time_stages: 'Prep: 30 min\nRise: 4–6 hr\nCold Proof: 12–16 hr\nBake: 45 min',
  ingredients: '100g active starter\n375g warm water\n500g bread flour\n10g fine sea salt',
  instructions: 'Mix starter and water, then stir in flour.\nBulk rise 4-6 hours.\nShape into a boule.\nBake covered, then uncovered.',
  notes: 'Starter should double and pass the float test before you begin.',
  submitted_by: 'Jamie',
  created_at: '2026-08-20T00:00:00Z',
};

export const minimalRecipe = {
  id: 'recipe-minimal',
  slug: 'quick-kombucha',
  title: 'Quick Kombucha',
  category: 'Kombucha',
  summary: '',
  photo_path: null,
  video_url: null,
  yield_text: null,
  time_stages: null,
  ingredients: 'Sweet tea\nSCOBY',
  instructions: 'Brew the tea and let cool.\nAdd the SCOBY and ferment 7-10 days.',
  notes: null,
  submitted_by: null,
  created_at: '2026-08-10T00:00:00Z',
};
