"use client";
import React from "react";
import { useCheckoutStore, useCurrentStep } from "@/store/CheckoutStore";
import { StepIndicator } from "@/app/(frontend)/plan-your-trip/components/StepIndicator";
import { MemberDetailsStep } from "../MemberDetailsStep";
import { ReviewStep } from "../ReviewStep";
import { ConfirmationStep } from "../ConfirmationStep";
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

export const CheckoutFlow: React.FC = () => {
  const currentStep = useCurrentStep();
  const {
    setCurrentStep,
    bookingConfirmation,
    getTotalActivities,
    getCurrentActivityIndex,
    isLastActivity,
    moveToNextActivity,
    moveToPreviousActivity,
  } = useCheckoutStore();

  const totalActivities = getTotalActivities();
  const currentActivityIndex = getCurrentActivityIndex();

  // Step completion logic
  const isStepCompleted = (step: number): boolean => {
    if (step < currentStep) return true;
    if (step === 3 && bookingConfirmation) return true;
    return false;
  };

  // Step accessibility logic
  const isStepAccessible = (step: number): boolean => {
    // Step 1 is always accessible
    if (step === 1) return true;

    // Step 2 is accessible if we're on step 2 or later
    if (step === 2) return currentStep >= 2;

    // Step 3 is accessible if we're on step 3 or have a confirmed booking
    if (step === 3) return currentStep >= 3 || !!bookingConfirmation;

    return false;
  };

  // Handle step navigation
  const handleStepClick = (step: number) => {
    if (isStepAccessible(step)) {
      setCurrentStep(step);
    }
  };

  // Handle activity navigation
  const handleNextActivity = () => {
    const hasNext = moveToNextActivity();
    if (!hasNext && isLastActivity()) {
      // All activities completed, move to review
      setCurrentStep(2);
    }
  };

  const handlePreviousActivity = () => {
    moveToPreviousActivity();
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <MemberDetailsStep />
          </>
        );
      case 2:
        return <ReviewStep />;
      case 3:
        return <ConfirmationStep />;
      default:
        return <MemberDetailsStep />;
    }
  };

  return (
    <div className={styles.checkoutFlow}>
      {/* Progress Indicator */}
      <div className={styles.stepIndicatorWrapper}>
        <StepIndicator
          steps={CHECKOUT_STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          isStepCompleted={isStepCompleted}
          isStepAccessible={isStepAccessible}
        />
      </div>

      {/* Step Content */}
      <div className={styles.stepContent}>{renderStepContent()}</div>
    </div>
  );
};
