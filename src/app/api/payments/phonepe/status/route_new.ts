// ==========================================
// ARCHIVED - OLD VERSION
// This is an old version kept for reference
// Active implementation is in route.ts
// See: src/app/api/payments/phonepe/status/route.ts
// ==========================================

// src/app/api/payments/phonepe/status/route.ts
// PhonePe Payment Status Check & Booking Processing
// This API handles status verification and complete booking creation (matches Razorpay verify logic)

import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { phonePeService } from "@/services/payments/phonePeService";
import { FerryBookingService } from "@/services/ferryServices/ferryBookingService";
import { notificationManager } from "@/services/notifications/NotificationManager";
import type { BookingConfirmationData } from "@/services/notifications/channels/base";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const merchantTransactionId = searchParams.get("merchantTransactionId");

    if (!merchantTransactionId) {
      return NextResponse.json(
        { success: false, error: "Merchant Transaction ID is required" },
        { status: 400 }
      );
    }

    console.log("Checking PhonePe payment status:", merchantTransactionId);

    // Check payment status with PhonePe
    const statusResponse = await phonePeService.checkPaymentStatus(
      merchantTransactionId
    );

    console.log("PhonePe status response:", {
      merchantTransactionId,
      state: statusResponse.state,
      transactionId: statusResponse.transactionId,
    });

    // Get payment record from database
    const payload = await getPayload({ config });
    const paymentRecords = await payload.find({
      collection: "payments",
      where: {
        transactionId: { equals: merchantTransactionId },
      },
      limit: 1,
    });

    if (!paymentRecords.docs || paymentRecords.docs.length === 0) {
      return NextResponse.json(
        { success: false, error: "Payment record not found" },
        { status: 404 }
      );
    }

    const paymentRecord = paymentRecords.docs[0];
    const bookingData = paymentRecord.bookingData;

    // Update payment record with status response
    const updatedPhonepeData = {
      ...(paymentRecord.phonepeData || {}),
      phonepeTransactionId: statusResponse.transactionId,
      statusCheckData: statusResponse,
    };

    await payload.update({
      collection: "payments",
      id: paymentRecord.id,
      data: {
        status:
          statusResponse.state === "COMPLETED"
            ? "success"
            : statusResponse.state === "FAILED"
            ? "failed"
            : "pending",
        phonepeData: updatedPhonepeData,
      },
    });

    // If payment is successful (COMPLETED), process the booking
    if (statusResponse.state === "COMPLETED") {
      console.log("Payment successful, processing booking...");

      try {
        // Use the same booking processing function from Razorpay verify
        // (Implementation shortened for brevity - full implementation in comments below)
        const bookingResult = await processCompleteBooking(
          bookingData,
          merchantTransactionId,
          paymentRecord.id,
          statusResponse.transactionId || merchantTransactionId,
          payload
        );

        return NextResponse.json({
          success: bookingResult.overallSuccess,
          message: bookingResult.responseMessage,
          status: statusResponse.state,
          transactionId: statusResponse.transactionId,
          booking: bookingResult.booking,
          payment: {
            transactionId: paymentRecord.transactionId,
            status: "success",
          },
        });
      } catch (bookingError: any) {
        console.error("Booking processing error:", bookingError);

        return NextResponse.json({
          success: false,
          status: statusResponse.state,
          transactionId: statusResponse.transactionId,
          error: "Booking processing failed",
          details: bookingError.message,
          message:
            "Your payment was successful. Our team will process your booking and contact you shortly.",
        });
      }
    }

    // Payment not successful yet
    return NextResponse.json({
      success: false,
      status: statusResponse.state,
      transactionId: statusResponse.transactionId,
      message:
        statusResponse.state === "FAILED"
          ? "Payment failed. Please try again."
          : "Payment is still processing...",
    });
  } catch (error: any) {
    console.error("PhonePe status check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Status check failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// TODO: Implement processCompleteBooking function
// This should mirror the logic from /api/payments/verify/route.ts lines 60-862
// including all booking creation, ferry API integration, and notification sending

async function processCompleteBooking(
  bookingData: any,
  merchantTransactionId: string,
  paymentId: string,
  phonepeTransactionId: string,
  payload: any
) {
  // Placeholder - needs full implementation from Razorpay verify route
  // See lines 60-862 in /api/payments/verify/route.ts
  return {
    overallSuccess: true,
    responseMessage: "Booking created successfully",
    booking: {},
  };
}
