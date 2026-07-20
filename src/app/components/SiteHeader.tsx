"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, UserRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#resume", label: "Resume" },
  { href: "/interview", label: "Practice" },
  { href: "/#about", label: "About" },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (name.slice(0, 2) || "U").toUpperCase();
}

function resolveDisplayName(user: NonNullable<ReturnType<typeof useAuth>["user"]>) {
  const meta = user.user_metadata || {};
  return (
    meta.full_name ||
    meta.name ||
    meta.preferred_username ||
    user.email?.split("@")[0] ||
    "Account"
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  const displayName = useMemo(
    () => (user ? resolveDisplayName(user) : ""),
    [user]
  );
  const email = user?.email || "";
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
  const initials = getInitials(displayName || "U");

  return (
    <header className="site-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link
          href="/"
          className="brand-font flex min-w-0 items-center gap-2.5 text-[var(--ink)] sm:gap-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)] text-sm font-bold text-white sm:h-10 sm:w-10">
            MI
          </span>
          <span className="truncate text-lg font-semibold tracking-tight sm:text-xl">
            MyInterview
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--muted)] md:flex">
          {navLinks.map((link) => {
            const active =
              pathname === link.href ||
              (link.href === "/interview" && pathname.startsWith("/interview"));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition hover:text-[var(--brand)] ${
                  active ? "text-[var(--brand)]" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {loading ? (
            <div className="h-9 w-28 animate-pulse rounded-2xl bg-[var(--line)]" />
          ) : user ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] py-1 pl-1 pr-3">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand)] text-[11px] font-bold text-white">
                    {initials}
                  </span>
                )}
                <span className="max-w-[140px] truncate text-sm font-medium text-[var(--ink)]">
                  {displayName}
                </span>
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-2xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--brand)]"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-2xl border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--brand)]"
              >
                Sign In
              </Link>
              <Link
                href="/auth/login?mode=signup"
                className="rounded-2xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]"
              >
                Start free
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle />
          {!loading && !user ? (
            <Link
              href="/auth/login"
              className="rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ink)]"
            >
              Sign in
            </Link>
          ) : null}
          <button
            type="button"
            className="rounded-xl border border-[var(--line)] p-2 text-[var(--ink)]"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[var(--line)] bg-[var(--surface)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-[var(--ink)]">
            {user ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                  Signed in
                </p>
                <div className="mt-2.5 flex items-center gap-3">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt=""
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
                      {initials}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-[var(--ink)]">
                      {displayName}
                    </p>
                    {email ? (
                      <p className="truncate text-xs text-[var(--muted)]">{email}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mist)] text-[var(--brand)]">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                      Not signed in
                    </p>
                    <p className="text-sm text-[var(--ink)]">
                      Sign in to continue practicing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-2 py-2 hover:bg-[var(--surface-muted)]"
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] px-4 py-2.5 text-center font-semibold"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="rounded-2xl bg-[var(--brand)] px-4 py-2.5 text-center font-semibold text-white"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
