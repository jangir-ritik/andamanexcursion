"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCheckoutAdapterRQ } from "@/utils/CheckoutAdapter";
import {
  useSimpleCheckoutStore,
  createDefaultFormData,
} from "@/store/SimpleCheckoutStore";
import { SimpleCheckoutFlow } from "./components/SimpleCheckoutFlow";
import { Container } from "@/components/layout";
import styles from "./page.module.css";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use the new React Query adapter pattern - eliminates complex state management
  const { bookingType, bookingData, requirements, isLoading, error } =
    useCheckoutAdapterRQ(searchParams);

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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">
              Initializing Checkout
            </h2>
            <p className="text-gray-600">
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-red-600 mb-6">
              <h2 className="text-2xl font-semibold mb-2">Checkout Error</h2>
              <p className="text-gray-700">{error}</p>
            </div>
            <div className="space-x-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
    <Suspense fallback={<div>Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
