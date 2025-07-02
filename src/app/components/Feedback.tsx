import ReactMarkdown from "react-markdown";
import React from "react";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useInterview } from "../context/InterviewContext";

function getFeedbackType(feedback: string) {
  if (!feedback)
    return {
      color: "bg-gray-100 border border-gray-200",
      icon: <Info className="text-gray-400" size={22} />,
      label: "Info",
    };
  if (/good|well|excellent|great|strong|impressive/i.test(feedback)) {
    return {
      color: "bg-green-100 border border-green-200",
      icon: <CheckCircle className="text-green-600" size={22} />,
      label: "Positive",
    };
  }
  if (
    /improve|could|should|suggest|try|consider|weak|missed|lacking/i.test(
      feedback
    )
  ) {
    return {
      color: "bg-yellow-100 border border-yellow-200",
      icon: <AlertTriangle className="text-yellow-600" size={22} />,
      label: "Suggestion",
    };
  }
  return {
    color: "bg-gray-100 border border-gray-200",
    icon: <Info className="text-gray-400" size={22} />,
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
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-white mb-10">
          Your Interview Feedback
        </h2>
        <div className="space-y-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-300" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/3" />
                <div className="h-3 bg-gray-300 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-center  drop-shadow mb-10">
        Your Interview Feedback
      </h2>

      <ul className="space-y-6">
        {qaPairs.map((qa, idx) => {
          const style = getFeedbackType(qa.feedback || "");
          return (
            <li
              key={idx}
              className={`p-5 rounded-xl ${style.color} shadow-md transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{style.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-lg text-gray-900 mb-1">
                    Q{idx + 1}: {qa.question}
                  </p>
                  <p className="text-gray-700 mb-2 text-sm">
                    <span className="font-medium">Answer:</span> {qa.answer}
                  </p>
                  {qa.feedback && (
                    <div className="prose prose-sm max-w-none text-gray-800">
                      <ReactMarkdown>{qa.feedback}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="text-center mt-10">
        <button
          onClick={handleRedirect}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-8 py-3 rounded-full shadow-lg text-lg font-semibold transition hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Feedback;
