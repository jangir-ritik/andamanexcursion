"use client";

import React from "react";
import { Button } from "@/components/atoms/Button/Button";
import { useSimpleCheckoutStore } from "@/store/SimpleCheckoutStore";
import { CheckoutAdapter } from "@/utils/CheckoutAdapter";
import type {
  UnifiedBookingData,
  PassengerRequirements,
} from "@/utils/CheckoutAdapter";
import styles from "./SimpleReviewStep.module.css";

interface SimpleReviewStepProps {
  bookingData: UnifiedBookingData;
  requirements: PassengerRequirements;
}

export const SimpleReviewStep: React.FC<SimpleReviewStepProps> = ({
  bookingData,
  requirements,
}) => {
  const {
    formData,
    prevStep,
    setCurrentStep,
    setLoading,
    setError,
    setBookingConfirmation,
    isLoading,
  } = useSimpleCheckoutStore();

  // Handle payment submission
  const handleProceedToPayment = async () => {
    if (!formData) {
      setError("Form data not found");
      return;
    }

    try {
      setLoading(true);
      setError(""); // Clear any previous errors

      // Prepare payment data using the adapter
      const paymentData = CheckoutAdapter.preparePaymentData(
        bookingData,
        formData
      );

      console.log("Proceeding to payment with data:", paymentData);

      // Step 1: Create Razorpay order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentData.totalPrice,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          bookingData: paymentData,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.error || "Failed to create payment order");
      }

      // Step 2: Load Razorpay SDK dynamically
      if (typeof window === "undefined") {
        throw new Error("Payment can only be processed in browser");
      }

      // Load Razorpay SDK if not already loaded
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Failed to load Razorpay SDK"));
          document.head.appendChild(script);
        });
      }

      const razorpay = (window as any).Razorpay;

      // Step 3: Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderResult.order.amount,
        currency: orderResult.order.currency,
        name: "Andaman Excursion",
        description: `${
          bookingData?.items?.[0]?.type === "ferry" ? "Ferry" : "Activity"
        } Booking`,
        order_id: orderResult.order.id,
        prefill: {
          name: formData?.members?.[0]?.fullName || "",
          email: formData?.members?.[0]?.email || "",
          contact: formData?.members?.[0]?.whatsappNumber || "",
        },
        theme: {
          color: "#3399cc",
        },
        handler: async (response: any) => {
          try {
            // Step 4: Verify payment
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingData: paymentData,
                sessionId: (bookingData as any).sessionId,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const result = await verifyResponse.json();

            if (!result.success) {
              throw new Error(result.error || "Payment verification failed");
            }

            // Payment successful - set booking confirmation
            setBookingConfirmation({
              bookingId: result.booking.bookingId,
              confirmationNumber: result.booking.confirmationNumber,
              bookingDate: new Date().toISOString(),
              status: "confirmed",
              paymentStatus: "paid",
            });
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            setError(
              verifyError instanceof Error
                ? verifyError.message
                : "Payment verification failed"
            );
          }
        },
        modal: {
          ondismiss: () => {
            setError("Payment was cancelled");
          },
        },
      };

      // Step 5: Open Razorpay payment modal
      const razorpayInstance = new razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Payment error:", error);
      setError(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className={styles.errorState}>
        <h3>Form data not found</h3>
        <Button onClick={() => setCurrentStep(1)}>Go to Step 1</Button>
      </div>
    );
  }

  return (
    <div className={styles.reviewStep}>
      <div className={styles.header}>
        <h2>Review Your Booking</h2>
        <p>Please review all details before proceeding to payment</p>
      </div>

      {/* Booking Summary */}
      <div className={styles.bookingSummary}>
        <h3>Booking Summary</h3>
        <div className={styles.bookingItems}>
          {bookingData.items.map((item, index) => (
            <div key={item.id} className={styles.bookingItem}>
              <div className={styles.itemIcon}>
                {item.type === "ferry" ? "🚢" : "🎯"}
              </div>
              <div className={styles.itemDetails}>
                <h4>{item.title}</h4>
                <div className={styles.itemMeta}>
                  <span>📅 {item.date}</span>
                  {item.time && <span>🕐 {item.time}</span>}
                  {item.location && <span>📍 {item.location}</span>}
                  {/* Ferry-specific details */}
                  {item.type === "ferry" && item.ferry?.selectedClass && (
                    <span>
                      🎫{" "}
                      {item.ferry.selectedClass.className ||
                        item.ferry.selectedClass.name}
                    </span>
                  )}
                  {item.type === "ferry" &&
                    item.ferry?.selectedSeats &&
                    item.ferry.selectedSeats.length > 0 && (
                      <span>
                        🪑 Seats: {item.ferry.selectedSeats.join(", ")}
                      </span>
                    )}
                </div>
                <div className={styles.passengerInfo}>
                  {item.passengers.adults} adults, {item.passengers.children}{" "}
                  children
                  {item.passengers.infants > 0 &&
                    `, ${item.passengers.infants} infants`}
                </div>
              </div>
              <div className={styles.itemPrice}>
                ₹{item.price.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.totalPrice}>
          <div className={styles.totalRow}>
            <span>Total Amount</span>
            <span>₹{bookingData.totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Passenger Details */}
      <div className={styles.passengerDetails}>
        <h3>Passenger Details</h3>
        <div className={styles.passengerList}>
          {formData.members.map((member, index) => (
            <div key={member.id} className={styles.passengerCard}>
              <div className={styles.passengerHeader}>
                <h4>
                  {member.isPrimary
                    ? "Primary Contact"
                    : `Passenger ${index + 1}`}
                </h4>
                <span className={styles.passengerAge}>Age {member.age}</span>
              </div>
              <div className={styles.passengerInfo}>
                <div className={styles.passengerRow}>
                  <span>Name:</span>
                  <span>{member.fullName}</span>
                </div>
                <div className={styles.passengerRow}>
                  <span>Gender:</span>
                  <span>{member.gender}</span>
                </div>
                <div className={styles.passengerRow}>
                  <span>Nationality:</span>
                  <span>{member.nationality}</span>
                </div>
                <div className={styles.passengerRow}>
                  <span>Passport:</span>
                  <span>{member.passportNumber}</span>
                </div>
                {member.isPrimary && (
                  <>
                    <div className={styles.passengerRow}>
                      <span>WhatsApp:</span>
                      <span>{member.whatsappNumber}</span>
                    </div>
                    <div className={styles.passengerRow}>
                      <span>Email:</span>
                      <span>{member.email}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <Button
          variant="outline"
          onClick={prevStep}
          className={styles.backButton}
          disabled={isLoading}
        >
          Back to Details
        </Button>
        <Button
          variant="primary"
          onClick={handleProceedToPayment}
          className={styles.paymentButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className={styles.loader}></span>
              Processing Payment...
            </>
          ) : (
            `Proceed to Payment - ₹${bookingData.totalPrice.toLocaleString()}`
          )}
        </Button>
      </div>

      {/* Terms Notice */}
      <div className={styles.termsNotice}>
        <p>
          By proceeding to payment, you confirm that you have read and agree to
          our{" "}
          <a href="/terms" target="_blank">
            Terms and Conditions
          </a>{" "}
          and{" "}
          <a href="/privacy" target="_blank">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};
