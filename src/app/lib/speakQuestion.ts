/** Browser-only TTS for interview questions. No external AI calls. */

export type SpeakQuestionHandlers = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
};

export function cancelSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function speakQuestion(
  text: string,
  handlers: SpeakQuestionHandlers = {}
): () => void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    handlers.onError?.(new Error("Speech synthesis is not supported."));
    handlers.onEnd?.();
    return () => undefined;
  }

  cancelSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    handlers.onEnd?.();
  };

  utterance.onstart = () => handlers.onStart?.();
  utterance.onend = finish;
  utterance.onerror = () => {
    handlers.onError?.(new Error("Speech synthesis failed."));
    finish();
  };

  // Chrome sometimes needs a brief delay after cancel before speaking.
  // Voices may also load asynchronously.
  let spoken = false;
  const speak = () => {
    if (spoken || finished) return;
    spoken = true;
    try {
      const latestVoices = window.speechSynthesis.getVoices();
      const preferredVoice =
        latestVoices.find(
          (voice) =>
            /en(-|_)?(US|GB)?/i.test(voice.lang) &&
            /female|samantha|victoria|karen|moira|zira|google us english/i.test(
              voice.name
            )
        ) ||
        latestVoices.find((voice) => /en(-|_)?(US|GB)?/i.test(voice.lang)) ||
        latestVoices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      handlers.onError?.(
        error instanceof Error ? error : new Error("Unable to speak question.")
      );
      finish();
    }
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", speak, {
      once: true,
    });
    window.setTimeout(speak, 250);
  } else {
    window.setTimeout(speak, 80);
  }

  return () => {
    finished = true;
    cancelSpeech();
  };
}
