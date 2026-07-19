"use client";

import { useSpeech } from "../lib/useSpeech";
import {
  CheckCircle2,
  LoaderCircle,
  Mic,
  RefreshCcw,
  Square,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface MicRecorderProps {
  onComplete?: (transcript: string) => void;
  currentIndex: unknown;
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function MicRecorder({
  onComplete,
  currentIndex,
}: MicRecorderProps) {
  const {
    transcript,
    phase,
    isListening,
    isProcessing,
    elapsedSeconds,
    audioLevels,
    errorMessage,
    setTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeech();

  const [editableTranscript, setEditableTranscript] = useState("");
  const resetTranscriptRef = useRef(resetTranscript);

  useEffect(() => {
    resetTranscriptRef.current = resetTranscript;
  }, [resetTranscript]);

  useEffect(() => {
    setEditableTranscript(transcript);
    onComplete?.(transcript);
  }, [transcript, onComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value;
    setEditableTranscript(nextValue);
    setTranscript(nextValue);
    onComplete?.(nextValue);
  };

  const handleClear = () => {
    resetTranscript();
    setEditableTranscript("");
    onComplete?.("");
  };

  useEffect(() => {
    setEditableTranscript("");
    resetTranscriptRef.current();
    onComplete?.("");
  }, [currentIndex, onComplete]);

  const wordCount = editableTranscript.trim()
    ? editableTranscript.trim().split(/\s+/).length
    : 0;
  const hasAnswer = editableTranscript.trim().length > 0;
  const isBusy = isListening || isProcessing;

  const statusCopy = {
    idle: {
      title: "Ready to record",
      detail: "Speak your answer, then stop to transcribe.",
      badge: "Idle",
      badgeClass: "bg-[var(--surface-muted)] text-[var(--muted)]",
      barClass: "border-[var(--line)] bg-[var(--surface)]",
    },
    recording: {
      title: "Recording",
      detail: "Audio is being captured now.",
      badge: "Live",
      badgeClass: "bg-[var(--danger-soft)] text-[var(--danger)]",
      barClass: "border-rose-500/30 bg-[var(--danger-soft)]",
    },
    processing: {
      title: "Transcribing",
      detail: "Converting speech to text…",
      badge: "Busy",
      badgeClass: "bg-[var(--warning-soft)] text-[var(--warning)]",
      barClass: "border-amber-500/30 bg-[var(--warning-soft)]",
    },
    ready: {
      title: "Answer captured",
      detail: "Edit if needed, then submit on the left.",
      badge: "Done",
      badgeClass: "bg-[var(--success-soft)] text-[var(--success)]",
      barClass: "border-emerald-500/30 bg-[var(--success-soft)]",
    },
    error: {
      title: "Recording failed",
      detail: errorMessage || "Try recording again.",
      badge: "Error",
      badgeClass: "bg-[var(--danger-soft)] text-[var(--danger)]",
      barClass: "border-rose-500/30 bg-[var(--danger-soft)]",
    },
  }[phase];

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            Voice response
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
            {statusCopy.title}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
            {statusCopy.detail}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${statusCopy.badgeClass}`}
        >
          {isListening ? (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
            </span>
          ) : null}
          {isProcessing ? (
            <LoaderCircle className="h-3 w-3 animate-spin" />
          ) : null}
          {phase === "ready" ? <CheckCircle2 className="h-3 w-3" /> : null}
          {statusCopy.badge}
        </span>
      </div>

      <div
        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${statusCopy.barClass}`}
      >
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
          {isListening ? (
            <span className="rec-ring absolute inset-0 rounded-full border border-rose-400/50" />
          ) : null}
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            aria-pressed={isListening}
            aria-label={isListening ? "Stop recording" : "Start recording"}
            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
              isListening
                ? "bg-rose-600 focus-visible:outline-rose-500"
                : "bg-[var(--brand)] hover:bg-[var(--brand-deep)] focus-visible:outline-[var(--brand)]"
            }`}
          >
            {isProcessing ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : isListening ? (
              <Square className="h-3.5 w-3.5 fill-white" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {isListening ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-end gap-0.5">
                {audioLevels.map((level, index) => (
                  <span
                    key={index}
                    className="rec-bar w-1 rounded-full bg-rose-500"
                    style={{ height: `${6 + level * 18}px` }}
                  />
                ))}
              </div>
              <p className="font-mono text-sm font-semibold tabular-nums text-rose-500">
                {formatTimer(elapsedSeconds)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              {isProcessing
                ? "Transcribing audio…"
                : hasAnswer
                  ? "Record again or edit the transcript below."
                  : "Click the mic to start recording."}
            </p>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between gap-2">
          <label
            htmlFor="transcript"
            className="text-xs font-medium text-[var(--muted)]"
          >
            Transcript
            {hasAnswer ? (
              <span className="ml-1.5 font-normal opacity-70">
                · {wordCount} word{wordCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </label>
          <div className="flex items-center gap-2">
            {hasAnswer ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--success)]">
                <CheckCircle2 className="h-3 w-3" />
                Captured
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleClear}
              disabled={isBusy || (!hasAnswer && phase === "idle")}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--muted)] transition hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCcw size={12} />
              Clear
            </button>
          </div>
        </div>

        <textarea
          id="transcript"
          value={editableTranscript}
          onChange={handleChange}
          rows={8}
          disabled={isBusy}
          className={`min-h-[180px] w-full flex-1 rounded-lg border bg-[var(--surface)] px-3 py-2.5 text-sm leading-6 text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-70 ${
            hasAnswer
              ? "border-emerald-500/35"
              : isListening
                ? "border-rose-500/35"
                : "border-[var(--line)]"
          }`}
          placeholder={
            isListening
              ? "Listening… transcript appears after you stop."
              : isProcessing
                ? "Transcribing…"
                : "Your transcript will appear here…"
          }
        />
      </div>
    </div>
  );
}
