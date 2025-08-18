"use client";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, DescriptionText, SectionTitle } from "@/components/atoms";
import { Column, Container, Row, Section } from "@/components/layout";
import {
  TripFormData,
  tripFormSchema,
  step1Schema,
  step2Schema,
  step3Schema,
} from "../TripFormSchema";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useFormPersistence } from "../hooks/useFormPersistence";
import { useFormErrors } from "../hooks/useFormErrors";

import { Step1Component } from "./Step1Component";
import { Step2Component } from "./Step2Component";
import { Step3Component } from "./Step3Component";
import { ErrorSummary } from "./ErrorSummary";
import styles from "./TripPlanningForm.module.css";
import { StepIndicator } from "./StepIndicator";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { SaveIndicator } from "./SaveIndicator";

const TOTAL_STEPS = 3;
const STEP_SCHEMAS = [step1Schema, step2Schema, step3Schema];

const STEPS_CONFIG = [
  { id: 1, title: "About Yourself", description: "Personal & Trip Details" },
  { id: 2, title: "Dreamy Itinerary", description: "Daily Planning" },
  { id: 3, title: "Preferences", description: "Hotel & Travel Preferences" },
];

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export const TripPlanningForm: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
    mode: "onChange",
    defaultValues: {
      personalDetails: {
        name: "",
        email: "",
        phone: "",
      },
      tripDetails: {
        arrivalDate: "",
        departureDate: "",
        adults: 1,
        children: 0,
      },
      travelGoals: [],
      specialOccasion: [],
      itinerary: [],
      hotelPreferences: {
        hotelType: "",
        roomPreference: "",
        specificHotel: "",
      },
      ferryPreferences: {
        ferryClass: "",
        travelTimeSlot: "",
        preferredFerry: "",
      },
      addOns: {
        airportPickup: false,
        privateGuide: false,
        mealPreference: "",
        transportation: "",
      },
    },
  });

  // Initialize form persistence
  const { clearSavedData, saveStatus } = useFormPersistence(form);

  // Initialize form error handling
  const { errorSummary, accordionErrorIndices, validateStep, hasErrors } =
    useFormErrors(form);

  const {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    isStepCompleted,
    isStepAccessible,
    isFirstStep,
    isLastStep,
    isValidating,
  } = useMultiStepForm({
    totalSteps: TOTAL_STEPS,
    form,
    stepsSchemas: STEP_SCHEMAS,
  });

  // Add effect to ensure form is in view when step changes
  useEffect(() => {
    if (formRef.current) {
      // Scroll to top of form with a small offset for better UX
      const yOffset = -50;
      const y =
        formRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      // Only scroll if form is not already visible
      if (
        y < window.pageYOffset ||
        y > window.pageYOffset + window.innerHeight
      ) {
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  }, [currentStep]);

  // Reset form if user clicks "Cancel" on first step
  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? All progress will be lost."
      )
    ) {
      form.reset();
      clearSavedData();
      // Optionally navigate away or show a different UI
    }
  };

  const handleSubmit = async (data: TripFormData) => {
    try {
      setSubmitStatus("submitting");
      // Here you would typically send the data to your API
      console.log("Form submitted:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Clear saved data on successful submission
      clearSavedData();
      setSubmitStatus("success");

      // Reset form after successful submission (optional)
      // form.reset();
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
    }
  };

  const handleNext = async () => {
    if (isLastStep) {
      // Validate before final submission
      const isValid = await validateStep();
      if (isValid) {
        await form.handleSubmit(handleSubmit)();
      }
    } else {
      await nextStep();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Component form={form} />;
      case 2:
        return (
          <Step2Component
            form={form}
            accordionErrorIndices={accordionErrorIndices}
          />
        );
      case 3:
        return <Step3Component form={form} />;
      default:
        return <Step1Component form={form} />;
    }
  };

  // Show success/error message if form was submitted
  if (submitStatus === "success") {
    return (
      <Container className={styles.container}>
        <Section
          className={`${styles.messageContainer} ${styles.success}`}
          aria-live="assertive"
        >
          <CheckCircle size={48} />
          <SectionTitle text="Thank You!" className={styles.messageTitle} />
          <DescriptionText text="Your trip planning request has been submitted successfully. Our team will get back to you within 24 hours with your personalized itinerary." />
          <Button
            onClick={() => setSubmitStatus("idle")}
            className={styles.messageButton}
            aria-label="Start a new trip plan"
          >
            Plan Another Trip
          </Button>
        </Section>
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      {(isValidating || submitStatus === "submitting") && (
        <div className={styles.loadingOverlay} aria-live="polite" role="status">
          <Loader2 className={styles.spinner} size={32} />
          <span>
            {submitStatus === "submitting" ? "Submitting..." : "Processing..."}
          </span>
        </div>
      )}

      {submitStatus === "error" && (
        <div className={`${styles.errorBanner}`} role="alert">
          <AlertCircle size={20} />
          <span>Something went wrong. Please try again.</span>
          <Button
            variant="outline"
            onClick={() => setSubmitStatus("idle")}
            aria-label="Close error message"
            className={styles.closeButton}
          >
            ✕
          </Button>
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={form.handleSubmit(handleSubmit)}
        className={styles.form}
        aria-label="Trip Planning Form"
      >
        {/* Step Indicator */}
        <Section id="form-header" className={styles.header}>
          <StepIndicator
            steps={STEPS_CONFIG}
            currentStep={currentStep}
            onStepClick={goToStep}
            isStepCompleted={isStepCompleted}
            isStepAccessible={isStepAccessible}
          />
        </Section>

        {/* Form Title */}
        <Section className={styles.titleSection}>
          <Column className={styles.titleColumn}>
            <SectionTitle
              text="Plan your Andaman Trip!"
              specialWord="Plan"
              className={styles.title}
            />
            <DescriptionText
              className={styles.description}
              text="Fill in the form below to help us understand your ideal Andaman getaway. We'll use your preferences to create a customised itinerary just for you - no stress, no guesswork."
            />
          </Column>
        </Section>

        {/* Error Summary - show only if there are errors and validation has been triggered */}
        {errorSummary.length > 0 && (
          <Section className={styles.errorSection} aria-live="polite">
            <ErrorSummary
              errors={errorSummary}
              onErrorClick={(fieldId) => {
                form.setFocus(fieldId as any);
              }}
            />
          </Section>
        )}

        {/* Step Content */}
        <Section
          className={styles.stepContent}
          aria-label={`Step ${currentStep}: ${
            STEPS_CONFIG[currentStep - 1]?.title
          }`}
        >
          {renderStepContent()}
        </Section>

        {/* Navigation Footer */}
        <Section id="form-footer" className={styles.footer}>
          <Row className={styles.footerRow}>
            <Button
              type="button"
              variant="outline"
              onClick={isFirstStep ? handleCancel : prevStep}
              disabled={isValidating || submitStatus === "submitting"}
              aria-label={
                isFirstStep ? "Cancel form" : "Go back to previous step"
              }
            >
              {isFirstStep ? "Cancel" : "Go Back"}
            </Button>
            <Button
              type={isLastStep ? "submit" : "button"}
              showArrow={!isLastStep}
              onClick={handleNext}
              disabled={
                form.formState.isSubmitting ||
                isValidating ||
                submitStatus === "submitting"
              }
              aria-label={isLastStep ? "Submit form" : "Go to next step"}
            >
              {isValidating || submitStatus === "submitting" ? (
                <>
                  <Loader2 className={styles.buttonSpinner} size={16} />
                  {submitStatus === "submitting"
                    ? "Submitting..."
                    : "Processing..."}
                </>
              ) : isLastStep ? (
                "Submit"
              ) : (
                "Next"
              )}
            </Button>
          </Row>
        </Section>
      </form>

      {/* Auto-save indicator */}
      <SaveIndicator status={saveStatus} />
    </Container>
  );
};
