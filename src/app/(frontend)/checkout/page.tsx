"use client";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckoutFlow } from "./components/CheckoutFlow";
import { useActivityStore } from "@/store/ActivityStore";
import { useCheckoutStore } from "@/store/CheckoutStore";
import { Container } from "@/components/layout";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal } = useActivityStore();
  const {
    initializeFromActivityCart,
    updateFromActivityCart,
    reset,
    isInitialized,
  } = useCheckoutStore();
  const isFirstRender = useRef(true);

  // Handle cart initialization and updates
  useEffect(() => {
    // Check if cart is empty
    if (!cart || cart.length === 0) {
      // Redirect to activities page if no items in cart
      router.push("/activities");
      return;
    }

    // On first render or when not initialized, initialize from scratch
    if (isFirstRender.current || !isInitialized) {
      initializeFromActivityCart(cart);
      isFirstRender.current = false;
    } else {
      // On subsequent cart changes, update instead of reinitializing
      // This preserves existing member data while adjusting for new passenger counts
      updateFromActivityCart(cart);
    }

    // Cleanup on unmount
    return () => {
      // Only reset if navigating away from checkout
      // This prevents reset when just refreshing the page
    };
  }, [
    cart,
    initializeFromActivityCart,
    updateFromActivityCart,
    router,
    isInitialized,
  ]);

  // Show loading or redirect if cart is empty
  if (!cart || cart.length === 0) {
    return (
      <div className={styles.checkoutPage}>
        <Container>
          <div className={styles.emptyCart}>
            <h1>Loading...</h1>
            <p>Preparing your checkout...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <Container noPadding>
        <CheckoutFlow />
      </Container>
    </div>
  );
}
