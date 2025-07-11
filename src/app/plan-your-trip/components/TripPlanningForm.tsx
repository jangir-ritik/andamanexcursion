import React from "react";
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

import { Step1Component } from "./Step1Component";
import { Step2Component } from "./Step2Component";
import { Step3Component } from "./Step3Component";
import styles from "./TripPlanningForm.module.css";
import { StepIndicator } from "./StepIndicator";
import { Loader2 } from "lucide-react";

const TOTAL_STEPS = 3;
const STEP_SCHEMAS = [step1Schema, step2Schema, step3Schema];

const STEPS_CONFIG = [
  { id: 1, title: "About Yourself", description: "Personal & Trip Details" },
  { id: 2, title: "Dreamy Itinerary", description: "Daily Planning" },
  { id: 3, title: "Preferences", description: "Hotel & Travel Preferences" },
];

export const TripPlanningForm: React.FC = () => {
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

  const handleSubmit = async (data: TripFormData) => {
    try {
      // Here you would typically send the data to your API
      console.log("Form submitted:", data);
      // Show success message or redirect
    } catch (error) {
      console.error("Submission error:", error);
      // Handle error
    }
  };

  const handleNext = async () => {
    if (isLastStep) {
      await form.handleSubmit(handleSubmit)();
    } else {
      await nextStep();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Component form={form} />;
      case 2:
        return <Step2Component form={form} />;
      case 3:
        return <Step3Component form={form} />;
      default:
        return <Step1Component form={form} />;
    }
  };

  return (
    <Container className={styles.container}>
      {isValidating && (
        <div className={styles.loadingOverlay}>
          <Loader2 className={styles.spinner} size={32} />
          <span>Processing...</span>
        </div>
      )}
      <form onSubmit={form.handleSubmit(handleSubmit)} className={styles.form}>
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

        {/* Step Content */}
        <Section className={styles.stepContent}>{renderStepContent()}</Section>

        {/* Navigation Footer */}
        <Section id="form-footer" className={styles.footer}>
          <Row className={styles.footerRow}>
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isFirstStep || isValidating}
            >
              {isFirstStep ? "Cancel" : "Go Back"}
            </Button>
            <Button
              type={isLastStep ? "submit" : "button"}
              showArrow={!isLastStep}
              onClick={handleNext}
              disabled={form.formState.isSubmitting || isValidating}
            >
              {isValidating ? (
                <>
                  <Loader2 className={styles.buttonSpinner} size={16} />
                  Processing...
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
    </Container>
  );
};
