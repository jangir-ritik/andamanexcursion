"use client";
import React, { useLayoutEffect, useEffect } from "react";
import { useCheckoutStore } from "@/store/CheckoutStore";
import { StepIndicator } from "@/app/(frontend)/plan-your-trip/components/StepIndicator";
import { MemberDetailsStep } from "../MemberDetailsStep";
import { ReviewStep } from "../ReviewStep";
import { ConfirmationStep } from "../ConfirmationStep";
import { LoadingOverlay } from "@/components/molecules/LoadingOverlay";
import { useCheckoutProtection } from "@/hooks/useCheckoutProtection";
import { BeforeUnloadModal } from "@/components/molecules/BeforeUnloadModal";
import type {
  UnifiedBookingData,
  PassengerRequirements,
} from "@/utils/CheckoutAdapter";
import styles from "./CheckoutFlow.module.css";

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

interface CheckoutFlowProps {
  bookingData: UnifiedBookingData;
  requirements: PassengerRequirements;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  bookingData,
  requirements,
}) => {
  const {
    currentStep,
    setCurrentStep,
    bookingConfirmation,
    formData,
    cleanupOrphanedSessions,
    isLoading,
  } = useCheckoutStore();

  // Add global checkout protection for all page navigation
  const { showBeforeUnloadModal, handleStayOnPage, handleLeavePage } = 
    useCheckoutProtection({ step: currentStep });

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
    console.log("CheckoutFlow - Props", {
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
          <MemberDetailsStep
            bookingData={bookingData}
            requirements={requirements}
          />
        );
      case 2:
        return (
          <ReviewStep
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

      {/* Loading Overlay for checkout transitions */}
      <LoadingOverlay 
        isVisible={isLoading}
        title={
          currentStep === 2 && bookingConfirmation 
            ? "Booking Confirmed!" 
            : currentStep === 2 
            ? "Processing Payment" 
            : "Loading"
        }
        message={
          currentStep === 2 && bookingConfirmation
            ? "Your booking has been confirmed! Redirecting to confirmation page..."
            : currentStep === 2 
            ? "Please wait while we process your payment and confirm your booking..."
            : "Please wait while we prepare your checkout..."
        }
      />

      {/* Global BeforeUnload Modal for page navigation protection */}
      {showBeforeUnloadModal && (
        <BeforeUnloadModal
          isVisible={showBeforeUnloadModal}
          onStay={handleStayOnPage}
          onLeave={handleLeavePage}
          title="Leave checkout process?"
          message={`You'll lose all your progress if you leave now. Are you sure you want to continue?`}
        />
      )}

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
                  isLoading,
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
