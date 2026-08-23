// Shared Supabase client used by the recipes/admin pages' client-side scripts only
// (never imported from Astro frontmatter — see constants.js for why).
//
// PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY are safe to expose to the
// browser by design (Supabase's client-safe "publishable" key, formerly called the
// "anon" key) — real protection comes from the Row Level Security policies in
// supabase/schema.sql, not from keeping this key secret. See README.md for setup.
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
