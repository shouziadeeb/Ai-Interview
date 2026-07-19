import ReactMarkdown from "react-markdown";
import React from "react";
import { AlertTriangle, CheckCircle, Info, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useInterview } from "../context/InterviewContext";
import SiteShell from "./SiteShell";

function getFeedbackType(feedback: string) {
  if (!feedback)
    return {
      color: "border-[var(--line)] bg-[var(--surface-muted)]",
      icon: <Info className="text-[var(--muted)]" size={22} />,
      label: "Info",
    };
  if (/good|well|excellent|great|strong|impressive/i.test(feedback)) {
    return {
      color: "border-emerald-500/25 bg-[var(--success-soft)]",
      icon: <CheckCircle className="text-[var(--success)]" size={22} />,
      label: "Positive",
    };
  }
  if (
    /improve|could|should|suggest|try|consider|weak|missed|lacking/i.test(
      feedback
    )
  ) {
    return {
      color: "border-amber-500/25 bg-[var(--warning-soft)]",
      icon: <AlertTriangle className="text-[var(--warning)]" size={22} />,
      label: "Suggestion",
    };
  }
  return {
    color: "border-[var(--line)] bg-[var(--surface-muted)]",
    icon: <Info className="text-[var(--muted)]" size={22} />,
    label: "Info",
  };
}

interface QA {
  question: string;
  answer: string;
  feedback?: string;
}

interface FeedbackProps {
  qaPairs: QA[];
  loading: boolean;
}

const Feedback = ({ qaPairs, loading }: FeedbackProps) => {
  const router = useRouter();
  const { resetInterview } = useInterview();

  const handleRedirect = () => {
    resetInterview();
    router.push("/");
  };

  if (loading || !qaPairs.length) {
    return (
      <SiteShell mainClassName="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="soft-panel rounded-[32px] p-8 md:p-10">
            <div className="flex items-center justify-center gap-3 text-[var(--brand)]">
              <Sparkles className="h-5 w-5" />
              <h2 className="brand-font text-3xl font-semibold text-[var(--ink)]">
                Your interview feedback
              </h2>
            </div>
            <div className="mt-8 space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-[20px] border border-[var(--line)] bg-[var(--surface-muted)] p-4"
                >
                  <div className="h-4 w-1/3 rounded-2xl bg-[var(--line)]" />
                  <div className="mt-3 h-3 w-2/3 rounded-2xl bg-[var(--line)] opacity-70" />
                  <div className="mt-2 h-3 w-1/2 rounded-2xl bg-[var(--line)] opacity-50" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell mainClassName="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="soft-panel rounded-[32px] p-8 md:p-10">
          <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--mist)] px-3 py-1 text-sm font-medium text-[var(--brand)]">
                <Sparkles className="h-4 w-4" />
                Performance review
              </div>
              <h2 className="brand-font mt-4 text-3xl font-semibold text-[var(--ink)]">
                Your interview feedback
              </h2>
              <p className="mt-2 text-[var(--muted)]">
                Review your strongest moments and the areas worth refining.
              </p>
            </div>
            <button
              onClick={handleRedirect}
              className="rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]"
            >
              Back to home
            </button>
          </div>

          <ul className="mt-8 space-y-5">
            {qaPairs.map((qa, idx) => {
              const style = getFeedbackType(qa.feedback || "");
              return (
                <li
                  key={idx}
                  className={`rounded-[24px] border p-5 ${style.color}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{style.icon}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-[var(--ink)]">
                          Q{idx + 1}: {qa.question}
                        </p>
                        <span className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                          {style.label}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                        <span className="font-medium text-[var(--ink)]">
                          Answer:
                        </span>{" "}
                        {qa.answer}
                      </p>
                      {qa.feedback && (
                        <div className="prose prose-sm mt-4 max-w-none text-[var(--muted)] dark:prose-invert">
                          <ReactMarkdown>{qa.feedback}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </SiteShell>
  );
};

export default Feedback;
