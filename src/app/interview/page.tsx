"use client";

import { useEffect, useState } from "react";
import { useInterview } from "../context/InterviewContext";
import QuestionCard from "../components/QuestionCard";
import MicRecorder from "../components/MicRecorder";
import Feedback from "../components/Feedback";
import Loader from "../components/Loader";
import SiteShell from "../components/SiteShell";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function InterviewPage() {
  type Question = { question: string };
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const { addQAPair, qaPairs, applyFeedbacks } = useInterview();
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [submitHint, setSubmitHint] = useState("");

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const storedAnalysisRaw = window.localStorage.getItem("resumeAnalysis");
        const analysis = storedAnalysisRaw ? JSON.parse(storedAnalysisRaw) : null;

        if (analysis) {
          const generated = await fetch("/api/generate-questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              skills: analysis.skills || [],
              technologies: analysis.technologies || [],
              experience: analysis.experience || "",
              projects: analysis.projects || [],
            }),
          });

          if (generated.ok) {
            const data = await generated.json();
            if (Array.isArray(data.questions) && data.questions.length > 0) {
              setQuestions(
                data.questions.map((item: { question: string }) => ({
                  question: item.question,
                }))
              );
              return;
            }
          }
        }
      } catch (error) {
        console.warn("Personalized question generation failed, using defaults:", error);
      }

      const res = await fetch("/api/questions");
      const data = await res.json();
      setQuestions(data);
    };

    loadQuestions();
  }, []);

  const handleNext = async () => {
    const currentQuestion = questions[currentIndex]?.question;
    if (!currentQuestion) return;

    if (!answer.trim()) {
      setSubmitHint("Record or type an answer before moving on.");
      return;
    }

    addQAPair({
      question: currentQuestion,
      answer: answer.trim(),
    });
    fetch("/api/answers", {
      method: "POST",
      body: JSON.stringify({ question: currentQuestion, answer }),
      headers: { "Content-Type": "application/json" },
    });
    setAnswer("");
    setFeedbackError("");
    setSubmitHint("");
    setCurrentIndex((prev) => prev + 1);
  };

  const fetchFeedback = async () => {
    if (isLoading) return;

    const pairsForReview = [...qaPairs];
    const activeQuestion = questions[currentIndex]?.question;
    if (
      activeQuestion &&
      answer.trim() &&
      !pairsForReview.some((pair) => pair.question === activeQuestion)
    ) {
      pairsForReview.push({ question: activeQuestion, answer: answer.trim() });
      addQAPair({ question: activeQuestion, answer: answer.trim() });
    }

    if (pairsForReview.length === 0) {
      setFeedbackError("Submit at least one answer before requesting feedback.");
      return;
    }

    setIsLoading(true);
    setFeedbackError("");

    try {
      const res = await fetch(`/api/feedback`, {
        method: "POST",
        body: JSON.stringify({
          answers: pairsForReview.map(({ question, answer: pairAnswer }) => ({
            question,
            answer: pairAnswer,
          })),
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || data?.details || "Unable to generate feedback");
      }

      const feedbacks = Array.isArray(data?.feedbacks) ? data.feedbacks : [];
      if (!feedbacks.length) {
        throw new Error("No feedback was returned. Please try again.");
      }

      applyFeedbacks(feedbacks);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setFeedbackError(
        err instanceof Error ? err.message : "Unable to generate feedback right now."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeedback = qaPairs.some((pair) => Boolean(pair.feedback));
  if (hasFeedback) {
    return <Feedback qaPairs={qaPairs} loading={isLoading} />;
  }

  const progressValue = questions.length
    ? (Math.min(currentIndex, questions.length) / questions.length) * 100
    : 0;
  const isSessionComplete = questions.length > 0 && currentIndex >= questions.length;
  const progressLabel = questions.length
    ? `${Math.min(currentIndex, questions.length)} / ${questions.length}`
    : "—";
  const hasAnswer = answer.trim().length > 0;
  const activeStep = isSessionComplete ? 3 : hasAnswer ? 3 : 2;

  return (
    <SiteShell mainClassName="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <header className="flex flex-col gap-3 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              Practice session
            </p>
            <h1 className="brand-font mt-1 text-xl font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">
              Mock interview
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {!isSessionComplete && questions.length > 0 ? (
              <nav
                aria-label="Session steps"
                className="flex items-center gap-1 text-xs text-[var(--muted)]"
              >
                {[
                  { n: 1, label: "Question" },
                  { n: 2, label: "Record" },
                  { n: 3, label: "Submit" },
                ].map((step, index) => (
                  <div key={step.n} className="flex items-center gap-1">
                    {index > 0 ? (
                      <span className="mx-1 opacity-40">/</span>
                    ) : null}
                    <span
                      className={
                        activeStep === step.n || (hasAnswer && step.n < 3)
                          ? "font-semibold text-[var(--ink)]"
                          : ""
                      }
                    >
                      {step.n}. {step.label}
                    </span>
                  </div>
                ))}
              </nav>
            ) : null}

            <div className="flex min-w-[140px] items-center gap-3">
              <span className="text-xs font-medium text-[var(--muted)]">
                Progress
              </span>
              <div className="h-1.5 flex-1 rounded-full bg-[var(--line)]">
                <div
                  className="h-1.5 rounded-full bg-[var(--brand)] transition-all"
                  style={{
                    width: `${isSessionComplete ? 100 : progressValue}%`,
                  }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums text-[var(--ink)]">
                {progressLabel}
              </span>
            </div>
          </div>
        </header>

        {!questions.length ? (
          <section className="panel rounded-xl p-6">
            <div className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-[var(--line)]" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-[var(--line)]" />
              <div className="mt-6 h-40 animate-pulse rounded-lg bg-[var(--surface-muted)]" />
            </div>
          </section>
        ) : isSessionComplete ? (
          <section className="panel rounded-xl p-6 sm:p-8">
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="brand-font mt-4 text-xl font-semibold text-[var(--ink)]">
                Session complete
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                You answered {qaPairs.length} question
                {qaPairs.length === 1 ? "" : "s"}. Review coaching notes to
                refine your delivery.
              </p>
              <button
                onClick={fetchFeedback}
                disabled={isLoading || qaPairs.length === 0}
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Generating feedback..." : "Review feedback"}
              </button>
              {feedbackError ? (
                <p className="mt-3 text-sm text-[var(--danger)]">{feedbackError}</p>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="panel overflow-hidden rounded-xl">
            <div className="grid lg:grid-cols-[1fr_1.15fr]">
              <div className="flex flex-col border-b border-[var(--line)] p-5 lg:border-b-0 lg:border-r lg:p-6">
                <QuestionCard
                  question={questions[currentIndex]?.question}
                  index={currentIndex + 1}
                  total={questions.length}
                />

                <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4 text-xs">
                  <span className="text-[var(--muted)]">Answer status</span>
                  <span
                    className={`inline-flex items-center gap-1.5 font-medium ${
                      hasAnswer
                        ? "text-[var(--success)]"
                        : "text-[var(--muted)]"
                    }`}
                  >
                    {hasAnswer ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Ready to submit
                      </>
                    ) : (
                      "Awaiting response"
                    )}
                  </span>
                </div>

                <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row sm:items-center">
                  <button
                    onClick={handleNext}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                      hasAnswer
                        ? "bg-[var(--brand)] text-white hover:bg-[var(--brand-deep)]"
                        : "cursor-not-allowed bg-[var(--surface-muted)] text-[var(--muted)]"
                    }`}
                  >
                    Submit & next <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  {currentIndex > 0 ? (
                    <button
                      onClick={fetchFeedback}
                      disabled={isLoading || qaPairs.length === 0}
                      className="inline-flex items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? "Generating..." : "Get feedback"}
                    </button>
                  ) : null}
                </div>
                {submitHint ? (
                  <p className="mt-2 text-xs text-[var(--warning)]">{submitHint}</p>
                ) : null}
                {feedbackError ? (
                  <p className="mt-2 text-xs text-[var(--danger)]">
                    {feedbackError}
                  </p>
                ) : null}
              </div>

              <div className="bg-[var(--surface-muted)] p-5 lg:p-6">
                <MicRecorder
                  onComplete={setAnswer}
                  currentIndex={currentIndex}
                />
              </div>
            </div>
          </section>
        )}
      </div>
      {isLoading && <Loader />}
    </SiteShell>
  );
}
