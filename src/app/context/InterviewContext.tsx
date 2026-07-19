"use client";

import React, { createContext, useContext, useState } from "react";

interface QA {
  question: string;
  answer: string;
  feedback?: string;
}

interface InterviewContextType {
  qaPairs: QA[];
  addQAPair: (qa: QA) => void;
  setFeedbackForAnswer: (index: number, feedback: string) => void;
  applyFeedbacks: (feedbacks: Array<{ question: string; feedback: string }>) => void;
  resetInterview: () => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(
  undefined
);

export const InterviewProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [qaPairs, setQAPairs] = useState<QA[]>([]);

  const addQAPair = (qa: QA) => {
    setQAPairs((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.question === qa.question && last.answer === qa.answer) {
        return prev;
      }
      return [...prev, qa];
    });
  };
  const resetInterview = () => {
    setQAPairs([]); // Reset to an empty array
  };

  const setFeedbackForAnswer = (index: number, feedback: string) => {
    setQAPairs((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], feedback };
      }
      return updated;
    });
  };

  const applyFeedbacks = (feedbacks: Array<{ question: string; feedback: string }>) => {
    setQAPairs((prev) =>
      prev.map((pair) => {
        const match = feedbacks.find(
          (item) => item.question === pair.question && item.feedback
        );
        return match ? { ...pair, feedback: match.feedback } : pair;
      })
    );
  };

  return (
    <InterviewContext.Provider
      value={{
        qaPairs,
        addQAPair,
        setFeedbackForAnswer,
        applyFeedbacks,
        resetInterview,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return context;
};
