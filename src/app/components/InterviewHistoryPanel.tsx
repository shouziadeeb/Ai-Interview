"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  LoaderCircle,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type {
  InterviewResultRecord,
  UserInterviewStats,
} from "../lib/types";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatDuration(seconds: number | null | undefined) {
  if (seconds == null || seconds < 0) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins <= 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

function scoreLabel(score: number | null | undefined) {
  if (score == null || Number.isNaN(score)) return "—";
  return `${score}/10`;
}

type InterviewHistoryPanelProps = {
  /** Compact mode for the interview lobby */
  compact?: boolean;
  className?: string;
};

export default function InterviewHistoryPanel({
  compact = false,
  className = "",
}: InterviewHistoryPanelProps) {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<InterviewResultRecord[]>([]);
  const [stats, setStats] = useState<UserInterviewStats | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user) {
      setResults([]);
      setStats(null);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/interview-results");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.details || data?.error || "Unable to load history");
      }
      setResults(Array.isArray(data.results) ? data.results : []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load history");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void loadHistory();
  }, [authLoading, loadHistory]);

  if (authLoading) {
    return (
      <div
        className={`rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 ${className}`}
      >
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading your performance…
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <section
        id="history"
        className={`soft-panel rounded-[28px] p-7 md:p-9 ${className}`}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
          Performance
        </p>
        <h2 className="brand-font mt-3 text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
          Track your interview progress
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          Sign in to save up to five interview results — last score, best score,
          and coaching notes from each session.
        </p>
        <Link
          href="/auth/login?next=%2F%23history"
          className="mt-6 inline-flex rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]"
        >
          Sign in to view history
        </Link>
      </section>
    );
  }

  const completed = stats?.interviews_completed ?? results.length;

  return (
    <section
      id="history"
      className={`soft-panel scroll-mt-24 rounded-[28px] p-7 md:p-9 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Performance
          </p>
          <h2 className="brand-font mt-3 text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
            Your interview history
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Latest {results.length || 0} of up to 5 saved sessions
            {stats?.last_interview_at
              ? ` · Last practiced ${formatDate(stats.last_interview_at)}`
              : ""}
            .
          </p>
        </div>
        {!compact ? (
          <Link
            href="/interview"
            className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--brand)]"
          >
            Practice again
          </Link>
        ) : null}
      </div>

      <div
        className={`mt-6 grid gap-3 ${
          compact ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        <StatCard
          icon={Trophy}
          label="Best score"
          value={scoreLabel(stats?.best_score)}
        />
        <StatCard
          icon={Award}
          label="Last score"
          value={scoreLabel(stats?.last_score)}
        />
        <StatCard
          icon={Sparkles}
          label="Sessions saved"
          value={String(completed)}
        />
        {!compact ? (
          <StatCard
            icon={CalendarDays}
            label="Last interview"
            value={
              stats?.last_interview_at
                ? formatDate(stats.last_interview_at)
                : "None yet"
            }
          />
        ) : null}
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-[var(--muted)]">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Fetching your results…
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-[var(--danger)]">
          {error.includes("relation") || error.includes("does not exist")
            ? "History tables are not set up yet. Run the Supabase migration (001_interview_results.sql), then finish an interview while signed in."
            : error}
        </p>
      ) : null}

      {!loading && !error && results.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-muted)] p-5 text-sm leading-7 text-[var(--muted)]">
          No saved interviews yet. Complete a mock interview while signed in and
          your scores will appear here.
        </div>
      ) : null}

      {results.length > 0 ? (
        <ul className={`mt-6 space-y-3 ${compact ? "max-h-72 overflow-y-auto pr-1" : ""}`}>
          {results.map((result) => {
            const open = expandedId === result.id;
            return (
              <li
                key={result.id}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(open ? null : result.id)
                  }
                  className="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-[var(--surface-muted)] sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[var(--ink)]">
                        {result.title || "Software Engineering Interview"}
                      </p>
                      <span className="rounded-lg bg-[var(--mist)] px-2 py-0.5 text-xs font-semibold text-[var(--brand)]">
                        {scoreLabel(result.overall_score)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(result.created_at)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {formatDuration(result.duration_seconds)}
                      </span>
                      <span>
                        {result.questions_answered} question
                        {result.questions_answered === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                  {open ? (
                    <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-[var(--muted)]" />
                  ) : (
                    <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-[var(--muted)]" />
                  )}
                </button>

                {open ? (
                  <div className="border-t border-[var(--line)] px-4 py-4 sm:px-5">
                    {result.strengths?.length ? (
                      <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                          Strengths noted
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-[var(--ink)]">
                          {result.strengths.slice(0, 4).map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {Array.isArray(result.qa_pairs) && result.qa_pairs.length > 0 ? (
                      <ul className="space-y-3">
                        {result.qa_pairs.map((pair, index) => (
                          <li
                            key={`${result.id}-${index}`}
                            className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3"
                          >
                            <p className="text-sm font-semibold text-[var(--ink)]">
                              Q{index + 1}: {pair.question}
                            </p>
                            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                              <span className="font-medium text-[var(--ink)]">
                                Answer:
                              </span>{" "}
                              {pair.answer}
                            </p>
                            {pair.feedback ? (
                              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                                <span className="font-medium text-[var(--ink)]">
                                  Feedback:
                                </span>{" "}
                                {pair.feedback}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : result.feedback_summary ? (
                      <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">
                        {result.feedback_summary}
                      </p>
                    ) : (
                      <p className="text-sm text-[var(--muted)]">
                        No detailed notes saved for this session.
                      </p>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-4">
      <div className="flex items-center gap-2 text-[var(--brand)]">
        <Icon className="h-4 w-4" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          {label}
        </p>
      </div>
      <p className="brand-font mt-2 truncate text-xl font-semibold text-[var(--ink)]">
        {value}
      </p>
    </div>
  );
}
