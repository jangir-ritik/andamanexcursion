// src/components/atoms/Recaptcha/Recaptcha.tsx
import React from "react";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import styles from "./Recaptcha.module.css";

interface RecaptchaProps {
  siteKey: string;
  onReady?: (executeRecaptcha: () => Promise<string | null>) => void;
  onError?: (error: string) => void;
  action?: string;
  showBadge?: boolean;
}

export const Recaptcha: React.FC<RecaptchaProps> = ({
  siteKey,
  onReady,
  onError,
  action = "submit",
  showBadge = true,
}) => {
  const { isReady, error, executeRecaptcha } = useRecaptcha({
    siteKey,
    action,
  });

  // Notify parent when reCAPTCHA is ready
  React.useEffect(() => {
    if (isReady && onReady) {
      onReady(executeRecaptcha);
    }
  }, [isReady, onReady, executeRecaptcha]);

  // Notify parent of errors
  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  if (!showBadge) {
    return null; // Invisible reCAPTCHA
  }

  return (
    <div className={styles.recaptchaBadge}>
      <div className={styles.recaptchaInfo}>
        <div className={styles.recaptchaLogo}>
          <img
            src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
            alt="reCAPTCHA"
            width={32}
            height={32}
          />
        </div>
        <span className={styles.recaptchaText}>
          {isReady ? (
            <>
              <span className={styles.checkmark}>✓</span>
              Protected by reCAPTCHA
            </>
          ) : error ? (
            <>
              <span className={styles.errorMark}>⚠</span>
              reCAPTCHA Error
            </>
          ) : (
            <>
              <span className={styles.loading}>⏳</span>
              Loading reCAPTCHA...
            </>
          )}
        </span>
      </div>
    </div>
  );
};
