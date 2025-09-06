"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCheckoutAdapter } from "@/utils/CheckoutAdapter";
import {
  useSimpleCheckoutStore,
  createDefaultFormData,
  useCheckoutSession,
} from "@/store/SimpleCheckoutStore";
import { SimpleCheckoutFlow } from "./components/SimpleCheckoutFlow";
import { Container } from "@/components/layout";
import styles from "./page.module.css";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use the new React Query adapter pattern - eliminates complex state management
  const { bookingType, bookingData, requirements, isLoading, error } =
    useCheckoutAdapter(searchParams);

  const { ensureValidSession } = useCheckoutSession();

  useEffect(() => {
    ensureValidSession();
  }, []);

  // Use simplified store - only form state and navigation
  const { formData, updateFormData, setError, reset } =
    useSimpleCheckoutStore();

  useEffect(() => {
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
          router.push("/ferry");
        } else if (bookingType === "boat") {
          router.push("/boat");
        } else {
          router.push("/activities");
        }
      }, 2000); // Give user time to see the error
      return;
    }

    // Ensure we have valid booking data
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
  if (isLoading || !bookingData) {
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

  // Error state - user-friendly
  if (error) {
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
  return (
    <div className={styles.checkoutPage}>
      <Container noPadding>
        <SimpleCheckoutFlow
          bookingData={bookingData}
          requirements={requirements}
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
