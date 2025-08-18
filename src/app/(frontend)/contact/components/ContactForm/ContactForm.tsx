import React, { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { ContactFormData, FormSubmissionResult } from "./ContactForm.types";
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
  Send,
  Hash,
  Clock,
  Copy,
  Check,
} from "lucide-react";

interface ContactFormProps {
  form: UseFormReturn<ContactFormData>;
  onSubmit: (data: ContactFormData, recaptchaToken?: string) => Promise<void>;
  isSubmitting: boolean;
  submitResult: FormSubmissionResult | null;
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

  const handleRecaptchaReady = useCallback(
    (executeFunction: () => Promise<string | null>) => {
      setRecaptchaExecute(() => executeFunction);
      setRecaptchaError(null);
    },
    []
  );

  const handleRecaptchaError = useCallback((error: string) => {
    setRecaptchaError(error);
    setRecaptchaExecute(null);
  }, []);

  const handleCopyReferenceId = useCallback(async (referenceId: string) => {
    try {
      await navigator.clipboard.writeText(referenceId);
      setCopiedId(referenceId);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy reference ID:", error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = referenceId;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedId(referenceId);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
      }
      document.body.removeChild(textArea);
    }
  }, []);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      // Get reCAPTCHA token
      let recaptchaToken: string | null = null;

      if (recaptchaExecute) {
        console.log("🔐 Executing reCAPTCHA...");
        recaptchaToken = await recaptchaExecute();

        if (!recaptchaToken) {
          throw new Error("reCAPTCHA verification failed");
        }

        console.log("✅ reCAPTCHA token obtained");
      } else {
        console.warn("⚠️ reCAPTCHA not ready, proceeding without token");
      }

      // Submit form with reCAPTCHA token
      await form.handleSubmit((data) => onSubmit(data, recaptchaToken || ""))();
    } catch (error) {
      console.error("Form submission error:", error);
      setRecaptchaError(
        error instanceof Error ? error.message : "Submission failed"
      );
    }
  };

  const { isValid, isDirty } = form.formState;
  const isRecaptchaReady = !!recaptchaExecute && !recaptchaError;

  return (
    <form onSubmit={handleFormSubmit} className={styles.form} noValidate>
      <div className={styles.sections}>
        <BookingDetails form={form} contactFormOptions={contactFormOptions} />
        <div className={styles.separator} />
        <PersonalDetails form={form} />
        <div className={styles.separator} />
        <AdditionalMessage form={form} />
      </div>

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
            <div className={styles.recaptchaError}>
              <AlertTriangle size={14} />
              {recaptchaError}
            </div>
          )}
        </div>

        <Button
          showArrow
          disabled={isSubmitting || (!isValid && isDirty) || !isRecaptchaReady}
          type="submit"
          className={styles.submitButton}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className={styles.spinner} />
              Submitting...
            </>
          ) : (
            <>Send Enquiry</>
          )}
        </Button>
      </div>

      {/* Unified Success Message */}
      {submitResult?.success && (
        <div className={styles.successMessage} role="alert">
          <CheckCircle size={24} className={styles.successIcon} />
          <div className={styles.successContent}>
            <h3>Enquiry Submitted Successfully!</h3>
            <p>
              {submitResult.message ||
                "Your enquiry has been submitted successfully. We'll get back to you soon!"}
            </p>

            {submitResult.data?.enquiryId && (
              <div className={styles.enquiryDetails}>
                <div className={styles.enquiryId}>
                  <div className={styles.enquiryIdContent}>
                    <Hash size={16} />
                    <strong>Reference ID:</strong>
                    <span className={styles.referenceIdValue}>
                      {submitResult.data.enquiryId}
                    </span>
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
              </div>
            )}

            {submitResult.data?.estimatedResponseTime && (
              <p className={styles.responseTime}>
                <Clock size={16} />
                <strong>Expected response time:</strong>{" "}
                {submitResult.data.estimatedResponseTime}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitResult && !submitResult.success && (
        <div className={styles.errorMessage} role="alert">
          <AlertTriangle size={24} className={styles.errorIcon} />
          <div className={styles.errorContent}>
            <h3>Submission Failed</h3>
            <p>
              {submitResult.message ||
                "Failed to submit enquiry. Please try again."}
            </p>
            {onDismissError && (
              <button
                type="button"
                onClick={onDismissError}
                className={styles.dismissButton}
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
    </form>
  );
};
