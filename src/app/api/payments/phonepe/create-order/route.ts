// src/app/api/payments/phonepe/create-order/route.ts
// PhonePe Payment Order Creation - Checkout API v2

import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { phonePeServiceV2 } from "@/services/payments/phonePeServiceV2";

export async function POST(req: NextRequest) {
  try {
    const { amount, bookingData } = await req.json();

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!bookingData) {
      return NextResponse.json(
        { success: false, error: "Booking data is required" },
        { status: 400 }
      );
    }

    // Generate unique merchant order ID
    const merchantOrderId = phonePeServiceV2.generateMerchantOrderId();

    // Build URLs for PhonePe redirect
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    
    // PhonePe v2: User returns to this URL after payment
    // CRITICAL: Include merchantOrderId in URL since PhonePe v2 doesn't append it automatically
    const redirectUrl = `${baseUrl}/checkout/payment-return?merchantOrderId=${merchantOrderId}`;
    
    console.log("PhonePe v2 URLs configured:", { baseUrl, redirectUrl });

    console.log("Creating PhonePe v2 payment order:", {
      merchantOrderId,
      amount: amount,
      bookingType: bookingData.bookingType,
    });

    // Prepare metadata for PhonePe
    const metaInfo: Record<string, string> = {
      udf1: bookingData.bookingType || "booking",
      udf2: bookingData.contactDetails?.primaryName || "",
      udf3: bookingData.contactDetails?.email || "",
    };

    // Add booking-specific metadata
    if (bookingData.items && bookingData.items.length > 0) {
      const firstItem = bookingData.items[0];
      metaInfo.udf4 = firstItem.title || "";
      metaInfo.udf5 = firstItem.date || "";
    }

    // Initiate payment with PhonePe v2 API
    const paymentResult = await phonePeServiceV2.initiatePayment({
      amount: amount,
      merchantOrderId: merchantOrderId,
      redirectUrl: redirectUrl,
      metaInfo: metaInfo,
    });

    if (!paymentResult.success || !paymentResult.redirectUrl) {
      throw new Error("Failed to get redirect URL from PhonePe v2");
    }

    // Create initial payment record in Payload CMS
    const payload = await getPayload({ config });

    await payload.create({
      collection: "payments",
      data: {
        transactionId: merchantOrderId,
        gateway: "phonepe",
        phonepeData: {
          merchantOrderId: merchantOrderId,
          phonepeTransactionId: paymentResult.orderId, // PhonePe's internal order ID (v2)
          redirectUrl: redirectUrl,
          checkoutUrl: paymentResult.redirectUrl, // v2 calls it redirectUrl
        },
        amount: Math.round(amount * 100),
        status: "pending",
        customerDetails: {
          name: bookingData.contactDetails?.primaryName || "",
          email: bookingData.contactDetails?.email || "",
          phone: bookingData.contactDetails?.whatsapp || "",
        },
        bookingData: bookingData,
        gatewayResponse: {
          provider: "phonepe-v2",
          state: paymentResult.state,
          orderId: paymentResult.orderId,
        },
      },
    });

    console.log("PhonePe v2 payment order created successfully:", {
      merchantOrderId,
      phonePeOrderId: paymentResult.orderId,
      hasRedirectUrl: !!paymentResult.redirectUrl,
    });

    return NextResponse.json({
      success: true,
      merchantOrderId: merchantOrderId, // Our order ID
      orderId: paymentResult.orderId, // PhonePe's order ID
      redirectUrl: paymentResult.redirectUrl, // URL to redirect user to
      amount: amount,
      state: paymentResult.state,
    });
  } catch (error: any) {
    console.error("PhonePe order creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Payment initiation failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
