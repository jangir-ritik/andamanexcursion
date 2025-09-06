"use client";
import React, { useLayoutEffect, useEffect } from "react";
import { useSimpleCheckoutStore } from "@/store/SimpleCheckoutStore";
import { StepIndicator } from "@/app/(frontend)/plan-your-trip/components/StepIndicator";
import { SimpleMemberDetailsStep } from "../SimpleMemberDetailsStep";
import { SimpleReviewStep } from "../SimpleReviewStep";
import { ConfirmationStep } from "../ConfirmationStep";
import type {
  UnifiedBookingData,
  PassengerRequirements,
} from "@/utils/CheckoutAdapter";
import styles from "./SimpleCheckoutFlow.module.css";

// Checkout steps configuration
const CHECKOUT_STEPS = [
  {
    id: 1,
    title: "Enter your details",
    description: "Add member information",
  },
  {
    id: 2,
    title: "Review",
    description: "Verify your details",
  },
  {
    id: 3,
    title: "Checkout",
    description: "Booking confirmation",
  },
];

interface SimpleCheckoutFlowProps {
  bookingData: UnifiedBookingData;
  requirements: PassengerRequirements;
}

export const SimpleCheckoutFlow: React.FC<SimpleCheckoutFlowProps> = ({
  bookingData,
  requirements,
}) => {
  const {
    currentStep,
    setCurrentStep,
    bookingConfirmation,
    formData,
    cleanupOrphanedSessions,
  } = useSimpleCheckoutStore();

  // Clean up orphaned sessions on mount
  useEffect(() => {
    cleanupOrphanedSessions();
  }, [cleanupOrphanedSessions]);

  // Auto-scroll to top when step changes
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Debug logging
  useEffect(() => {
    console.log("SimpleCheckoutFlow - Props", {
      bookingData,
      requirements,
      currentStep,
      formData,
    });
  }, [bookingData, requirements, currentStep, formData]);

  // Render appropriate step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <SimpleMemberDetailsStep
            bookingData={bookingData}
            requirements={requirements}
          />
        );
      case 2:
        return (
          <SimpleReviewStep
            bookingData={bookingData}
            requirements={requirements}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            bookingData={bookingData}
            requirements={requirements}
          />
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className={styles.checkoutFlow}>
      {/* Step Indicator */}
      <div className={styles.stepIndicatorContainer}>
        <StepIndicator
          steps={CHECKOUT_STEPS}
          currentStep={currentStep}
          onStepClick={(step) => {
            // Allow navigation to previous steps or current step
            if (step <= currentStep) {
              setCurrentStep(step);
            }
          }}
          isStepCompleted={(step) => step < currentStep}
          isStepAccessible={(step) => step <= currentStep}
        />
      </div>

      {/* Main Content */}
      <div className={styles.stepContent}>{renderStepContent()}</div>

      {/* Debug Info (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <div className={styles.debugInfo}>
          <details>
            <summary>Debug Info</summary>
            <pre>
              {JSON.stringify(
                {
                  currentStep,
                  bookingType: bookingData.type,
                  totalItems: bookingData.items.length,
                  totalPassengers: bookingData.totalPassengers,
                  hasFormData: !!formData,
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};
