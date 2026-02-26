import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
    onRecaptchaLoadCallback?: () => void;
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

  // Validate siteKey and handle script loading
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Dev bypass: on localhost, simulate reCAPTCHA being ready immediately
    // Google's reCAPTCHA script often fails to load on localhost if the domain
    // isn't explicitly whitelisted in the reCAPTCHA console.
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "::1";

    if (isLocalhost) {
      console.log("useRecaptcha: localhost detected — using dev bypass (no actual reCAPTCHA verification).");
      setState({ isLoaded: true, isReady: true, error: null });
      return;
    }

    if (!siteKey) {
      setState({
        isLoaded: false,
        isReady: false,
        error: "reCAPTCHA siteKey is missing.",
      });
      console.error("useRecaptcha: siteKey is required but was not provided.");
      return;
    }

    const scriptId = "recaptcha-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const handleReady = () => {
      setState((prev) => ({ ...prev, isLoaded: true, isReady: true, error: null }));
      console.log("reCAPTCHA is ready.");
    };

    // Check if reCAPTCHA is already loaded (script already injected by a previous render)
    if (typeof window.grecaptcha !== "undefined") {
      setState((prev) => ({ ...prev, isLoaded: true }));
      window.grecaptcha.ready(handleReady);
      return;
    }

    // Define the global callback BEFORE injecting the script
    // This callback is triggered by the reCAPTCHA script itself once it's loaded.
    window.onRecaptchaLoadCallback = () => {
      console.log("reCAPTCHA script loaded successfully via callback.");
      setState((prev) => ({ ...prev, isLoaded: true, error: null }));
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(handleReady);
      } else {
        // Fallback if grecaptcha.ready isn't immediately available after onload
        console.warn("reCAPTCHA script loaded, but grecaptcha.ready not found.");
        setState((prev) => ({
          ...prev,
          error: "reCAPTCHA script loaded but not fully initialized.",
        }));
      }
    };

    if (!script) {
      console.log("Injecting reCAPTCHA script with siteKey:", siteKey);
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}&onload=onRecaptchaLoadCallback`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else {
      // Script tag already exists (injected by another render/component)
      // Re-register the callback in case it wasn't ready yet
      window.grecaptcha?.ready(handleReady);
    }

    const onError = () => {
      console.error("reCAPTCHA script failed to load. Falling back to unverified mode.");
      setState({
        isLoaded: false,
        isReady: false,
        error: "Failed to load reCAPTCHA script. Check network or ad-blockers.",
      });
      // Clean up the global callback if an error occurs during script loading
      if (window.onRecaptchaLoadCallback) {
        delete window.onRecaptchaLoadCallback;
      }
    };

    script.addEventListener("error", onError);

    return () => {
      script.removeEventListener("error", onError);
      // Clean up the global callback when the component unmounts
      if (window.onRecaptchaLoadCallback) {
        delete window.onRecaptchaLoadCallback;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]); // Only re-run if siteKey changes; state.isLoaded intentionally excluded to avoid infinite loop

  // Execute reCAPTCHA
  const executeRecaptcha = useCallback(async (): Promise<string | null> => {
    // Dev bypass: return a mock token on localhost
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "::1")
    ) {
      return "dev-bypass-token";
    }

    if (!siteKey) {
      console.error("reCAPTCHA siteKey is missing, cannot execute.");
      setState((prev) => ({
        ...prev,
        error: "reCAPTCHA siteKey is missing, cannot execute.",
      }));
      return null;
    }

    if (!state.isReady || !window.grecaptcha || !window.grecaptcha.execute) {
      const errorMessage = state.error || "reCAPTCHA is not ready or failed to load.";
      console.warn(errorMessage);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      setState((prev) => ({ ...prev, error: null }));
      return token;
    } catch (error) {
      console.error("reCAPTCHA execution failed:", error);
      setState((prev) => ({
        ...prev,
        error: "reCAPTCHA execution failed. Please try again.",
      }));
      return null;
    }
  }, [state.isReady, state.error, siteKey, action]);

  return {
    ...state,
    executeRecaptcha,
  };
}
