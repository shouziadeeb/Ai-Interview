import { useState, useRef, useEffect } from 'react';

export function useSpeech() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      console.error("SpeechRecognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const newTranscript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ');
      setTranscript((prev) => prev + ' ' + newTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start(); // restart if still listening
      }
    };

    recognitionRef.current = recognition;
  }, []);

  // toggle listening based on user action
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      try {
        recognition.start();
      } catch (err) {
        console.warn("Recognition already started or error occurred:", err);
      }
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening]);

  return {
    transcript: transcript.trim(),
    isListening,
    setTranscript,
    startListening: () => setIsListening(true),
    stopListening: () => setIsListening(false),
    resetTranscript: () => setTranscript(''),
  };
}
