/**
 * Auth redirect helpers.
 *
 * Supabase only redirects to URLs in Authentication → URL Configuration.
 * If redirectTo does not match (query strings often break matching), Supabase
 * falls back to the dashboard "Site URL" (usually your hosted domain).
 *
 * Use a clean callback path with no query string, and stash `next` in a cookie.
 */

export const AUTH_NEXT_COOKIE = "myinterview_auth_next";

export function getBrowserOrigin() {
  if (typeof window === "undefined") {
    throw new Error("getBrowserOrigin() must be called in the browser");
  }
  return window.location.origin;
}

/** Clean callback URL — no query string (allowlist-safe). */
export function getBrowserAuthCallbackUrl() {
  return `${getBrowserOrigin()}/auth/callback`;
}

export function stashAuthNextPath(nextPath: string) {
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  try {
    window.localStorage.setItem(AUTH_NEXT_COOKIE, next);
  } catch {
    // ignore
  }
  // Cookie is readable by /auth/callback on the same origin.
  document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent(next)}; Path=/; Max-Age=600; SameSite=Lax`;
}

export function readAuthNextPath(
  request: Request,
  fallback = "/interview"
): string {
  const fromQuery = new URL(request.url).searchParams.get("next");
  if (fromQuery?.startsWith("/")) return fromQuery;

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${AUTH_NEXT_COOKIE}=([^;]+)`)
  );
  if (match?.[1]) {
    try {
      const value = decodeURIComponent(match[1]);
      if (value.startsWith("/")) return value;
    } catch {
      // ignore
    }
  }

  return fallback.startsWith("/") ? fallback : "/interview";
}

export function getRequestOrigin(request: Request) {
  const url = new URL(request.url);
  const hostname = url.hostname;

  // Always trust the actual request host for local development.
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return url.origin;
  }

  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const forwardedProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (siteUrl) {
    return siteUrl;
  }

  return url.origin;
}

export function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}
