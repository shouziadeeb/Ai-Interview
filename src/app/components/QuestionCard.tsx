import React from "react";

export default function QuestionCard({
  question,
  index,
  total,
}: {
  question: string;
  index?: number;
  total?: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Question
        </p>
        {index && total ? (
          <p className="text-xs tabular-nums text-[var(--muted)] opacity-70">
            {index} of {total}
          </p>
        ) : null}
      </div>
      <p className="brand-font mt-2 text-lg font-semibold leading-7 tracking-tight text-[var(--ink)] sm:text-xl sm:leading-8">
        {question || "Loading your next question..."}
      </p>
    </div>
  );
}
