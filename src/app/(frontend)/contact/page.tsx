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
} from "./components/ContactForm/ContactForm.types";
import { SectionTitle } from "@/components/atoms";
import { Container } from "@/components/layout";

// Component that uses useEnquiryData (wrapped in Suspense)
function ContactPageContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  // Get package enquiry data from URL parameters
  const {
    formDefaults,
    hasPackageData,
    packageInfo,
    isLoading,
    contactFormOptions,
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

  // Single effect to update form when enquiry data is ready
  useEffect(() => {
    // Only run once when all data is ready and form hasn't been initialized
    if (
      !isLoading &&
      !formInitialized &&
      contactFormOptions &&
      !contactFormOptions.isLoading
    ) {
      if (hasPackageData && formDefaults) {
        console.log("Setting form values with package data:", formDefaults);

        // 🔧 CRITICAL: Clear saved form data to prevent persistence from overriding enquiry data
        clearSavedData();
        console.log("🧹 Cleared saved form data to avoid conflicts");

        // Use setValue for reliable Select component updates
        console.log("🔧 Setting form values individually...");

        // Set non-Select values immediately
        form.setValue("booking.checkIn", formDefaults.booking.checkIn);
        form.setValue("booking.checkOut", formDefaults.booking.checkOut);
        form.setValue("booking.adults", formDefaults.booking.adults);
        form.setValue("booking.children", formDefaults.booking.children);
        form.setValue("additional.message", formDefaults.additional.message);

        console.log("🔧 Set values:", {
          package: formDefaults.booking.package,
          duration: formDefaults.booking.duration,
          contactFormOptionsReady: !!contactFormOptions?.packages?.length,
        });

        // Delay Select values to ensure components are ready
        setTimeout(() => {
          console.log("⏰ Setting Select values with delay...");
          form.setValue("booking.package", formDefaults.booking.package);
          form.setValue("booking.duration", formDefaults.booking.duration);
          form.trigger();

          // Final check
          setTimeout(() => {
            const finalValues = form.getValues();
            console.log("🔍 Final check after delay:", {
              package: finalValues.booking.package,
              duration: finalValues.booking.duration,
            });
          }, 200);
        }, 100);

        console.log("✅ Form values setting initiated");
      }

      // Mark as initialized regardless of whether we had package data
      setFormInitialized(true);
    }
  }, [
    isLoading,
    formInitialized,
    hasPackageData,
    formDefaults,
    contactFormOptions,
    form,
  ]);

  const { clearSavedData } = useFormPersistence(form);

  const onSubmit = useCallback(
    async (data: ContactFormData) => {
      setIsSubmitting(true);
      try {
        // API call would go here
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

        setSubmitSuccess(true);
        clearSavedData();
        form.reset();
      } catch (error) {
        console.error("Submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearSavedData, form]
  );

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
            <h3>Package Enquiry</h3>
            <p>
              You're enquiring about: <strong>{packageInfo.title}</strong>
              {packageInfo.period && ` (${packageInfo.period})`}
              {packageInfo.price && ` - ₹${packageInfo.price.toLocaleString()}`}
            </p>
            {packageInfo.description && (
              <p className={styles.packageDescription}>
                {packageInfo.description}
              </p>
            )}
          </div>
        )}

        {isLoading ? (
          <div className={styles.loading}>
            <p>Loading form options...</p>
          </div>
        ) : (
          <ContactForm
            form={form}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitSuccess={submitSuccess}
            contactFormOptions={contactFormOptions}
          />
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
          <p>Loading form options...</p>
        </div>
      </Container>
    </div>
  );
}

// Main component with Suspense boundary
export default function ContactPage() {
  return (
    <Suspense fallback={<ContactPageLoading />}>
      <ContactPageContent />
    </Suspense>
  );
}
