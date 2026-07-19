import React from "react";
import { HelpCircle } from "lucide-react";

export default function QuestionCard({ question }: { question: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]">
          <HelpCircle className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Current question
          </p>
          <p className="brand-font mt-3 text-xl font-semibold leading-8 text-slate-900 md:text-2xl">
            {question || "Loading your next question..."}
          </p>
        </div>
      </div>
    </div>
  );
}
