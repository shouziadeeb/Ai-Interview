import Link from "next/link";

const footerColumns = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#resume", label: "Resume analysis" },
      { href: "/#history", label: "Interview history" },
      { href: "/interview", label: "Mock interview" },
    ],
  },
  {
    title: "Practice",
    links: [
      { href: "/interview", label: "Technical questions" },
      { href: "/interview", label: "Behavioral rounds" },
      { href: "/#resume", label: "Resume-based coaching" },
    ],
  },
  {
    title: "Creator",
    links: [
      { href: "/#about", label: "About Shouzab" },
      { href: "/#contact", label: "Contact" },
      { href: "mailto:shouziadeeb123@gmail.com", label: "Email" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer id="footer" className="border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="brand-font flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand)] text-sm font-bold text-white">
              MI
            </span>
            <span className="text-xl font-semibold text-[var(--ink)]">MyInterview</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--muted)]">
            AI mock interview practice tailored to your resume, skills, and experience.
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Created by{" "}
            <Link href="/#about" className="font-semibold text-[var(--ink)] hover:text-[var(--brand)]">
              Shouzab Farooqui
            </Link>
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-semibold text-[var(--ink)]">{column.title}</p>
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              {column.links.map((link) => (
                <li key={`${column.title}-${link.label}`}>
                  <Link href={link.href} className="transition hover:text-[var(--brand)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} MyInterview · Built by Shouzab Farooqui</p>
          <p>
            <a
              href="mailto:shouziadeeb123@gmail.com"
              className="transition hover:text-[var(--brand)]"
            >
              shouziadeeb123@gmail.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
