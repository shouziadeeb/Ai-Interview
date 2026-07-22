"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInterview } from "../context/InterviewContext";
import QuestionCard from "../components/QuestionCard";
import MicRecorder from "../components/MicRecorder";
import Feedback from "../components/Feedback";
import Loader from "../components/Loader";
import SiteShell from "../components/SiteShell";
import InterviewerPanel from "../components/interview/InterviewerPanel";
import InterviewTimerBar from "../components/interview/InterviewTimerBar";
import InterviewHistoryPanel from "../components/InterviewHistoryPanel";
import { useQuestionFlow } from "../hooks/useQuestionFlow";
import { useFullscreenInterview } from "../hooks/useFullscreenInterview";
import {
  PER_QUESTION_SECONDS,
  TOTAL_INTERVIEW_SECONDS,
  useInterviewTimerStore,
} from "../lib/stores/interviewTimerStore";
import { cancelSpeech } from "../lib/speakQuestion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Maximize2,
  Mic,
  Play,
  Timer,
  Volume2,
  X,
} from "lucide-react";

const INTERVIEW_TITLE = "Software Engineering Interview";

export default function InterviewPage() {
  type Question = { question: string };
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const { addQAPair, qaPairs, applyFeedbacks, resetInterview } = useInterview();
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [submitHint, setSubmitHint] = useState("");
  const [sessionEndedByTimer, setSessionEndedByTimer] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const endingRef = useRef(false);
  const answerRef = useRef(answer);
  const questionsRef = useRef(questions);
  const currentIndexRef = useRef(currentIndex);
  const qaPairsRef = useRef(qaPairs);

  const startTimer = useInterviewTimerStore((s) => s.start);
  const tickTimer = useInterviewTimerStore((s) => s.tick);
  const resetQuestionTimer = useInterviewTimerStore((s) => s.resetQuestionTimer);
  const stopTimer = useInterviewTimerStore((s) => s.stop);
  const totalDuration = useInterviewTimerStore((s) => s.totalDuration);
  const totalSecondsLeft = useInterviewTimerStore((s) => s.totalSecondsLeft);
  const isTimerRunning = useInterviewTimerStore((s) => s.isRunning);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  useEffect(() => {
    qaPairsRef.current = qaPairs;
  }, [qaPairs]);

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

  const isSessionComplete =
    questions.length > 0 &&
    (currentIndex >= questions.length || sessionEndedByTimer);

  const liveSession = interviewStarted && !isSessionComplete;

  const {
    containerRef,
    isFullscreen,
    showPrompt,
    tabWarning,
    enterFullscreen,
    dismissPrompt,
    dismissTabWarning,
    exitFullscreen,
  } = useFullscreenInterview({
    enabled: liveSession,
  });

  const activeQuestion = questions[currentIndex]?.question;
  const { countdown, isSpeaking, isReadyForAnswer, micDisabled } =
    useQuestionFlow({
      question: activeQuestion,
      questionIndex: currentIndex,
      active: liveSession && Boolean(activeQuestion) && !isLoading,
    });

  useEffect(() => {
    if (!liveSession) return;
    startTimer({ totalDuration: TOTAL_INTERVIEW_SECONDS });
    return () => {
      stopTimer();
      cancelSpeech();
    };
  }, [liveSession, startTimer, stopTimer]);

  useEffect(() => {
    if (!isTimerRunning || !liveSession) return;
    resetQuestionTimer();
  }, [currentIndex, isTimerRunning, liveSession, resetQuestionTimer]);

  const handleStartInterview = () => {
    setInterviewStarted(true);
    setFeedbackError("");
    setSubmitHint("");
    setConfirmEnd(false);
  };

  const commitCurrentAnswer = useCallback(
    (allowEmpty = false) => {
      const question = questionsRef.current[currentIndexRef.current]?.question;
      if (!question) return null;

      const trimmed = answerRef.current.trim();
      if (!trimmed && !allowEmpty) return null;

      const pair = {
        question,
        answer: trimmed || "(No answer recorded before time expired.)",
      };

      addQAPair(pair);
      fetch("/api/answers", {
        method: "POST",
        body: JSON.stringify(pair),
        headers: { "Content-Type": "application/json" },
      });
      setAnswer("");
      setSubmitHint("");
      return pair;
    },
    [addQAPair]
  );

  const fetchFeedback = useCallback(
    async (seedPairs?: Array<{ question: string; answer: string }>) => {
      if (isLoading || endingRef.current) return;
      endingRef.current = true;

      const pairsForReview = [...(seedPairs || qaPairsRef.current)];
      const active = questionsRef.current[currentIndexRef.current]?.question;
      if (
        active &&
        answerRef.current.trim() &&
        !pairsForReview.some((pair) => pair.question === active)
      ) {
        const pair = {
          question: active,
          answer: answerRef.current.trim(),
        };
        pairsForReview.push(pair);
        addQAPair(pair);
      }

      if (pairsForReview.length === 0) {
        endingRef.current = false;
        setFeedbackError(
          "Submit at least one answer before requesting feedback."
        );
        return;
      }

      setIsLoading(true);
      setFeedbackError("");
      stopTimer();
      cancelSpeech();
      void exitFullscreen();

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
          throw new Error(
            data?.error || data?.details || "Unable to generate feedback"
          );
        }

        const feedbacks = Array.isArray(data?.feedbacks) ? data.feedbacks : [];
        if (!feedbacks.length) {
          throw new Error("No feedback was returned. Please try again.");
        }

        applyFeedbacks(feedbacks);
        setSessionEndedByTimer(true);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setFeedbackError(
          err instanceof Error
            ? err.message
            : "Unable to generate feedback right now."
        );
        endingRef.current = false;
      } finally {
        setIsLoading(false);
      }
    },
    [addQAPair, applyFeedbacks, exitFullscreen, isLoading, stopTimer]
  );

  const handleNext = useCallback(async () => {
    if (!commitCurrentAnswer(false)) {
      setSubmitHint("Record or type an answer before moving on.");
      return;
    }
    setFeedbackError("");
    setCurrentIndex((prev) => prev + 1);
  }, [commitCurrentAnswer]);

  const advanceOnQuestionTimeout = useCallback(() => {
    const committed = commitCurrentAnswer(true);
    const nextIndex = currentIndexRef.current + 1;
    if (nextIndex >= questionsRef.current.length) {
      setSessionEndedByTimer(true);
      const seeds = committed
        ? [...qaPairsRef.current, committed].filter(
            (pair, index, arr) =>
              arr.findIndex((item) => item.question === pair.question) === index
          )
        : [...qaPairsRef.current];
      void fetchFeedback(seeds);
      return;
    }
    setCurrentIndex(nextIndex);
  }, [commitCurrentAnswer, fetchFeedback]);

  useEffect(() => {
    if (!isTimerRunning || !liveSession || isLoading) return;

    const id = window.setInterval(() => {
      const { totalExpired, questionExpired } = tickTimer();
      if (totalExpired) {
        const committed = commitCurrentAnswer(true);
        setSessionEndedByTimer(true);
        const seeds = committed
          ? [...qaPairsRef.current, committed].filter(
              (pair, index, arr) =>
                arr.findIndex((item) => item.question === pair.question) ===
                index
            )
          : [...qaPairsRef.current];
        void fetchFeedback(seeds);
        return;
      }
      if (questionExpired) {
        advanceOnQuestionTimeout();
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [
    advanceOnQuestionTimeout,
    commitCurrentAnswer,
    fetchFeedback,
    isLoading,
    liveSession,
    isTimerRunning,
    tickTimer,
  ]);

  const handleEndInterview = useCallback(() => {
    setConfirmEnd(false);
    cancelSpeech();
    stopTimer();
    void exitFullscreen();

    const committed = commitCurrentAnswer(true);
    const seeds = committed
      ? [...qaPairsRef.current, committed].filter(
          (pair, index, arr) =>
            arr.findIndex((item) => item.question === pair.question) === index
        )
      : [...qaPairsRef.current];

    if (seeds.length === 0 && qaPairsRef.current.length === 0) {
      resetInterview();
      setInterviewStarted(false);
      setSessionEndedByTimer(false);
      setCurrentIndex(0);
      setAnswer("");
      router.push("/");
      return;
    }

    setSessionEndedByTimer(true);
    void fetchFeedback(seeds);
  }, [
    commitCurrentAnswer,
    exitFullscreen,
    fetchFeedback,
    resetInterview,
    router,
    stopTimer,
  ]);

  const hasFeedback = qaPairs.some((pair) => Boolean(pair.feedback));
  if (hasFeedback) {
    return (
      <Feedback
        qaPairs={qaPairs}
        loading={isLoading}
        interviewTitle={INTERVIEW_TITLE}
        durationSeconds={Math.max(0, totalDuration - totalSecondsLeft)}
      />
    );
  }

  const progressValue = questions.length
    ? (Math.min(currentIndex, questions.length) / questions.length) * 100
    : 0;
  const answeredCount = Math.min(currentIndex, questions.length);
  const progressLabel = questions.length
    ? `${answeredCount} / ${questions.length}`
    : "—";
  const hasAnswer = answer.trim().length > 0;
  const totalMinutes = Math.round(TOTAL_INTERVIEW_SECONDS / 60);
  const questionSeconds = PER_QUESTION_SECONDS;

  return (
    <SiteShell
      hideFooter={liveSession || isFullscreen}
      mainClassName={
        liveSession
          ? "px-3 py-4 sm:px-6 sm:py-5 lg:px-8"
          : "px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      }
    >
      <div
        ref={containerRef}
        className="interview-room mx-auto w-full max-w-6xl gap-4"
      >
        {liveSession ? (
          <InterviewTimerBar
            title={INTERVIEW_TITLE}
            questionNumber={Math.min(currentIndex + 1, questions.length)}
            questionTotal={questions.length}
            progressLabel={progressLabel}
            onEndInterview={() => setConfirmEnd(true)}
          />
        ) : null}

        {!liveSession ? (
          <header className="mb-1">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              Practice session
            </p>
            <h1 className="brand-font mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
              Mock interview
            </h1>
          </header>
        ) : null}

        <div className="interview-stage flex flex-1 flex-col gap-4">
          {!questions.length ? (
            <section className="panel flex-1 rounded-2xl p-6 sm:p-8">
              <div className="space-y-3">
                <div className="h-4 w-24 animate-pulse rounded bg-[var(--line)]" />
                <div className="h-5 w-2/3 animate-pulse rounded bg-[var(--line)]" />
                <div className="mt-6 h-48 animate-pulse rounded-xl bg-[var(--surface-muted)]" />
              </div>
            </section>
          ) : isSessionComplete ? (
            <section className="panel flex-1 rounded-2xl p-6 sm:p-10">
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
                  onClick={() => void fetchFeedback()}
                  disabled={isLoading || qaPairs.length === 0}
                  className="mt-5 inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Generating feedback..." : "Review feedback"}
                </button>
                {feedbackError ? (
                  <p className="mt-3 text-sm text-[var(--danger)]">
                    {feedbackError}
                  </p>
                ) : null}
              </div>
            </section>
          ) : !interviewStarted ? (
            <div className="flex flex-1 flex-col gap-5">
              <section className="panel rounded-2xl p-6 sm:p-8 lg:p-10">
                <div className="mx-auto grid max-w-3xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-10 lg:text-left">
                  <div className="text-center lg:text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      Ready when you are
                    </p>
                    <h2 className="brand-font mt-3 text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
                      {INTERVIEW_TITLE}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
                      {questions.length} resume-aware questions are ready. Read the
                      rules below, then start when you feel prepared.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-4 text-left">
                        <div className="flex items-center gap-2 text-[var(--brand)]">
                          <Clock3 className="h-4 w-4" />
                          <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                            Total time
                          </p>
                        </div>
                        <p className="brand-font mt-2 text-2xl font-semibold text-[var(--ink)]">
                          {totalMinutes} min
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          Session ends automatically when time runs out and opens
                          your report.
                        </p>
                      </div>
                      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-4 text-left">
                        <div className="flex items-center gap-2 text-[var(--brand)]">
                          <Timer className="h-4 w-4" />
                          <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                            Per question
                          </p>
                        </div>
                        <p className="brand-font mt-2 text-2xl font-semibold text-[var(--ink)]">
                          {questionSeconds}s
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          When this timer hits zero, we move to the next question.
                        </p>
                      </div>
                    </div>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={handleStartInterview}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        Start interview
                      </button>
                      <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--brand)]"
                      >
                        Cancel
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-5 text-left sm:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                      How it works
                    </p>
                    <ul className="mt-4 space-y-4 text-sm leading-6 text-[var(--muted)]">
                      <li className="flex gap-3">
                        <Volume2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                        <span>
                          Short 3-second countdown, then the interviewer reads the
                          question aloud (browser speech — no extra AI cost).
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <Mic className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                        <span>
                          Mic stays idle until you click it. Transcription only
                          runs after you stop recording.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <Maximize2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                        <span>
                          Fullscreen is optional but recommended. Avoid switching
                          tabs during the session.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                        <span>
                          Use{" "}
                          <strong className="text-[var(--ink)]">End interview</strong>{" "}
                          anytime to finish early and generate your report.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <InterviewHistoryPanel compact />
            </div>
          ) : (
            <section className="interview-panel panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
              {liveSession ? (
                <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-2.5 text-xs text-[var(--muted)] sm:px-5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-24 overflow-hidden rounded-full bg-[var(--line)] sm:w-32`}
                    >
                      <span
                        className="block h-full rounded-full bg-[var(--brand)] transition-all"
                        style={{ width: `${progressValue}%` }}
                      />
                    </span>
                    <span className="font-semibold tabular-nums text-[var(--ink)]">
                      {progressLabel}
                    </span>
                  </div>
                  <p>
                    {hasAnswer
                      ? "3. Submit"
                      : isMicListening
                        ? "2. Record"
                        : "1. Question"}
                  </p>
                </div>
              ) : null}

              <div className="interview-grid grid min-h-0 flex-1 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="flex min-h-0 flex-col border-b border-[var(--line)] p-5 sm:p-6 lg:border-b-0 lg:border-r">
                  <InterviewerPanel
                    isSpeaking={isSpeaking}
                    isListening={isMicListening}
                    isReadyForAnswer={isReadyForAnswer && !isMicListening}
                    countdown={countdown}
                  />

                  <div className="mt-6 flex-1">
                    {countdown !== null && countdown > 0 ? (
                      <div className="mb-4 flex items-center justify-center">
                        <span className="brand-font text-5xl font-semibold tabular-nums text-[var(--brand)]">
                          {countdown}
                        </span>
                      </div>
                    ) : null}
                    <QuestionCard
                      question={questions[currentIndex]?.question}
                      index={currentIndex + 1}
                      total={questions.length}
                    />
                  </div>

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
                      ) : isSpeaking ? (
                        "Interviewer speaking"
                      ) : isMicListening ? (
                        "Listening..."
                      ) : isReadyForAnswer ? (
                        "Click mic to record"
                      ) : (
                        "Awaiting response"
                      )}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      onClick={handleNext}
                      disabled={micDisabled || !hasAnswer}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        hasAnswer
                          ? "bg-[var(--brand)] text-white hover:bg-[var(--brand-deep)]"
                          : "bg-[var(--surface-muted)] text-[var(--muted)]"
                      }`}
                    >
                      Submit & next <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmEnd(true)}
                      className="inline-flex items-center justify-center rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--danger)] hover:text-[var(--danger)]"
                    >
                      End interview
                    </button>
                  </div>
                  {submitHint ? (
                    <p className="mt-2 text-xs text-[var(--warning)]">
                      {submitHint}
                    </p>
                  ) : null}
                  {feedbackError ? (
                    <p className="mt-2 text-xs text-[var(--danger)]">
                      {feedbackError}
                    </p>
                  ) : null}
                </div>

                <div className="flex min-h-0 flex-col bg-[var(--surface-muted)] p-5 sm:p-6">
                  <MicRecorder
                    onComplete={setAnswer}
                    currentIndex={currentIndex}
                    disabled={micDisabled}
                    listeningLabel="Listening..."
                    onListeningChange={setIsMicListening}
                  />
                </div>
              </div>
            </section>
          )}
        </div>

        {showPrompt && liveSession ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
            <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xl">
              <h2 className="brand-font text-xl font-semibold text-[var(--ink)]">
                Enter fullscreen interview mode
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Recommended for a realistic session. You can exit anytime with
                Esc or End interview.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={enterFullscreen}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]"
                >
                  <Maximize2 className="h-4 w-4" />
                  Enter fullscreen
                </button>
                <button
                  type="button"
                  onClick={dismissPrompt}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)]"
                >
                  Continue without
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {confirmEnd ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
            <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xl">
              <h2 className="brand-font text-xl font-semibold text-[var(--ink)]">
                End interview?
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {qaPairs.length > 0 || answer.trim()
                  ? "We’ll generate feedback from the answers you’ve submitted so far."
                  : "You haven’t submitted answers yet. Ending now will return you home."}
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleEndInterview}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--danger)] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  End interview
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmEnd(false)}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)]"
                >
                  Keep going
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {tabWarning ? (
          <div className="fixed inset-x-0 bottom-4 z-50 mx-auto flex max-w-lg items-start gap-3 rounded-xl border border-[var(--warning)]/40 bg-[var(--warning-soft)] px-4 py-3 shadow-lg">
            <p className="flex-1 text-sm text-[var(--ink)]">
              Tab switch detected. In a real interview this can look like you
              left the session — please stay focused.
            </p>
            <button
              type="button"
              onClick={dismissTabWarning}
              className="rounded-lg p-1 text-[var(--muted)] hover:text-[var(--ink)]"
              aria-label="Dismiss warning"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
      {isLoading && <Loader />}
    </SiteShell>
  );
}
