import Link from "next/link";

const footerColumns = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#resume", label: "Resume analysis" },
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
    title: "Company",
    links: [
      { href: "/#footer", label: "About" },
      { href: "/#footer", label: "Contact" },
      { href: "/#footer", label: "Support" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer id="footer" className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="brand-font flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand)] text-sm font-bold text-white">
              MI
            </span>
            <span className="text-xl font-semibold text-slate-900">MyInterview</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">
            AI mock interview practice tailored to your resume, skills, and experience.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-semibold text-slate-900">{column.title}</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
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

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} MyInterview. All rights reserved.</p>
          <p>Built for confident, interview-ready candidates.</p>
        </div>
      </div>
    </footer>
  );
}
