import ReactMarkdown from "react-markdown";
import React from "react";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useInterview } from "../context/InterviewContext";

function getFeedbackType(feedback: string) {
  if (!feedback)
    return {
      color: "bg-gray-50 border-gray-200",
      icon: <Info className="text-gray-400" size={22} />,
      label: "Info",
    };
  if (/good|well|excellent|great|strong|impressive/i.test(feedback)) {
    return {
      color: "bg-green-50 border-green-200",
      icon: <CheckCircle className="text-green-500" size={22} />,
      label: "Positive",
    };
  }
  if (
    /improve|could|should|suggest|try|consider|weak|missed|lacking/i.test(
      feedback
    )
  ) {
    return {
      color: "bg-yellow-50 border-yellow-200",
      icon: <AlertTriangle className="text-yellow-500" size={22} />,
      label: "Suggestion",
    };
  }
  return {
    color: "bg-gray-50 border-gray-200",
    icon: <Info className="text-gray-400" size={22} />,
    label: "Info",
  };
}

const Feedback = ({ qaPairs }: { qaPairs: string }, loading: boolean) => {
  const router = useRouter();
  const { resetInterview } = useInterview();

  if (loading || !qaPairs || qaPairs.length === 0) {
    // Skeleton loader

    return (
      <div className="max-w-2xl mx-auto py-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-white drop-shadow">
          Your Interview Feedback
        </h2>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  function handleRedirect(
    _event: MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    resetInterview();
    router.push("/");
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-2 md:px-0">
      <h2 className="text-3xl font-bold text-center mb-8  drop-shadow">
        Your Interview Feedback
      </h2>
      <ul className="flex flex-col items-center justify-center ">
        {qaPairs.map((qa, idx) => {
          const parts = qa.feedback
            ? getFeedbackType(qa.feedback)
            : getFeedbackType("");
          return (
            <li key={idx} className={`mb-10 animate-fadeIn p-4`}>
              {/*  */}
              <div
                className={`p-6 rounded-xl border ${parts.color} shadow bg-yello backdrop-blur-sm `}
              >
                <p className="font-semibold text-base text-gray-900 mb-1">
                  Q{idx + 1}: {qa.question}
                </p>
                <p className="mb-2 text-gray-700 text-sm">
                  Answer: {qa.answer}
                </p>
                {qa.feedback && (
                  <div className="prose prose-sm max-w-none text-gray-800">
                    <ReactMarkdown>{qa.feedback}</ReactMarkdown>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <button
        onClick={handleRedirect}
        className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-8 py-3 rounded-2xl shadow-md text-lg font-semibold transition-all duration-200 cursor-pointer hover:from-pink-500 hover:to-purple-500 hover:shadow-xl hover:scale-105 active:scale-100 focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Back to home
      </button>
    </div>
  );
};

export default Feedback;
