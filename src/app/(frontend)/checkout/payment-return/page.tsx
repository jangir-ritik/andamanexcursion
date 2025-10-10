"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCheckoutStore } from "@/store/CheckoutStore";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import styles from "./page.module.css";

export default function PhonePeReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setBookingConfirmation, setCurrentStep } = useCheckoutStore();
  const [status, setStatus] = useState<
    "checking" | "success" | "failed" | "pending"
  >("checking");
  const [message, setMessage] = useState("Verifying your payment...");
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 10; // Check for up to 20 seconds (10 * 2 seconds)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const checkPaymentStatus = async () => {
      try {
        // Get transaction ID from URL params (passed by redirect handler)
        const merchantTransactionId = searchParams.get("merchantTransactionId") || 
          sessionStorage.getItem("phonepe_transaction_id"); // Fallback to session storage

        if (!merchantTransactionId) {
          setStatus("failed");
          setMessage(
            "Transaction ID not found. Please contact support if payment was deducted."
          );
          return;
        }

        console.log(
          "Checking PhonePe payment status:",
          merchantTransactionId,
          `(Attempt ${retryCount + 1}/${MAX_RETRIES})`
        );

        // Check payment status with backend
        const response = await fetch(
          `/api/payments/phonepe/status?merchantTransactionId=${merchantTransactionId}`
        );

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.statusText}`);
        }

        const result = await response.json();

        console.log("PhonePe status check result:", result);
        console.log("Booking data structure:", {
          hasBooking: !!result.booking,
          bookingId: result.booking?.id,
          bookedFerries: result.booking?.bookedFerries?.length,
          bookedActivities: result.booking?.bookedActivities?.length,
          bookedBoats: result.booking?.bookedBoats?.length,
          passengers: result.booking?.passengers?.length,
        });
        
        // Log the ACTUAL activity data received
        if (result.booking?.bookedActivities?.length > 0) {
          console.log("ACTUAL bookedActivities data from API:", JSON.stringify(result.booking.bookedActivities, null, 2));
        }
        if (result.booking?.bookedFerries?.length > 0) {
          console.log("ACTUAL bookedFerries data from API:", JSON.stringify(result.booking.bookedFerries, null, 2));
        }

        // Handle different status scenarios
        if (result.success && result.status === "COMPLETED") {
          // Payment successful
          setStatus("success");
          setMessage("Payment successful! Redirecting to confirmation...");

          // Set booking confirmation in store with FULL booking data
          if (result.booking) {
            console.log("Setting booking confirmation:", {
              bookingId: result.booking.id,
              confirmationNumber: result.booking.confirmationNumber,
              hasProviderBooking: !!result.providerBooking,
              hasFullData: true,
            });
            
            setBookingConfirmation({
              bookingId: result.booking.id,
              confirmationNumber: result.booking.confirmationNumber || result.booking.id,
              bookingDate: result.booking.createdAt || new Date().toISOString(),
              status: result.booking.status || "confirmed",
              paymentStatus: "paid",
              successMessage: result.message,
              providerBooking: result.providerBooking,
              fullBookingData: result.booking, // Store ENTIRE booking object
            });
            
            console.log("Stored full booking data:", {
              bookedFerries: result.booking.bookedFerries?.length,
              bookedActivities: result.booking.bookedActivities?.length,
              passengers: result.booking.passengers?.length,
            });
          }

          // Clean up session storage
          sessionStorage.removeItem("phonepe_transaction_id");
          sessionStorage.removeItem("phonepe_booking_data");

          // Redirect to confirmation step
          setTimeout(() => {
            router.push("/checkout?step=3");
          }, 2000);
        } else if (result.status === "FAILED") {
          // Payment failed
          setStatus("failed");
          setMessage(
            result.message || "Payment failed. Please try again or contact support."
          );

          // Clean up session storage
          sessionStorage.removeItem("phonepe_transaction_id");
          sessionStorage.removeItem("phonepe_booking_data");

          // Redirect back to checkout after delay
          setTimeout(() => {
            router.push("/checkout?step=2");
          }, 5000);
        } else if (result.status === "PENDING" || result.status === "pending") {
          // Still processing - retry if not exceeded max attempts
          if (retryCount < MAX_RETRIES) {
            setMessage(
              `Payment is processing... (${retryCount + 1}/${MAX_RETRIES})`
            );
            setRetryCount((prev) => prev + 1);
            timeoutId = setTimeout(checkPaymentStatus, 2000); // Retry after 2 seconds
          } else {
            // Max retries exceeded
            setStatus("pending");
            setMessage(
              "Payment verification is taking longer than expected. You will receive confirmation via email shortly."
            );

            // Redirect after extended delay
            setTimeout(() => {
              router.push("/checkout");
            }, 10000);
          }
        } else {
          // Unknown status
          setStatus("pending");
          setMessage(
            "Payment status unknown. Please check your email for confirmation or contact support."
          );
        }
      } catch (error: any) {
        console.error("Payment status check error:", error);

        if (retryCount < MAX_RETRIES) {
          // Retry on network errors
          setMessage(
            `Connection issue. Retrying... (${retryCount + 1}/${MAX_RETRIES})`
          );
          setRetryCount((prev) => prev + 1);
          timeoutId = setTimeout(checkPaymentStatus, 2000);
        } else {
          setStatus("failed");
          setMessage(
            "Unable to verify payment status. Please check your email or contact support."
          );
        }
      }
    };

    // Start status checking
    checkPaymentStatus();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [retryCount, router, searchParams, setBookingConfirmation, setCurrentStep]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === "checking" && (
          <>
            <Loader2 className={styles.iconSpinning} size={64} />
            <h1 className={styles.title}>Verifying Payment</h1>
            <p className={styles.message}>{message}</p>
            <p className={styles.subMessage}>Please do not close this window</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className={styles.iconSuccess} size={64} />
            <h1 className={styles.title}>Payment Successful!</h1>
            <p className={styles.message}>{message}</p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className={styles.iconError} size={64} />
            <h1 className={styles.title}>Payment Failed</h1>
            <p className={styles.message}>{message}</p>
            <button
              className={styles.button}
              onClick={() => router.push("/checkout?step=2")}
            >
              Return to Checkout
            </button>
          </>
        )}

        {status === "pending" && (
          <>
            <Clock className={styles.iconPending} size={64} />
            <h1 className={styles.title}>Payment Processing</h1>
            <p className={styles.message}>{message}</p>
            <button
              className={styles.button}
              onClick={() => router.push("/checkout")}
            >
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}
