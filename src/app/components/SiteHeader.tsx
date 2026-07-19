"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#resume", label: "Resume" },
  { href: "/interview", label: "Practice" },
  { href: "/#footer", label: "About" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="brand-font flex items-center gap-3 text-[var(--ink)]">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand)] text-sm font-bold text-white">
            MI
          </span>
          <span className="text-xl font-semibold tracking-tight">MyInterview</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href || (link.href === "/interview" && pathname.startsWith("/interview"));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition hover:text-[var(--brand)] ${active ? "text-[var(--brand)]" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/interview"
            className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
          >
            Sign In
          </Link>
          <Link
            href="/#resume"
            className="rounded-2xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]"
          >
            Start free
          </Link>
        </div>

        <button
          type="button"
          className="rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-slate-700">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-2 py-2 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/interview"
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-[var(--brand)] px-4 py-2 text-center font-semibold text-white"
            >
              Start practice
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
