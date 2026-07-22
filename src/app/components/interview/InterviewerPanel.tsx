"use client";

import Image from "next/image";

type InterviewerPanelProps = {
  isSpeaking: boolean;
  /** True only while the user is actively recording. */
  isListening: boolean;
  isReadyForAnswer?: boolean;
  countdown?: number | null;
};

export default function InterviewerPanel({
  isSpeaking,
  isListening,
  isReadyForAnswer = false,
  countdown = null,
}: InterviewerPanelProps) {
  const status = (() => {
    if (countdown !== null && countdown > 0) {
      return `Get ready… ${countdown}`;
    }
    if (isSpeaking) return "Interviewer is speaking...";
    if (isListening) return "Listening...";
    if (isReadyForAnswer) return "Click the mic when you're ready";
    return "Waiting to begin";
  })();

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
        {isSpeaking ? (
          <>
            <span className="interviewer-pulse absolute inset-0 rounded-full" />
            <span className="interviewer-pulse interviewer-pulse-delay absolute inset-0 rounded-full" />
          </>
        ) : null}
        <div
          className={`relative h-24 w-24 overflow-hidden rounded-full border-2 sm:h-28 sm:w-28 ${
            isSpeaking
              ? "border-[var(--brand)] shadow-[0_0_0_4px_var(--mist)]"
              : "border-[var(--line)]"
          }`}
        >
          <Image
            src="/hero-coach.png"
            alt="Sarah Williams, Senior Frontend Engineer"
            fill
            className={`object-cover object-top transition ${
              isSpeaking ? "interviewer-speak-bob" : ""
            }`}
            sizes="112px"
            priority
          />
        </div>
      </div>

      <p className="brand-font mt-4 text-lg font-semibold text-[var(--ink)]">
        Sarah Williams
      </p>
      <p className="text-sm text-[var(--muted)]">Senior Frontend Engineer</p>
      <p
        className={`mt-3 text-sm font-medium ${
          isSpeaking || isListening || isReadyForAnswer
            ? "text-[var(--brand)]"
            : "text-[var(--muted)]"
        }`}
      >
        {status}
      </p>
    </div>
  );
}
