import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isLocalHost } from "./authUrl";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const local = isLocalHost(request.nextUrl.hostname);

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, {
            ...options,
            // http://localhost cannot store Secure cookies
            ...(local ? { secure: false } : {}),
          });
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = pathname.startsWith("/interview");

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && pathname.startsWith("/auth/login")) {
    const nextRaw = request.nextUrl.searchParams.get("next") || "/interview";
    const redirectUrl = request.nextUrl.clone();
    const [pathPart, hashPart] = nextRaw.split("#");
    const safePath =
      pathPart && pathPart.startsWith("/") && !pathPart.startsWith("//")
        ? pathPart
        : "/interview";
    redirectUrl.pathname = safePath;
    redirectUrl.search = "";
    redirectUrl.hash = hashPart ? `#${hashPart}` : "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
