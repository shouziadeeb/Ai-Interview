import { createClient } from "@supabase/supabase-js";

/**
 * @deprecated Prefer `createClient` from `./supabase/client` (browser)
 * or `./supabase/server` (server). Kept for any legacy imports.
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
