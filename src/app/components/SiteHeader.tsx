"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#resume", label: "Resume" },
  { href: "/interview", label: "Practice" },
  { href: "/#about", label: "About" },
];

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

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Account";

  return (
    <header className="site-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="brand-font flex items-center gap-3 text-[var(--ink)]">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand)] text-sm font-bold text-white">
            MI
          </span>
          <span className="text-xl font-semibold tracking-tight">MyInterview</span>
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
            <div className="h-9 w-20 animate-pulse rounded-2xl bg-[var(--line)]" />
          ) : user ? (
            <>
              <span className="max-w-[140px] truncate text-sm font-medium text-[var(--muted)]">
                {displayName}
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

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-xl border border-[var(--line)] p-2 text-[var(--ink)]"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[var(--line)] bg-[var(--surface)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-[var(--ink)]">
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
                className="rounded-2xl border border-[var(--line)] px-4 py-2 text-center font-semibold"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="rounded-2xl bg-[var(--brand)] px-4 py-2 text-center font-semibold text-white"
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
