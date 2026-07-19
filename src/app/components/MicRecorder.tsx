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
    isProcessing,
    setTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeech();

  const [editableTranscript, setEditableTranscript] = useState("");

  useEffect(() => {
    setEditableTranscript(transcript);
    if (onComplete && transcript) {
      onComplete(transcript);
    }
  }, [transcript, onComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableTranscript(e.target.value);
    setTranscript(e.target.value);
  };

  useEffect(() => {
    setEditableTranscript("");
    stopListening();
    resetTranscript();
  }, [currentIndex]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Voice response
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {isListening
              ? "Recording your response"
              : isProcessing
                ? "Transcribing your response"
                : "Tap the mic to begin speaking"}
          </p>
        </div>
        <div
          className={`rounded-2xl px-3 py-1 text-sm font-medium ${
            isListening
              ? "bg-rose-50 text-rose-700"
              : isProcessing
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {isListening ? "Live" : isProcessing ? "Processing" : "Ready"}
        </div>
      </div>

      <div className="flex items-center justify-center py-2">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`flex h-16 w-16 items-center justify-center rounded-full transition ${
            isListening
              ? "animate-pulse bg-rose-500"
              : "bg-[var(--brand)] hover:bg-[var(--brand-deep)]"
          }`}
        >
          {isListening ? (
            <MicOff size={28} className="text-white" />
          ) : (
            <Mic size={28} className="text-white" />
          )}
        </button>
      </div>

      <div>
        <label
          htmlFor="transcript"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Editable transcript
        </label>
        <textarea
          id="transcript"
          value={editableTranscript}
          onChange={handleChange}
          rows={8}
          className="min-h-[180px] w-full rounded-[20px] border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400 focus:border-[var(--brand)]"
          placeholder="Your transcript will appear here..."
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={resetTranscript}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
        >
          <RefreshCcw size={18} />
          Clear
        </button>
      </div>
    </div>
  );
}
