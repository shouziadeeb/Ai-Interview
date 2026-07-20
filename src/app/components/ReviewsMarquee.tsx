"use client";

import { useEffect, useId, useState } from "react";
import { Star, X } from "lucide-react";

export type Review = {
  id: string;
  name: string;
  company: string;
  rating: number;
  text: string;
  when: string;
  initials: string;
  accent: string;
};

export const reviews: Review[] = [
  {
    id: "1",
    name: "Umar Farooq",
    company: "Blkbox.AI",
    rating: 5,
    text: "MyInterview helped me tighten my answers before a tough tech round. The voice practice felt realistic, and the feedback on structure was exactly what I needed. I walked into the interview more confident than usual.",
    when: "2 weeks ago",
    initials: "UF",
    accent: "#1d4ed8",
  },
  {
    id: "2",
    name: "Ameed Faridi",
    company: "Amazon",
    rating: 5,
    text: "I used this for Amazon-style behavioral prep. Recording my answers out loud exposed fillers I never noticed when typing. Resume-based questions made practice feel personal instead of generic.",
    when: "3 weeks ago",
    initials: "AF",
    accent: "#0f766e",
  },
  {
    id: "3",
    name: "Adeel Faridi",
    company: "Amazon",
    rating: 5,
    text: "Clear UI, calm flow, and solid coaching notes after each session. The editable transcript is a game changer — speak first, polish later. Highly recommend for anyone preparing seriously.",
    when: "1 month ago",
    initials: "AD",
    accent: "#b45309",
  },
  {
    id: "4",
    name: "Ashar Farooq",
    company: "Google",
    rating: 5,
    text: "Practiced system-design and behavioral prompts tailored to my resume. The mock flow kept me focused and the feedback highlighted gaps I could fix before the real loop.",
    when: "1 month ago",
    initials: "AS",
    accent: "#be123c",
  },
  {
    id: "5",
    name: "Priya Sharma",
    company: "Microsoft",
    rating: 5,
    text: "Finally a practice tool that doesn’t feel like a quiz app. Voice recording plus AI notes helped me sound clearer and more structured in under a week.",
    when: "5 days ago",
    initials: "PS",
    accent: "#4338ca",
  },
  {
    id: "6",
    name: "Rohan Mehta",
    company: "Flipkart",
    rating: 4,
    text: "Great for warming up before onsite rounds. Questions matched my stack well. Would love even more scenario depth, but the core experience is already strong.",
    when: "2 months ago",
    initials: "RM",
    accent: "#0369a1",
  },
  {
    id: "7",
    name: "Sara Khan",
    company: "Accenture",
    rating: 5,
    text: "I was nervous about speaking in interviews. This platform made daily practice easy. Seeing my transcript after each take helped me cut rambling and lead with impact.",
    when: "3 months ago",
    initials: "SK",
    accent: "#7c2d12",
  },
  {
    id: "8",
    name: "Daniel Brooks",
    company: "Stripe",
    rating: 5,
    text: "Clean design and useful feedback. Resume upload → personalized questions is the workflow every interview coach should have. Saved me hours of guessing what to practice.",
    when: "6 days ago",
    initials: "DB",
    accent: "#334155",
  },
  {
    id: "9",
    name: "Ananya Iyer",
    company: "Deloitte",
    rating: 5,
    text: "Used MyInterview for consulting-style behavioral prep. The prompts felt relevant and the review notes were practical — not fluff. Booking another session this weekend.",
    when: "3 weeks ago",
    initials: "AI",
    accent: "#115e59",
  },
  {
    id: "10",
    name: "Marcus Lee",
    company: "Meta",
    rating: 4,
    text: "Solid mock interviews with voice capture. Helped me rehearse STAR answers until they felt natural. Dark mode is a nice touch for late-night practice.",
    when: "2 months ago",
    initials: "ML",
    accent: "#1e40af",
  },
  {
    id: "11",
    name: "Fatima Noor",
    company: "Infosys",
    rating: 5,
    text: "As a fresher, I needed structure more than random questions. MyInterview gave me a calm path: upload resume, record answers, get feedback, repeat. Big confidence boost.",
    when: "4 weeks ago",
    initials: "FN",
    accent: "#9f1239",
  },
  {
    id: "12",
    name: "Kabir Singh",
    company: "Zomato",
    rating: 5,
    text: "The voice-first flow is what sold me. I practice while walking, then edit the transcript later. Feedback after the session is sharp and actionable.",
    when: "1 week ago",
    initials: "KS",
    accent: "#c2410c",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-3.5 w-3.5 ${
            index < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

function CompanyMark({ company }: { company: string }) {
  const key = company.toLowerCase();
  const className = "h-4 w-4 shrink-0";

  if (key.includes("google")) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    );
  }

  if (key.includes("amazon")) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#FF9900"
          d="M13.5 9.2c0-.9-.3-1.6-1-2-.5-.3-1.1-.5-1.9-.5-1 0-1.8.3-2.4.8l.5.7c.5-.4 1.1-.6 1.8-.6.5 0 .9.1 1.2.3.3.2.4.5.4 1v.3H11c-1.4 0-2.1.5-2.1 1.4 0 .5.2.8.5 1.1.4.3.9.4 1.5.4.6 0 1.1-.1 1.5-.4.2-.1.4-.3.5-.5v.8h.9c0-.2.1-.5.1-.8V9.2zm-1.2 1.6c-.2.3-.6.5-1.1.5-.6 0-1-.3-1-.7 0-.5.4-.7 1.2-.7h.9v.9z"
        />
        <path
          fill="#FF9900"
          d="M16.4 11.6c-.4 0-.8-.1-1.1-.3-.3-.2-.5-.5-.6-.9l.9-.2c0 .2.1.4.3.5.2.1.4.2.6.2.4 0 .6-.2.6-.4 0-.2-.1-.3-.4-.4l-.7-.3c-.6-.2-.9-.6-.9-1.1 0-.4.2-.8.5-1 .3-.3.8-.4 1.3-.4.4 0 .7.1 1 .3.3.2.4.4.5.8l-.9.2c0-.2-.1-.3-.3-.4-.1-.1-.3-.1-.5-.1-.3 0-.5.1-.5.3s.2.3.6.5l.6.2c.5.2.8.5.8 1 0 .5-.2.8-.5 1.1-.4.2-.8.4-1.3.4z"
        />
        <path
          fill="none"
          stroke="#FF9900"
          strokeWidth="1.4"
          strokeLinecap="round"
          d="M7 16.5c2.2 1.5 5.2 2.2 8.2 1.6"
        />
        <path fill="#FF9900" d="M15.8 16.8l1.1-.1-.4 1.2-.7-1.1z" />
      </svg>
    );
  }

  if (key.includes("meta")) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#0866FF"
          d="M12.5 6.2c1.3-1.4 3.1-2 4.7-2 1.9 0 3.3.7 4.1 2.1.6 1.1.8 2.5.8 4.4v7.1h-3.3v-6.5c0-1.3-.1-2.3-.5-3-.5-.8-1.3-1.2-2.4-1.2-1.3 0-2.3.7-2.9 1.4-.1.1-.2.3-.3.4v8.9H9.5V6.4h3v-.2zm-6.3-.2C7.8 6 9 7.4 9.5 8.9v8.9H6.3v-7c0-1.1-.4-1.9-1.4-1.9-.9 0-1.5.6-1.8 1.3-.1.2-.1.5-.1.8v6.8H0V6.4h3v.8c.7-1 1.8-1.4 3.2-1.2z"
        />
      </svg>
    );
  }

  if (key.includes("microsoft")) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#F25022" d="M3 3h8.5v8.5H3z" />
        <path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z" />
        <path fill="#00A4EF" d="M3 12.5h8.5V21H3z" />
        <path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z" />
      </svg>
    );
  }

  if (key.includes("stripe")) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#635BFF"
          d="M12.4 9.6c0-.8.6-1.1 1.7-1.1 1.5 0 3.4.5 4.9 1.3V6.5A12 12 0 0 0 14.1 5c-3.5 0-5.9 1.8-5.9 4.9 0 4.8 6.6 4 6.6 6.1 0 .9-.8 1.2-1.9 1.2-1.6 0-3.7-.7-5.3-1.6v3.4c1.7.8 3.5 1.2 5.3 1.2 3.7 0 6.2-1.8 6.2-4.9-.1-5.2-7-4.3-7-6.1z"
        />
      </svg>
    );
  }

  if (key.includes("deloitte")) {
    return (
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[#86BC25] text-[8px] font-black text-black"
        aria-hidden="true"
      >
        D
      </span>
    );
  }

  if (key.includes("accenture")) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#A100FF"
          d="M3.2 17.5 11.4 4.8h2.3L21 17.5h-2.6l-1.5-2.4H7.2l-1.5 2.4H3.2zm5.2-4.4h7.4L12.1 7.5 8.4 13.1z"
        />
      </svg>
    );
  }

  if (key.includes("flipkart")) {
    return (
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[#2874F0] text-[9px] font-black text-white"
        aria-hidden="true"
      >
        F
      </span>
    );
  }

  if (key.includes("infosys")) {
    return (
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[#007CC3] text-[8px] font-black text-white"
        aria-hidden="true"
      >
        Inf
      </span>
    );
  }

  if (key.includes("zomato")) {
    return (
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E23744] text-[9px] font-black text-white"
        aria-hidden="true"
      >
        Z
      </span>
    );
  }

  if (key.includes("blkbox")) {
    return (
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[#111827] text-[8px] font-black text-white ring-1 ring-[#38bdf8]"
        aria-hidden="true"
      >
        B
      </span>
    );
  }

  return (
    <span
      className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[var(--mist)] text-[9px] font-bold text-[var(--brand)]"
      aria-hidden="true"
    >
      {company.slice(0, 1).toUpperCase()}
    </span>
  );
}

function ReviewCard({
  review,
  onOpen,
}: {
  review: Review;
  onOpen: (review: Review) => void;
}) {
  const preview =
    review.text.length > 120
      ? `${review.text.slice(0, 120).trimEnd()}…`
      : review.text;

  return (
    <button
      type="button"
      onClick={() => onOpen(review)}
      className="review-card panel w-[300px] shrink-0 rounded-2xl p-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-[var(--brand)] sm:w-[320px]"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: review.accent }}
        >
          {review.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--ink)]">
            {review.name}
          </p>
          <Stars rating={review.rating} />
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {preview}{" "}
        {review.text.length > 120 ? (
          <span className="font-semibold text-[var(--ink)]">Show More</span>
        ) : null}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
          <CompanyMark company={review.company} />
          {review.company}
        </span>
        <span className="text-xs text-[var(--muted)]">{review.when}</span>
      </div>
    </button>
  );
}

