import { useEffect, useRef, useState } from "react";

export type SpeechPhase = "idle" | "recording" | "processing" | "ready" | "error";

export function useSpeech() {
  const [transcript, setTranscript] = useState("");
  const [phase, setPhase] = useState<SpeechPhase>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(() =>
    Array.from({ length: 12 }, () => 0.12)
  );
  const [errorMessage, setErrorMessage] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const discardOnStopRef = useRef(false);

  const clearTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const stopMeter = async () => {
    clearTimers();
    setAudioLevels(Array.from({ length: 12 }, () => 0.12));

    if (audioContextRef.current) {
      try {
        await audioContextRef.current.close();
      } catch {
        // Ignore close errors during teardown.
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const startMeter = (stream: MediaStream) => {
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const audioContext = new AudioCtx();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      const node = analyserRef.current;
      if (!node) return;
      node.getByteFrequencyData(data);

      const step = Math.max(1, Math.floor(data.length / 12));
      const nextLevels = Array.from({ length: 12 }, (_, index) => {
        const value = data[index * step] ?? 0;
        return Math.max(0.12, Math.min(1, value / 180));
      });
      setAudioLevels(nextLevels);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (audioContextRef.current) {
        void audioContextRef.current.close().catch(() => undefined);
        audioContextRef.current = null;
      }
      analyserRef.current = null;
    };
  }, []);

  const teardownStream = async () => {
    clearTimers();
    await stopMeter();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    startedAtRef.current = null;
  };

  const stopListening = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setPhase((current) => (current === "recording" ? "idle" : current));
      return;
    }

    discardOnStopRef.current = false;
    setPhase("processing");
    clearTimers();
    recorder.stop();
  };

  const startListening = async () => {
    if (typeof window === "undefined") return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage("Your browser does not support microphone capture.");
      setPhase("error");
      setTranscript("");
      return;
    }

    try {
      setTranscript("");
      setErrorMessage("");
      setElapsedSeconds(0);
      setPhase("recording");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startMeter(stream);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();

      timerRef.current = setInterval(() => {
        if (!startedAtRef.current) return;
        setElapsedSeconds(
          Math.floor((Date.now() - startedAtRef.current) / 1000)
        );
      }, 250);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const shouldDiscard = discardOnStopRef.current;
        discardOnStopRef.current = false;
        await stopMeter();
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;

        if (shouldDiscard) {
          chunksRef.current = [];
          setElapsedSeconds(0);
          setPhase("idle");
          return;
        }

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const file = new File([blob], "answer.webm", { type: blob.type });

        const formData = new FormData();
        formData.append("audio", file);

        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          if (data?.transcript) {
            setTranscript(data.transcript);
            setErrorMessage("");
            setPhase("ready");
          } else {
            const message =
              data?.error || "Transcription failed. Please try again.";
            setTranscript("");
            setErrorMessage(message);
            setPhase("error");
          }
        } catch (error) {
          console.error(error);
          setTranscript("");
          setErrorMessage("Unable to reach transcription service.");
          setPhase("error");
        }
      };

      recorder.start();
    } catch (error) {
      console.error("Microphone access failed:", error);
      await stopMeter();
      setTranscript("");
      setErrorMessage(
        "Microphone access was denied. Please allow access and try again."
      );
      setPhase("error");
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const resetTranscript = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      discardOnStopRef.current = true;
      recorder.stop();
    } else {
      void teardownStream();
    }

    setTranscript("");
    setErrorMessage("");
    setElapsedSeconds(0);
    setPhase("idle");
  };

  const updateTranscript = (value: string) => {
    setTranscript(value);
    if (value.trim()) {
      setErrorMessage("");
    }
    setPhase((current) => {
      if (current === "recording" || current === "processing") return current;
      return value.trim() ? "ready" : "idle";
    });
  };

  const isListening = phase === "recording";
  const isProcessing = phase === "processing";

  return {
    transcript: transcript.trim(),
    phase,
    isListening,
    isProcessing,
    elapsedSeconds,
    audioLevels,
    errorMessage,
    setTranscript: updateTranscript,
    startListening,
    stopListening,
    resetTranscript,
  };
}
