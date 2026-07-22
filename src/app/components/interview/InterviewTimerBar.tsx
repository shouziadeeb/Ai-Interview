"use client";

import {
  formatCountdown,
  useInterviewTimerStore,
} from "../../lib/stores/interviewTimerStore";
import { LogOut } from "lucide-react";

type InterviewTimerBarProps = {
  title?: string;
  questionNumber: number;
  questionTotal: number;
  progressLabel?: string;
  onEndInterview?: () => void;
};

export default function InterviewTimerBar({
  title = "Software Engineering Interview",
  questionNumber,
  questionTotal,
  progressLabel,
  onEndInterview,
}: InterviewTimerBarProps) {
  const totalSecondsLeft = useInterviewTimerStore((s) => s.totalSecondsLeft);
  const questionSecondsLeft = useInterviewTimerStore(
    (s) => s.questionSecondsLeft
  );
  const isRunning = useInterviewTimerStore((s) => s.isRunning);

  const totalUrgent = totalSecondsLeft <= 60;
  const questionUrgent = questionSecondsLeft <= 15;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Live session
          </p>
          <p className="brand-font mt-1 truncate text-lg font-semibold text-[var(--ink)] sm:text-xl">
            {title}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Question {questionNumber}/{questionTotal}
            {progressLabel ? (
              <span className="text-[var(--muted)]"> · Answered {progressLabel}</span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div
            className={`min-w-[7.5rem] rounded-xl border px-3 py-2 text-right ${
              questionUrgent
                ? "border-[var(--warning)]/40 bg-[var(--warning-soft)]"
                : "border-[var(--line)] bg-[var(--surface-muted)]"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              This question
            </p>
            <p
              className={`font-mono text-base font-semibold tabular-nums ${
                questionUrgent ? "text-[var(--warning)]" : "text-[var(--ink)]"
              }`}
            >
              {formatCountdown(questionSecondsLeft)}
            </p>
          </div>

          <div
            className={`min-w-[8.5rem] rounded-xl border px-3 py-2 text-right ${
              totalUrgent
                ? "border-[var(--danger)]/40 bg-[var(--danger-soft)]"
                : "border-[var(--line)] bg-[var(--surface-muted)]"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Total left
            </p>
            <p
              className={`font-mono text-lg font-semibold tabular-nums ${
                totalUrgent ? "text-[var(--danger)]" : "text-[var(--ink)]"
              }`}
            >
              {formatCountdown(totalSecondsLeft)}
              {!isRunning && totalSecondsLeft > 0 ? (
                <span className="ml-1 text-xs font-medium text-[var(--muted)]">
                  paused
                </span>
              ) : null}
            </p>
          </div>

          {onEndInterview ? (
            <button
              type="button"
              onClick={onEndInterview}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--danger)]/35 bg-[var(--danger-soft)] px-3 py-2.5 text-sm font-semibold text-[var(--danger)] transition hover:border-[var(--danger)]"
            >
              <LogOut className="h-4 w-4" />
              End interview
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
