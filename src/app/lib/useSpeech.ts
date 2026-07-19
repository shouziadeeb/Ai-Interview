import { useEffect, useRef, useState } from "react";

export function useSpeech() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stopListening = async () => {
    setIsListening(false);
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const startListening = async () => {
    if (typeof window === "undefined") return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setTranscript("Your browser does not support microphone capture.");
      return;
    }

    try {
      setTranscript("");
      setIsProcessing(true);
      setIsListening(true);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
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
          } else {
            setTranscript(data?.error || "Transcription failed. Please try again.");
          }
        } catch (error) {
          setTranscript("Unable to reach transcription service.");
          console.error(error);
        } finally {
          setIsProcessing(false);
          stream.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      recorder.start();
    } catch (error) {
      console.error("Microphone access failed:", error);
      setTranscript("Microphone access was denied. Please allow access and try again.");
      setIsListening(false);
      setIsProcessing(false);
    }
  };

  return {
    transcript: transcript.trim(),
    isListening,
    isProcessing,
    setTranscript,
    startListening,
    stopListening,
    resetTranscript: () => setTranscript(""),
  };
}
