import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function QuestionCard({ question }: { question: string }) {
  return (
    <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 md:p-10 flex items-center gap-5 animate-fadeIn group overflow-hidden border border-gray-200">
      <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shadow-md">
        <HelpCircle className="text-white" size={28} />
      </div>
      <div className="relative z-10 flex-1">
        <p className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
          {question}
        </p>
      </div>
    </div>
  );
}