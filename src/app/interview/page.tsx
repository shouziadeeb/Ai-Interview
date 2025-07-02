"use client";

import { useEffect, useState } from "react";
import { useInterview } from "../context/InterviewContext";
import QuestionCard from "../components/QuestionCard";
import MicRecorder from "../components/MicRecorder";
import Feedback from "../components/Feedback";
import Image from "next/image";
import Loader from "../components/Loader";

export default function InterviewPage() {
  type Question = { question: string };
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const { addQAPair, qaPairs, setFeedbackForAnswer } = useInterview();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/questions")
      .then((res) => res.json())
      .then(setQuestions);
  }, []);

  const handleNext = async () => {
    const currentQuestion = questions[currentIndex]?.question;
    addQAPair({ question: currentQuestion, answer });
    fetch("/api/answers", {
      method: "POST",
      body: JSON.stringify({ question: currentQuestion, answer }),
      headers: { "Content-Type": "application/json" },
    });
    setAnswer("");
    setCurrentIndex((prev) => prev + 1);
  };

  const fetchFeedback = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ answers: qaPairs }),
        headers: { "Content-Type": "application/json" },
      });
      const { feedbacks } = await res.json();
      feedbacks.forEach(
        ({ question, feedback }: { question: string; feedback: string }) => {
          const index = qaPairs.findIndex((qa) => qa.question === question);
          if (index !== -1) {
            setFeedbackForAnswer(index, feedback);
          }
        }
      );
    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!questions.length)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-900 via-purple-900 to-gray-900">
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 space-y-8 animate-fadeIn flex flex-col items-center">
          <div className="flex flex-col items-center space-y-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse mb-2" />
            <div className="h-6 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="w-full">
            <div className="h-20 bg-gray-200 rounded-2xl mb-6 animate-pulse" />
            <div className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  if (qaPairs[0]?.feedback) {
    return (
      <div
        className="min-h-screen flex items-center  
    justify-center bg-blue-600 from-blue-900 via-purple-900 to-gray-900 px-2 py-8"
      >
        <Feedback qaPairs={qaPairs} loading={isLoading} />
      </div>
    );
  }
  return (
    <div
      className="min-h-screen flex items-center  
    justify-center bg-blue-600 from-blue-900 via-purple-900 to-gray-900 px-2 py-8"
    >
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 md:p-12 space-y-1 animate-fadeIn flex flex-col items-center">
        {/* Header */}
        <div className="flex p-6 flex-col items-center space-y-2 mb-4">
          <Image
            src="/globe.svg"
            alt="Interview"
            width={38}
            height={38}
            className="mb-2 animate-bounce"
          />
          <h2 className="text-2xl font-bold text-white drop-shadow">
            Interview Session
          </h2>
          <p className="text-md text-gray-200">
            Answer each question below. Use the mic to record your answer!
          </p>
        </div>
        {/* Question Card */}
        <div className="w-full">
          <QuestionCard question={questions[currentIndex]?.question} />
        </div>
        {/* Mic Recorder */}
        <div className="w-full">
          <MicRecorder onComplete={setAnswer} currentIndex={currentIndex} />
        </div>
        {/* Navigation Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-6 w-full">
          {currentIndex !== questions.length && (
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 text-white px-8 py-3 rounded-2xl shadow-md text-lg font-semibold transition-all duration-200 cursor-pointer hover:from-blue-400 hover:to-green-400 hover:shadow-xl hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-green-200"
            >
              Next Question
            </button>
          )}
          {currentIndex >= questions.length && (
            <button
              onClick={fetchFeedback}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-8 py-3 rounded-2xl shadow-md text-lg font-semibold transition-all duration-200 cursor-pointer hover:from-pink-500 hover:to-purple-500 hover:shadow-xl hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Getting Feedback..." : "Get Feedback"}
            </button>
          )}
        </div>
      </div>
      {isLoading && <Loader />}
    </div>
  );
}
