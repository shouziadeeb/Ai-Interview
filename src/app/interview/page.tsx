"use client";

import { useEffect, useState } from "react";
import { useInterview } from "../context/InterviewContext";
import QuestionCard from "../components/QuestionCard";
import MicRecorder from "../components/MicRecorder";
import Feedback from "../components/Feedback";
import Loader from "../components/Loader";
import SiteShell from "../components/SiteShell";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function InterviewPage() {
  type Question = { question: string };
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const { addQAPair, qaPairs, applyFeedbacks } = useInterview();
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

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

    addQAPair({
      question: currentQuestion,
      answer: answer.trim() || "No answer provided.",
    });
    fetch("/api/answers", {
      method: "POST",
      body: JSON.stringify({ question: currentQuestion, answer }),
      headers: { "Content-Type": "application/json" },
    });
    setAnswer("");
    setFeedbackError("");
    setCurrentIndex((prev) => prev + 1);
  };

  const fetchFeedback = async () => {
    if (isLoading) return;

    // Include the in-progress answer if the user requests feedback mid-question.
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
    ? `${Math.min(currentIndex, questions.length)}/${questions.length}`
    : "—";

  return (
    <SiteShell mainClassName="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="soft-panel rounded-[28px] p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-[var(--mist)] px-3 py-1 text-sm font-medium text-[var(--brand)]">
                <Sparkles className="h-4 w-4" />
                Practice session
              </div>
              <h1 className="brand-font mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
                Fine-tune your answers with calm, focused preparation.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Move through realistic questions, record your responses, and build
                confidence with each step.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-4">
                <span>Progress</span>
                <span className="font-semibold text-slate-900">{progressLabel}</span>
              </div>
              <div className="mt-3 h-2 w-56 max-w-full rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-[var(--brand)] transition-all"
                  style={{ width: `${isSessionComplete ? 100 : progressValue}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {!questions.length ? (
          <section className="soft-panel rounded-[28px] p-8 md:p-12">
            <div className="flex flex-col items-center space-y-3">
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-6 w-40 animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-4 w-64 animate-pulse rounded-2xl bg-slate-100" />
            </div>
            <div className="mt-8 space-y-4">
              <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-64 animate-pulse rounded-3xl bg-slate-50" />
            </div>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="soft-panel rounded-[28px] p-6 md:p-8">
              {isSessionComplete ? (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 md:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Session complete
                  </p>
                  <p className="brand-font mt-3 text-2xl font-semibold text-slate-900">
                    You answered {qaPairs.length} question{qaPairs.length === 1 ? "" : "s"}.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Click review feedback to get coaching notes on every answer you submitted.
                  </p>
                </div>
              ) : (
                <QuestionCard question={questions[currentIndex]?.question} />
              )}

              <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Current focus</span>
                  <span className="font-semibold text-slate-900">
                    {isSessionComplete
                      ? "Ready for review"
                      : `Question ${currentIndex + 1}`}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Respond clearly, stay structured, and keep your delivery confident.
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {!isSessionComplete && (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] px-6 py-3 text-base font-semibold text-white transition hover:bg-[var(--brand-deep)]"
                  >
                    Submit & next <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {(currentIndex > 0 || isSessionComplete) && (
                  <button
                    onClick={fetchFeedback}
                    disabled={isLoading || qaPairs.length === 0}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-800 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "Generating feedback..." : "Get feedback"}
                  </button>
                )}
              </div>
              {feedbackError ? (
                <p className="mt-4 text-sm text-rose-600">{feedbackError}</p>
              ) : null}
            </div>

            <div className="soft-panel rounded-[28px] p-6 md:p-8">
              {isSessionComplete ? (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h2 className="brand-font mt-5 text-2xl font-semibold text-slate-900">
                    Interview flow complete
                  </h2>
                  <p className="mt-3 text-slate-600">
                    You have finished the practice set. Review your feedback to sharpen
                    your delivery.
                  </p>
                  <button
                    onClick={fetchFeedback}
                    disabled={isLoading || qaPairs.length === 0}
                    className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[var(--brand)] px-6 py-3 text-base font-semibold text-white transition hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "Generating feedback..." : "Review feedback"}
                  </button>
                  {feedbackError ? (
                    <p className="mt-4 text-sm text-rose-600">{feedbackError}</p>
                  ) : null}
                </div>
              ) : (
                <MicRecorder onComplete={setAnswer} currentIndex={currentIndex} />
              )}
            </div>
          </section>
        )}
      </div>
      {isLoading && <Loader />}
    </SiteShell>
  );
}
