import { NextResponse } from "next/server";
import { createClient } from "../../lib/supabase/server";
import {
  AUTH_NEXT_COOKIE,
  getRequestOrigin,
  readAuthNextPath,
} from "../../lib/supabase/authUrl";

function withClearedAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_NEXT_COOKIE, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  return response;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = readAuthNextPath(request, "/interview");
  const origin = getRequestOrigin(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return withClearedAuthCookie(NextResponse.redirect(`${origin}${next}`));
    }

    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
  }

  return withClearedAuthCookie(
    NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(
        "Could not complete sign-in. Add http://localhost:3000/auth/callback to Supabase Redirect URLs (Authentication → URL Configuration)."
      )}`
    )
  );
}
