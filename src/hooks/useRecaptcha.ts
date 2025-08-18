import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

interface UseRecaptchaOptions {
  siteKey: string;
  action?: string;
}

interface RecaptchaState {
  isLoaded: boolean;
  isReady: boolean;
  error: string | null;
}

export function useRecaptcha({
  siteKey,
  action = "submit",
}: UseRecaptchaOptions) {
  const [state, setState] = useState<RecaptchaState>({
    isLoaded: false,
    isReady: false,
    error: null,
  });

  // Load reCAPTCHA script
  useEffect(() => {
    if (typeof window === "undefined" || window.grecaptcha) {
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setState((prev) => ({ ...prev, isLoaded: true }));

      window.grecaptcha.ready(() => {
        setState((prev) => ({ ...prev, isReady: true }));
      });
    };

    script.onerror = () => {
      setState((prev) => ({
        ...prev,
        error: "Failed to load reCAPTCHA script",
      }));
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      const existingScript = document.querySelector(
        `script[src*="recaptcha/api.js"]`
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [siteKey]);

  // Execute reCAPTCHA
  const executeRecaptcha = useCallback(async (): Promise<string | null> => {
    if (!state.isReady || !window.grecaptcha) {
      console.warn("reCAPTCHA not ready");
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch (error) {
      console.error("reCAPTCHA execution failed:", error);
      setState((prev) => ({
        ...prev,
        error: "reCAPTCHA execution failed",
      }));
      return null;
    }
  }, [state.isReady, siteKey, action]);

  return {
    ...state,
    executeRecaptcha,
  };
}
