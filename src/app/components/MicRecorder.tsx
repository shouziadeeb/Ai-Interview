import { useSpeech } from "../lib/useSpeech";
import { Mic, MicOff, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";

interface MicRecorderProps {
  onComplete?: (transcript: string) => void;
  currentIndex: unknown;
}

export default function MicRecorder({
  onComplete,
  currentIndex,
}: MicRecorderProps) {
  const {
    transcript,
    isListening,
    setTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeech();

  const [editableTranscript, setEditableTranscript] = useState("");

  useEffect(() => {
    setEditableTranscript(transcript); // update when new speech is captured
    if (onComplete && transcript) {
      onComplete(transcript);
    }
  }, [transcript, onComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableTranscript(e.target.value);
    setTranscript(e.target.value);
    console.log(e.target.value);
  };

  useEffect(() => {
    setEditableTranscript("");
    stopListening();
    resetTranscript();
  }, [currentIndex]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 p-6 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 space-y-2 transition-all duration-300">
      <div className="flex items-center justify-center">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 border-2 border-white shadow-xl ${
            isListening
              ? "bg-gradient-to-tr from-red-500 to-pink-500 animate-pulse"
              : "bg-gradient-to-tr from-green-500 to-teal-500 hover:scale-105"
          }`}
        >
          {isListening ? (
            <MicOff size={30} className="text-white" />
          ) : (
            <Mic size={30} className="text-white" />
          )}
        </button>
      </div>

      <p className="text-center text-white text-lg">
        {isListening ? "Recording... Speak clearly" : "Click mic to start"}
      </p>

      <div>
        <label
          htmlFor="transcript"
          className="text-white block font-semibold mb-2"
        >
          ✍️ Editable Transcript
        </label>
        <textarea
          id="transcript"
          value={editableTranscript}
          onChange={handleChange}
          rows={6}
          className="w-full p-4 bg-white/10 text-white border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Transcript will appear here..."
        />
      </div>

      <div className="text-center space-x-4">
        <button
          onClick={resetTranscript}
          className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 border border-white/20 text-white rounded-full hover:bg-white/20 transition-all duration-200"
        >
          <RefreshCcw size={18} />
          Clear
        </button>
      </div>
    </div>
  );
}
