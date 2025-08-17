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

  // Enhanced form submission with proper error handling
  const onSubmit = useCallback(
    async (data: ContactFormData): Promise<void> => {
      setIsSubmitting(true);
      setSubmitResult(null);

      try {
        console.log("📤 Submitting form data:", {
          package: data.booking.package,
          duration: data.booking.duration,
          name: data.personal.fullName,
          email: data.personal.email,
        });

        // Simulate API call - replace with actual endpoint
        const response = await fetch("/api/contact-enquiry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            enquirySource: hasPackageData ? "package-detail" : "direct",
            packageInfo: packageInfo,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        setSubmitResult({
          success: true,
          message: "Your enquiry has been submitted successfully!",
          data: {
            enquiryId: result.enquiryId,
            estimatedResponseTime: result.estimatedResponseTime || "24 hours",
          },
        });

        // Clear form and saved data on success
        clearSavedData();
        form.reset();

        // Analytics tracking
        console.log("✅ Form submitted successfully", {
          enquiryId: result.enquiryId,
          source: hasPackageData ? "package-enquiry" : "direct-contact",
        });
      } catch (error) {
        console.error("❌ Form submission error:", error);

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
            <div className={styles.loadingSpinner}></div>
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
            <p>⚠️ {enquiryError}</p>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
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
              <h3>📦 Package Enquiry</h3>
              <div className={styles.packageBadge}>From Package Details</div>
            </div>

            <div className={styles.packageDetails}>
              <h4>{packageInfo.title}</h4>
              <div className={styles.packageMeta}>
                {packageInfo.period && (
                  <span className={styles.packagePeriod}>
                    📅 {packageInfo.period}
                  </span>
                )}
                {packageInfo.price && (
                  <span className={styles.packagePrice}>
                    💰 ₹{packageInfo.price.toLocaleString()}/adult
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
              📝 We've restored your previous form data.
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
          submitSuccess={submitResult?.success || false}
          contactFormOptions={contactFormOptions}
        />

        {/* Enhanced Success Message */}
        {submitResult?.success && (
          <div className={styles.successBanner}>
            <div className={styles.successContent}>
              <div className={styles.successIcon}>🎉</div>
              <div>
                <h3>Enquiry Submitted Successfully!</h3>
                <p>{submitResult.message}</p>
                {submitResult.data?.enquiryId && (
                  <p className={styles.enquiryId}>
                    Reference ID: <strong>{submitResult.data.enquiryId}</strong>
                  </p>
                )}
                {submitResult.data?.estimatedResponseTime && (
                  <p className={styles.responseTime}>
                    Expected response time:{" "}
                    {submitResult.data.estimatedResponseTime}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitResult && !submitResult.success && (
          <div className={styles.errorBanner}>
            <div className={styles.errorContent}>
              <div className={styles.errorIcon}>❌</div>
              <div>
                <h3>Submission Failed</h3>
                <p>{submitResult.message}</p>
                <button
                  onClick={() => setSubmitResult(null)}
                  className={styles.dismissButton}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
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
          <div className={styles.loadingSpinner}></div>
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
