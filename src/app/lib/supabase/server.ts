import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isLocalHost } from "./authUrl";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            const host =
              options?.domain ||
              // Next cookie store has no request host; infer from SITE_URL / fallback.
              (process.env.NEXT_PUBLIC_SITE_URL
                ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
                : "localhost");
            const local = isLocalHost(host) || process.env.NODE_ENV === "development";
            cookieStore.set(name, value, {
              ...options,
              ...(local ? { secure: false } : {}),
            });
          });
        } catch {
          // Called from a Server Component — middleware keeps the session fresh.
        }
      },
    },
  });
}
