import React, { useState, useCallback, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { ContactFormData } from "./ContactForm.types";
import { BookingDetails } from "../BookingDetails/BookingDetails";
import { PersonalDetails } from "../PersonalDetails/PersonalDetails";
import { AdditionalMessage } from "../AdditionalMessage/AdditionalMessage";
import { Recaptcha } from "@/components/atoms/Recaptcha/Recaptcha";
import styles from "./ContactForm.module.css";
import { Button } from "@/components/atoms";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Hash,
  Clock,
  Copy,
  Check,
  Shield,
  Wifi,
  WifiOff,
} from "lucide-react";

interface ContactFormProps {
  form: UseFormReturn<ContactFormData>;
  onSubmit: (data: ContactFormData, recaptchaToken?: string) => Promise<void>;
  isSubmitting: boolean;
  submitResult: any;
  contactFormOptions?: any;
  onDismissError?: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  form,
  onSubmit,
  isSubmitting,
  submitResult,
  contactFormOptions,
  onDismissError,
}) => {
  const [recaptchaExecute, setRecaptchaExecute] = useState<
    (() => Promise<string | null>) | null
  >(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const formRef = useRef<HTMLFormElement>(null);

  // Network status monitoring
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRecaptchaReady = useCallback(
    (executeFunction: () => Promise<string | null>) => {
      setRecaptchaExecute(() => executeFunction);
      setRecaptchaError(null);
    },
    []
  );

  const handleRecaptchaError = useCallback((error: string) => {
    console.error("reCAPTCHA error:", error);
    setRecaptchaError(
      "Security verification failed. Please refresh the page and try again."
    );
    setRecaptchaExecute(null);
  }, []);

  const handleCopyReferenceId = useCallback(async (referenceId: string) => {
    try {
      await navigator.clipboard.writeText(referenceId);
      setCopiedId(referenceId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = referenceId;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
        setCopiedId(referenceId);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (fallbackError) {
        console.error("Copy failed:", fallbackError);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }, []);

  const handleFormSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Check network status
      if (!isOnline) {
        setRecaptchaError(
          "No internet connection. Please check your connection and try again."
        );
        return;
      }

      // Validate form before proceeding
      const isValid = await form.trigger();
      if (!isValid) {
        // Focus on the first error field
        const firstErrorField = Object.keys(form.formState.errors)[0];
        if (firstErrorField) {
          const errorElement = formRef.current?.querySelector(
            `[name="${firstErrorField}"]`
          ) as HTMLElement;
          errorElement?.focus();
        }
        return;
      }

      try {
        setRecaptchaError(null);

        // Get reCAPTCHA token
        let recaptchaToken: string | null = null;

        if (recaptchaExecute) {
          try {
            recaptchaToken = await recaptchaExecute();
            if (!recaptchaToken) {
              throw new Error("Security verification failed");
            }
          } catch (recaptchaErr) {
            throw new Error("Security verification failed. Please try again.");
          }
        }

        // Submit form with validated data and reCAPTCHA token
        const formData = form.getValues();
        await onSubmit(formData, recaptchaToken || undefined);
      } catch (error) {
        console.error("Form submission error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Submission failed";
        setRecaptchaError(errorMessage);

        // If it's a network error, suggest checking connection
        if (
          errorMessage.includes("fetch") ||
          errorMessage.includes("network")
        ) {
          setRecaptchaError(
            "Network error. Please check your connection and try again."
          );
        }
      }
    },
    [form, onSubmit, recaptchaExecute, isOnline]
  );

  // Enhanced form validation state
  const { isValid, isDirty, errors } = form.formState;
  const hasErrors = Object.keys(errors).length > 0;
  const isRecaptchaReady = !!recaptchaExecute && !recaptchaError;
  const canSubmit =
    isValid && isDirty && isRecaptchaReady && isOnline && !isSubmitting;

  // Get submit button text and state
  const getSubmitButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 size={16} className={styles.spinner} />
          Submitting...
        </>
      );
    }

    if (!isOnline) {
      return (
        <>
          <WifiOff size={16} />
          No Connection
        </>
      );
    }

    if (!isRecaptchaReady) {
      return (
        <>
          <Shield size={16} />
          Security Check...
        </>
      );
    }

    return "Send Enquiry";
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleFormSubmit}
      className={styles.form}
      noValidate
    >
      <div className={styles.sections}>
        <BookingDetails form={form} contactFormOptions={contactFormOptions} />
        <div className={styles.separator} />
        <PersonalDetails form={form} />
        <div className={styles.separator} />
        <AdditionalMessage form={form} />
      </div>

      {/* Network Status Indicator */}
      {!isOnline && (
        <div className={styles.networkWarning} role="alert">
          <WifiOff size={16} />
          <span>
            You appear to be offline. Please check your internet connection.
          </span>
        </div>
      )}

      {/* Form Validation Summary */}
      {hasErrors && isDirty && (
        <div className={styles.validationSummary} role="alert">
          <AlertTriangle size={16} />
          <span>Please fix the errors above before submitting</span>
        </div>
      )}

      <div className={styles.submitSection}>
        <div className={styles.recaptchaContainer}>
          <Recaptcha
            siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onReady={handleRecaptchaReady}
            onError={handleRecaptchaError}
            action="contact_form"
            showBadge={true}
          />

          {recaptchaError && (
            <div className={styles.recaptchaError} role="alert">
              <AlertTriangle size={14} />
              <span>{recaptchaError}</span>
            </div>
          )}

          {isOnline && (
            <div className={styles.securityNote}>
              <Shield size={12} />
              <span>Protected by reCAPTCHA</span>
            </div>
          )}
        </div>

        <Button
          showArrow={canSubmit}
          disabled={!canSubmit}
          type="submit"
          className={`${styles.submitButton} ${
            !canSubmit ? styles.disabled : ""
          }`}
          aria-describedby={hasErrors ? "form-errors" : undefined}
        >
          {getSubmitButtonContent()}
        </Button>
      </div>

      {/* Success Message */}
      {submitResult?.success && (
        <div className={styles.successMessage} role="alert" aria-live="polite">
          <div className={styles.successHeader}>
            <CheckCircle size={24} className={styles.successIcon} />
            <h3>Enquiry Submitted Successfully!</h3>
          </div>

          <div className={styles.successContent}>
            <p>{submitResult.message}</p>

            {submitResult.data?.enquiryId && (
              <div className={styles.enquiryDetails}>
                <div className={styles.enquiryId}>
                  <div className={styles.enquiryIdContent}>
                    <Hash size={16} />
                    <strong>Reference ID:</strong>
                    <code className={styles.referenceIdValue}>
                      {submitResult.data.enquiryId}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyReferenceId(submitResult.data?.enquiryId || "")
                    }
                    className={styles.copyButton}
                    title="Copy Reference ID"
                  >
                    {copiedId === submitResult.data.enquiryId ? (
                      <>
                        <Check size={14} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className={styles.helpText}>
                  <p>
                    Please save this reference ID for your records. You can use
                    it to track your enquiry.
                  </p>
                </div>
              </div>
            )}

            {submitResult.data?.estimatedResponseTime && (
              <div className={styles.responseTime}>
                <Clock size={16} />
                <span>
                  <strong>Expected response time:</strong>{" "}
                  {submitResult.data.estimatedResponseTime}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitResult && !submitResult.success && (
        <div className={styles.errorMessage} role="alert" aria-live="polite">
          <div className={styles.errorHeader}>
            <AlertTriangle size={24} className={styles.errorIcon} />
            <h3>Submission Failed</h3>
          </div>

          <div className={styles.errorContent}>
            <p>{submitResult.message}</p>

            <div className={styles.errorActions}>
              {onDismissError && (
                <button
                  type="button"
                  onClick={onDismissError}
                  className={styles.dismissButton}
                >
                  Try Again
                </button>
              )}

              <button
                type="button"
                onClick={() => window.location.reload()}
                className={styles.refreshButton}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
