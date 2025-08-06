"use client";
import React, { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckoutFlow } from "./components/CheckoutFlow";
import { useActivityStore } from "@/store/ActivityStore";
import { useFerryStore } from "@/store/FerryStore";
import { useCheckoutStore } from "@/store/CheckoutStore";
import { Container } from "@/components/layout";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, getCartTotal } = useActivityStore();
  const { bookingSession } = useFerryStore();
  const {
    initializeFromActivityCart,
    initializeFromFerryBooking,
    initializeFromMixedBookings,
    updateFromActivityCart,
    reset,
    isInitialized,
  } = useCheckoutStore();
  const isFirstRender = useRef(true);

  // Get booking type from URL params
  const bookingType = searchParams.get("type"); // "ferry" | "activity" | "mixed"

  // Handle different booking types initialization
  useEffect(() => {
    if (bookingType === "ferry") {
      // Ferry-only checkout
      if (!bookingSession) {
        router.push("/ferry");
        return;
      }

      // Convert ferry booking session to checkout format
      // Create ferry booking structure compatible with ReviewStep
      const ferryBooking = {
        id: bookingSession.sessionId,
        sessionId: bookingSession.sessionId,
        ferry: {
          id: bookingSession.selectedFerry?.ferryId || "",
          operator: bookingSession.selectedFerry?.operator || "greenocean",
          ferryName: `Ferry ${bookingSession.selectedFerry?.ferryId}`,
          route: {
            from: { name: bookingSession.searchParams.from, code: "" },
            to: { name: bookingSession.searchParams.to, code: "" },
          },
          schedule: {
            departureTime: "",
            arrivalTime: "",
            duration: "",
            date: bookingSession.searchParams.date,
          },
        },
        selectedClass: {
          id: bookingSession.selectedClass?.classId || "",
          name: bookingSession.selectedClass?.className || "",
          price: bookingSession.selectedClass?.price || 0,
          availableSeats: 100,
          amenities: [],
        },
        selectedSeats: bookingSession.seatReservation?.seats || [],
        // Structure needed for ReviewStep compatibility
        fromLocation: bookingSession.searchParams.from,
        toLocation: bookingSession.searchParams.to,
        date: bookingSession.searchParams.date,
        time: "", // We don't have this from the session
        adults: bookingSession.searchParams.adults,
        children: bookingSession.searchParams.children,
        passengers: {
          adults: bookingSession.searchParams.adults,
          children: bookingSession.searchParams.children,
          infants: bookingSession.searchParams.infants,
        },
        totalPrice: bookingSession.totalAmount,
        bookingDate: bookingSession.createdAt.toISOString(),
      };

      if (isFirstRender.current || !isInitialized) {
        initializeFromFerryBooking(ferryBooking);
        isFirstRender.current = false;
      }
    } else if (bookingType === "mixed") {
      // Mixed activity + ferry checkout (future enhancement)
      // TODO: Implement mixed bookings
      const hasActivities = cart && cart.length > 0;
      const hasFerries = !!bookingSession;

      if (!hasActivities && !hasFerries) {
        router.push("/activities");
        return;
      }

      // For now, handle as activity-only
      if (hasActivities) {
        initializeFromActivityCart(cart);
      }
    } else {
      // Default: Activity-only checkout
      if (!cart || cart.length === 0) {
        router.push("/activities");
        return;
      }

      if (isFirstRender.current || !isInitialized) {
        initializeFromActivityCart(cart);
        isFirstRender.current = false;
      } else {
        updateFromActivityCart(cart);
      }
    }
  }, [
    bookingType,
    cart,
    bookingSession,
    initializeFromActivityCart,
    initializeFromFerryBooking,
    updateFromActivityCart,
    router,
    isInitialized,
  ]);

  // Show loading state for different booking types
  const isLoading = () => {
    if (bookingType === "ferry") {
      return !bookingSession || !isInitialized;
    } else if (bookingType === "mixed") {
      return !isInitialized;
    } else {
      return !cart || cart.length === 0 || !isInitialized;
    }
  };

  if (isLoading()) {
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
