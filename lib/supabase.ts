import { createClient } from "@supabase/supabase-js";

// These two values come from your Supabase project settings (Settings > API).
// They are safe to expose in the browser — the database itself is protected
// by Row Level Security rules (see supabase/schema.sql).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    // Next.js's App Router automatically caches fetch() responses. Every
    // number's page needs to reflect the latest count on every load, so we
    // explicitly disable that caching for all Supabase requests rather than
    // relying on route-level settings to cover it.
    fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
  },
});
