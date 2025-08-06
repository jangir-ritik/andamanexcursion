"use client";
import React, { useLayoutEffect, useEffect } from "react";
import { useCheckoutStore, useCurrentStep } from "@/store/CheckoutStore";
import { StepIndicator } from "@/app/(frontend)/plan-your-trip/components/StepIndicator";
import { MemberDetailsStep } from "../MemberDetailsStep";
import { ReviewStep } from "../ReviewStep";
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
  const { setCurrentStep, bookingConfirmation, persistedFormData } =
    useCheckoutStore();

  // Force scroll function for external use
  const forceScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Make it available globally (you can call this from ReviewStep)
  useEffect(() => {
    (window as any).forceScrollToTop = forceScrollToTop;
    return () => {
      delete (window as any).forceScrollToTop;
    };
  }, []);

  // Scroll to top whenever step changes
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Add a small delay to ensure DOM updates have completed
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  }, [currentStep]);

  // Step completion logic - FIXED
  const isStepCompleted = (step: number): boolean => {
    if (step < currentStep) return true;
    if (step === 1 && persistedFormData) return true; // Step 1 is completed if we have form data
    if (step === 2 && currentStep > 2) return true; // Step 2 is completed if we're past it
    if (step === 3 && bookingConfirmation) return true;
    return false;
  };

  // Step accessibility logic - FIXED
  const isStepAccessible = (step: number): boolean => {
    // Step 1 is always accessible
    if (step === 1) return true;

    // Step 2 is accessible if we have completed step 1 (have form data) OR are currently on step 2+
    if (step === 2) return !!persistedFormData || currentStep >= 2;

    // Step 3 is accessible if we're on step 3 or have a confirmed booking
    if (step === 3) return currentStep >= 3 || !!bookingConfirmation;

    return false;
  };

  // Handle step navigation
  const handleStepClick = (step: number) => {
    if (isStepAccessible(step)) {
      setCurrentStep(step);
    } else {
      console.log(`❌ Step ${step} is not accessible`);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <MemberDetailsStep />;
      case 2:
        return <ReviewStep />;
      case 3:
        // This is the old checkout flow - redirect to new one
        return <div>Please use the new checkout flow</div>;
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
