import { createClient } from "@supabase/supabase-js";

// These two values come from your Supabase project settings (Settings > API).
// They are safe to expose in the browser — the database itself is protected
// by Row Level Security rules (see supabase/schema.sql).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
