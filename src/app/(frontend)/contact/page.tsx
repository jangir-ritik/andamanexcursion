"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactForm } from "./components/ContactForm/ContactForm";
import { useFormPersistence } from "./hooks/useFormPersistence";
import { useEnquiryData } from "./hooks/useEnquiryData";
import styles from "./page.module.css";
import {
  contactFormSchema,
  ContactFormData,
  FormSubmissionResult,
} from "./components/ContactForm/ContactForm.types";
import { SectionTitle } from "@/components/atoms";
import { Container } from "@/components/layout";
import {
  Package,
  Calendar,
  IndianRupee,
  FileText,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

// Component that uses useEnquiryData (wrapped in Suspense)
function ContactPageContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<FormSubmissionResult | null>(
    null
  );
  const [formInitialized, setFormInitialized] = useState(false);

  // Get package enquiry data from URL parameters
  const {
    formDefaults,
    hasPackageData,
    packageInfo,
    isLoading,
    contactFormOptions,
    error: enquiryError,
    isDataReady,
  } = useEnquiryData();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema) as any,
    mode: "onChange",
    defaultValues: {
      booking: {
        package: "",
        duration: "",
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        adults: 2,
        children: 0,
      },
      personal: {
        fullName: "",
        age: 25,
        phone: "",
        email: "",
      },
      additional: {
        tags: [],
        message: "",
      },
      additionalMessage: "",
    },
  });

  const { clearSavedData, hasSavedData } = useFormPersistence(form);

  // Enhanced form initialization with better error handling
  useEffect(() => {
    if (!isDataReady || formInitialized) return;

    const initializeForm = async () => {
      try {
        console.log("🔄 Initializing form with data...", {
          hasPackageData,
          formDefaults: !!formDefaults,
          contactFormOptionsReady: !contactFormOptions.isLoading,
        });

        if (hasPackageData && formDefaults) {
          // Clear any existing saved data to prevent conflicts
          clearSavedData();
          console.log("🧹 Cleared saved form data to avoid conflicts");

          // Set immediate values first (non-Select components)
          const immediateUpdates = [
            ["booking.checkIn", formDefaults.booking.checkIn],
            ["booking.checkOut", formDefaults.booking.checkOut],
            ["booking.adults", formDefaults.booking.adults],
            ["booking.children", formDefaults.booking.children],
            ["additional.message", formDefaults.additional.message],
          ] as const;

          immediateUpdates.forEach(([field, value]) => {
            if (value !== undefined) {
              form.setValue(field, value, { shouldDirty: false });
            }
          });

          // Delay Select component updates to ensure they're ready
          setTimeout(() => {
            console.log("⏰ Setting Select values with delay...");

            if (formDefaults.booking.package) {
              form.setValue("booking.package", formDefaults.booking.package, {
                shouldDirty: false,
              });
            }

            if (formDefaults.booking.duration) {
              form.setValue("booking.duration", formDefaults.booking.duration, {
                shouldDirty: false,
              });
            }

            // Trigger validation after all values are set
            form.trigger();

            console.log("✅ Form initialized with package data");
          }, 150);
        }

        setFormInitialized(true);
      } catch (error) {
        console.error("❌ Error initializing form:", error);
        setFormInitialized(true); // Prevent infinite retry
      }
    };

    initializeForm();
  }, [
    isDataReady,
    formInitialized,
    hasPackageData,
    formDefaults,
    form,
    clearSavedData,
    contactFormOptions.isLoading,
  ]);

  const onSubmit = useCallback(
    async (data: ContactFormData, recaptchaToken?: string): Promise<void> => {
      setIsSubmitting(true);
      setSubmitResult(null);

      try {
        // Log the data being sent
        console.log("📤 Submitting form data:", {
          data: JSON.stringify(data, null, 2),
          recaptchaToken: recaptchaToken ? "present" : "missing",
          packageInfo: packageInfo ? "present" : "missing",
        });

        // Step 1: Verify reCAPTCHA if token provided
        if (recaptchaToken) {
          console.log("🔐 Verifying reCAPTCHA token...");
          const recaptchaResponse = await fetch("/api/verify-recaptcha", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: recaptchaToken,
              action: "contact_form",
            }),
          });

          const recaptchaResult = await recaptchaResponse.json();
          if (!recaptchaResult.success) {
            throw new Error(
              recaptchaResult.error || "Security verification failed"
            );
          }
          console.log("✅ reCAPTCHA verified:", {
            score: recaptchaResult.score,
          });
        }

        // Step 2: Prepare and log the request payload
        const requestPayload = {
          ...data,
          enquirySource: hasPackageData ? "package-detail" : "direct",
          packageInfo: packageInfo,
          timestamp: new Date().toISOString(),
          recaptchaScore: recaptchaToken ? "verified" : "skipped",
        };

        console.log("🚀 Sending contact enquiry:", {
          url: "/api/contact-enquiry",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          payloadSize: JSON.stringify(requestPayload).length,
          payload: JSON.stringify(requestPayload, null, 2),
        });

        // Step 3: Submit form data
        const response = await fetch("/api/contact-enquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        });

        console.log("📥 Response received:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
        });

        // Log response body before checking if it's ok
        const responseText = await response.text();
        console.log("📄 Response body:", responseText);

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

          try {
            const errorData = JSON.parse(responseText);
            console.error("❌ API Error Response:", errorData);
            errorMessage = errorData.error || errorData.message || errorMessage;

            // Add field-specific error info if available
            if (errorData.field) {
              errorMessage += ` (Field: ${errorData.field})`;
            }
          } catch (parseError) {
            console.error("❌ Failed to parse error response:", parseError);
          }

          throw new Error(errorMessage);
        }

        const result = JSON.parse(responseText);
        console.log("✅ Success response:", result);

        setSubmitResult({
          success: true,
          message:
            result.message ||
            "Your enquiry has been submitted successfully! We'll get back to you soon!",
          data: {
            enquiryId: result.enquiryId,
            estimatedResponseTime: result.estimatedResponseTime || "24 hours",
          },
        });

        // Clear form on success
        clearSavedData();
        form.reset();
      } catch (error) {
        console.error("❌ Form submission error:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : "No stack trace",
        });

        setSubmitResult({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to submit enquiry. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearSavedData, form, hasPackageData, packageInfo]
  );

  // Function to dismiss error and reset form state
  const handleDismissError = useCallback(() => {
    setSubmitResult(null);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.contactPage}>
        <Container className={styles.container}>
          <SectionTitle
            specialWord="Love to Hear"
            text="We'd Love to Hear from you!"
            className={styles.title}
          />
          <div className={styles.loading}>
            <Loader2 className={styles.loadingSpinner} />
            <p>Loading form options...</p>
          </div>
        </Container>
      </div>
    );
  }

  // Show error state
  if (enquiryError) {
    return (
      <div className={styles.contactPage}>
        <Container className={styles.container}>
          <SectionTitle
            specialWord="Love to Hear"
            text="We'd Love to Hear from you!"
            className={styles.title}
          />
          <div className={styles.error}>
            <AlertTriangle className={styles.errorIcon} />
            <p>{enquiryError}</p>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.contactPage}>
      <Container className={styles.container}>
        <SectionTitle
          specialWord="Love to Hear"
          text="We'd Love to Hear from you!"
          className={styles.title}
        />

        {/* Package Enquiry Notice */}
        {hasPackageData && packageInfo && (
          <div className={styles.packageNotice}>
            <div className={styles.packageHeader}>
              <h3>
                <Package size={20} className={styles.packageIcon} />
                Package Enquiry
              </h3>
              <div className={styles.packageBadge}>From Package Details</div>
            </div>

            <div className={styles.packageDetails}>
              <h4>{packageInfo.title}</h4>
              <div className={styles.packageMeta}>
                {packageInfo.period && (
                  <span className={styles.packagePeriod}>
                    <Calendar size={16} />
                    {packageInfo.period}
                  </span>
                )}
                {packageInfo.price && (
                  <span className={styles.packagePrice}>
                    <IndianRupee size={16} />
                    {packageInfo.price.toLocaleString()}/adult
                  </span>
                )}
              </div>

              {packageInfo.description && (
                <p className={styles.packageDescription}>
                  {packageInfo.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Saved Data Notice */}
        {!hasPackageData && hasSavedData() && (
          <div className={styles.savedDataNotice}>
            <p>
              <FileText size={16} className={styles.savedDataIcon} />
              We've restored your previous form data.
              <button
                type="button"
                onClick={() => {
                  clearSavedData();
                  form.reset();
                }}
                className={styles.clearDataButton}
              >
                Start Fresh
              </button>
            </p>
          </div>
        )}

        <ContactForm
          form={form}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitResult={submitResult}
          contactFormOptions={contactFormOptions}
          onDismissError={handleDismissError}
        />
      </Container>
    </div>
  );
}

// Loading component for Suspense fallback
function ContactPageLoading() {
  return (
    <div className={styles.contactPage}>
      <Container className={styles.container}>
        <SectionTitle
          specialWord="Love to Hear"
          text="We'd Love to Hear from you!"
          className={styles.title}
        />
        <div className={styles.loading}>
          <Loader2 className={styles.loadingSpinner} />
          <p>Loading form...</p>
        </div>
      </Container>
    </div>
  );
}

// Main component with Suspense boundary and error boundary
export default function ContactPage() {
  return (
    <Suspense fallback={<ContactPageLoading />}>
      <ContactPageContent />
    </Suspense>
  );
}
