"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCheckoutAdapter } from "@/utils/CheckoutAdapter";
import {
  useCheckoutStore,
  createDefaultFormData,
  useCheckoutSession,
} from "@/store/CheckoutStore";
import { CheckoutFlow } from "./components/CheckoutFlow";
import { Container } from "@/components/layout";
import styles from "./page.module.css";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = parseInt(searchParams.get("step") || "1", 10);

  // Skip adapter for step 3 - we use bookingConfirmation from store instead
  const isConfirmationStep = currentStep === 3;
  
  // Use the new React Query adapter pattern - eliminates complex state management
  // For step 3, pass empty params to avoid triggering adapter logic
  const emptyParams = new URLSearchParams();
  const adapterResult = useCheckoutAdapter(isConfirmationStep ? emptyParams : searchParams);
  const { bookingType, bookingData, requirements, isLoading, error } = isConfirmationStep
    ? { bookingType: null, bookingData: null, requirements: null, isLoading: false, error: null }
    : adapterResult;

  const { ensureValidSession } = useCheckoutSession();

  useEffect(() => {
    if (currentStep !== 3) {
      ensureValidSession();
    }
  }, [currentStep]);

  // Use simplified store - only form state and navigation
  const { formData, updateFormData, setError, reset, bookingConfirmation } = useCheckoutStore();

  useEffect(() => {
    // Skip this logic for step 3
    if (currentStep === 3) {
      return;
    }
    
    console.log("CheckoutPage - Strategic Adapter Pattern", {
      bookingType,
      bookingData,
      requirements,
      error,
    });

    // Handle errors gracefully
    if (error) {
      console.error("Checkout initialization error:", error);
      setError(error);

      // Redirect to appropriate page based on booking type
      setTimeout(() => {
        if (bookingType === "ferry") {
          console.log("Redirecting to ferry page");
          router.push("/ferry");
        } else if (bookingType === "boat") {
          console.log("Redirecting to boat page");
          router.push("/boat");
        } else {
          console.log("Redirecting to activities page");
          router.push("/activities");
        }
      }, 2000); // Give user time to see the error
      return;
    }

    // Ensure we have valid booking data (not needed for step 3)
    if (!bookingData || bookingData.items.length === 0) {
      console.warn("No booking data found, redirecting...");
      if (bookingType === "ferry") {
        router.push("/ferry");
      } else if (bookingType === "boat") {
        router.push("/boat");
      } else {
        router.push("/activities");
      }
      return;
    }

    // Initialize form data if not already set
    if (!formData && requirements) {
      console.log(
        "Creating default form data for",
        requirements.totalRequired,
        "passengers"
      );
      const defaultFormData = createDefaultFormData(requirements.totalRequired);
      updateFormData(defaultFormData);
    }

    // Clear any existing errors if we have valid data
    if (bookingData && !error) {
      setError(null);
    }
  }, [
    currentStep,
    bookingType,
    bookingData,
    requirements,
    error,
    formData,
    updateFormData,
    setError,
    router,
  ]);

  // Loading state - clean and simple
  // Step 3 (confirmation) doesn't need bookingData from URL, it uses bookingConfirmation from store
  if (currentStep !== 3 && (isLoading || !bookingData)) {
    return (
      <Container noPadding>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <h2 className={styles.loadingTitle}>Initializing Checkout</h2>
            <p className={styles.loadingDescription}>
              Setting up your {bookingType} booking...
            </p>
          </div>
        </div>
      </Container>
    );
  }
  
  // For step 3, check if we have booking confirmation in store
  if (currentStep === 3 && !bookingConfirmation) {
    return (
      <Container>
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <div className={styles.errorMessage}>
              <h2 className={styles.errorTitle}>No Booking Data</h2>
              <p className={styles.errorDescription}>
                Booking confirmation not found. Please complete the payment process.
              </p>
            </div>
            <div className={styles.errorActions}>
              <button
                onClick={() => router.push("/")}
                className={styles.homeButton}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  // Error state - user-friendly (not applicable for step 3)
  if (currentStep !== 3 && error) {
    return (
      <Container>
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <div className={styles.errorMessage}>
              <h2 className={styles.errorTitle}>Checkout Error</h2>
              <p className={styles.errorDescription}>{error}</p>
            </div>
            <div className={styles.errorActions}>
              <button
                onClick={() => router.back()}
                className={styles.backButton}
              >
                Go Back
              </button>
              <button
                onClick={() => router.push("/")}
                className={styles.homeButton}
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  // Success state - render checkout flow
  // For step 3, we don't need full bookingData since ConfirmationStep uses bookingConfirmation
  // But CheckoutFlow still requires these props, so provide minimal valid data
  if (currentStep === 3 && bookingConfirmation) {
    const minimalBookingData = {
      items: [],
      totalAmount: 0,
      type: "ferry" as const,
      bookingType: "ferry" as const,
      totalPassengers: 0,
      totalPrice: 0,
      requirements: {
        totalRequired: 0,
        requiresPassportDetails: false,
        bookings: [],
      },
    };
    
    return (
      <div className={styles.checkoutPage}>
        <Container noPadding>
          <CheckoutFlow 
            bookingData={minimalBookingData} 
            requirements={minimalBookingData.requirements} 
          />
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <Container noPadding>
        <CheckoutFlow 
          bookingData={bookingData!} 
          requirements={requirements!} 
        />
      </Container>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.suspenseFallback}>Loading checkout...</div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
