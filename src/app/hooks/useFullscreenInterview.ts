"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseFullscreenInterviewOptions = {
  enabled: boolean;
};

export function useFullscreenInterview({ enabled }: UseFullscreenInterviewOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [tabWarning, setTabWarning] = useState(false);
  const sessionStartedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || sessionStartedRef.current) return;
    sessionStartedRef.current = true;
    setShowPrompt(true);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onVisibility = () => {
      if (document.hidden) {
        setTabWarning(true);
      }
    };

    const onBlur = () => {
      if (document.fullscreenElement) {
        setTabWarning(true);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, [enabled]);

  const enterFullscreen = useCallback(async () => {
    const node = containerRef.current;
    if (!node) return;
    try {
      if (!document.fullscreenElement) {
        await node.requestFullscreen();
      }
      setShowPrompt(false);
    } catch {
      setShowPrompt(false);
    }
  }, []);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const dismissTabWarning = useCallback(() => {
    setTabWarning(false);
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore exit failures.
      }
    }
  }, []);

  return {
    containerRef,
    isFullscreen,
    showPrompt,
    tabWarning,
    enterFullscreen,
    dismissPrompt,
    dismissTabWarning,
    exitFullscreen,
  };
}
