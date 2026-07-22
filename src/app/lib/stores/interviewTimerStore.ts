import { create } from "zustand";

export const TOTAL_INTERVIEW_SECONDS = 30 * 60;
export const PER_QUESTION_SECONDS = 90;

type InterviewTimerState = {
  totalSecondsLeft: number;
  questionSecondsLeft: number;
  totalDuration: number;
  questionDuration: number;
  isRunning: boolean;
  startedAt: number | null;
  start: (options?: {
    totalDuration?: number;
    questionDuration?: number;
  }) => void;
  resetQuestionTimer: () => void;
  tick: () => { totalExpired: boolean; questionExpired: boolean };
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

export const useInterviewTimerStore = create<InterviewTimerState>((set, get) => ({
  totalSecondsLeft: TOTAL_INTERVIEW_SECONDS,
  questionSecondsLeft: PER_QUESTION_SECONDS,
  totalDuration: TOTAL_INTERVIEW_SECONDS,
  questionDuration: PER_QUESTION_SECONDS,
  isRunning: false,
  startedAt: null,

  start: (options) => {
    const totalDuration = options?.totalDuration ?? TOTAL_INTERVIEW_SECONDS;
    const questionDuration = options?.questionDuration ?? PER_QUESTION_SECONDS;
    set({
      totalDuration,
      questionDuration,
      totalSecondsLeft: totalDuration,
      questionSecondsLeft: questionDuration,
      isRunning: true,
      startedAt: Date.now(),
    });
  },

  resetQuestionTimer: () => {
    const { questionDuration } = get();
    set({ questionSecondsLeft: questionDuration });
  },

  tick: () => {
    const state = get();
    if (!state.isRunning) {
      return { totalExpired: false, questionExpired: false };
    }

    const nextTotal = Math.max(0, state.totalSecondsLeft - 1);
    const nextQuestion = Math.max(0, state.questionSecondsLeft - 1);

    set({
      totalSecondsLeft: nextTotal,
      questionSecondsLeft: nextQuestion,
      isRunning: nextTotal > 0,
    });

    return {
      totalExpired: state.totalSecondsLeft > 0 && nextTotal <= 0,
      questionExpired:
        state.questionSecondsLeft > 0 && nextQuestion <= 0 && nextTotal > 0,
    };
  },

  pause: () => set({ isRunning: false }),
  resume: () => {
    if (get().totalSecondsLeft > 0) {
      set({ isRunning: true });
    }
  },
  stop: () =>
    set({
      isRunning: false,
      totalSecondsLeft: 0,
      questionSecondsLeft: 0,
    }),
}));

export function formatCountdown(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safe % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
