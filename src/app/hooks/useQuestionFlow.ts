"use client";

import { useEffect, useRef, useState } from "react";
import { cancelSpeech, speakQuestion } from "../lib/speakQuestion";

export type QuestionFlowPhase =
  | "idle"
  | "countdown"
  | "speaking"
  | "ready";

type UseQuestionFlowOptions = {
  question: string | undefined;
  questionIndex: number;
  active: boolean;
};

/**
 * Countdown → speak question → unlock mic.
 * Does NOT auto-start recording (avoids transcription API cost until user clicks).
 */
export function useQuestionFlow({
  question,
  questionIndex,
  active,
}: UseQuestionFlowOptions) {
  const [phase, setPhase] = useState<QuestionFlowPhase>("idle");
  const [countdown, setCountdown] = useState<number | null>(null);
  const cancelSpeakRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!active || !question) {
      cancelSpeakRef.current?.();
      cancelSpeakRef.current = null;
      cancelSpeech();
      setPhase("idle");
      setCountdown(null);
      return;
    }

    let cancelled = false;
    let countdownTimer: ReturnType<typeof setInterval> | null = null;

    setPhase("countdown");
    setCountdown(3);

    let remaining = 3;
    countdownTimer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (countdownTimer) clearInterval(countdownTimer);
        countdownTimer = null;
        if (cancelled) return;

        setCountdown(null);
        setPhase("speaking");

        cancelSpeakRef.current = speakQuestion(question, {
          onEnd: () => {
            if (cancelled) return;
            setPhase("ready");
          },
          onError: () => {
            if (cancelled) return;
            setPhase("ready");
          },
        });
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => {
      cancelled = true;
      if (countdownTimer) clearInterval(countdownTimer);
      cancelSpeakRef.current?.();
      cancelSpeakRef.current = null;
      cancelSpeech();
    };
  }, [active, question, questionIndex]);

  const isSpeaking = phase === "speaking";
  const isCountdown = phase === "countdown";
  const isReadyForAnswer = phase === "ready";
  const micDisabled = !active || isCountdown || isSpeaking;

  return {
    phase,
    countdown,
    isSpeaking,
    isCountdown,
    isReadyForAnswer,
    micDisabled,
  };
}
