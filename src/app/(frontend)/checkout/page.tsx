"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckoutFlow } from "./components/CheckoutFlow";
import { useActivityStore } from "@/store/ActivityStore";
import { useCheckoutStore } from "@/store/CheckoutStore";
import { Container } from "@/components/layout";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal } = useActivityStore();
  const { initializeFromActivityCart, reset } = useCheckoutStore();

  // Initialize checkout from activity cart
  useEffect(() => {
    // Check if cart is empty
    if (!cart || cart.length === 0) {
      // Redirect to activities page if no items in cart
      router.push("/activities");
      return;
    }

    // Initialize checkout with cart items
    initializeFromActivityCart(cart);

    // Cleanup on unmount
    return () => {
      // Only reset if navigating away from checkout
      // This prevents reset when just refreshing the page
    };
  }, [cart, initializeFromActivityCart, router]);

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