export default function ReviewsMarquee() {
  const [active, setActive] = useState<Review | null>(null);
  const [paused, setPaused] = useState(false);
  const titleId = useId();
  const loop = [...reviews, ...reviews];

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [active]);

  return (
    <section id="reviews" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Reviews
          </p>
          <h2 className="brand-font mt-3 text-3xl font-semibold text-[var(--ink)]">
            What practitioners are saying
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
            Real-style feedback from candidates preparing for roles at top
            companies. Click any card to read the full review.
          </p>
        </div>
      </div>

      <div
        className="review-marquee-mask relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className={`review-marquee-track flex w-max gap-4 px-4 ${
            paused || active ? "review-marquee-paused" : ""
          }`}
        >
          {loop.map((review, index) => (
            <ReviewCard
              key={`${review.id}-${index}`}
              review={review}
              onOpen={setActive}
            />
          ))}
        </div>
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={() => setActive(null)}
        >
          <div
            className="panel w-full max-w-lg rounded-2xl p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: active.accent }}
                >
                  {active.initials}
                </span>
                <div>
                  <h3
                    id={titleId}
                    className="text-base font-semibold text-[var(--ink)]"
                  >
                    {active.name}
                  </h3>
                  <Stars rating={active.rating} />
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {active.company} · {active.when}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-lg border border-[var(--line)] p-2 text-[var(--muted)] transition hover:text-[var(--ink)]"
                aria-label="Close review"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
              {active.text}
            </p>

            <div className="mt-5 flex items-center gap-1.5 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
              <CompanyMark company={active.company} />
              {active.company}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
