// src/app/api/payments/phonepe/create-order/route.ts
// PhonePe Payment Order Creation - Standard Checkout Flow

import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { phonePeService } from "@/services/payments/phonePeService";

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

    // Generate unique merchant transaction ID
    const merchantTransactionId = phonePeService.generateMerchantTransactionId();
    const merchantUserId = phonePeService.generateMerchantUserId(
      bookingData.contactDetails?.email
    );

    // Build URLs for PhonePe redirect and callback
    // Use proper base URL with fallback chain
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    
    // PhonePe v2 does GET redirects, so point directly to client page
    const redirectUrl = `${baseUrl}/checkout/payment-return`;
    const callbackUrl = `${baseUrl}/api/payments/phonepe/callback`;
    
    console.log("PhonePe URLs configured:", { baseUrl, redirectUrl, callbackUrl });

    console.log("Creating PhonePe payment order:", {
      merchantTransactionId,
      amount: amount,
      bookingType: bookingData.bookingType,
    });

    // Initiate payment with PhonePe
    const paymentResult = await phonePeService.initiatePayment({
      amount: amount,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: merchantUserId,
      redirectUrl: redirectUrl,
      callbackUrl: callbackUrl,
      mobileNumber: bookingData.contactDetails?.whatsapp?.replace(/[^0-9]/g, ""),
    });

    if (!paymentResult.success || !paymentResult.checkoutUrl) {
      throw new Error("Failed to get checkout URL from PhonePe");
    }

    // Create initial payment record in Payload CMS
    const payload = await getPayload({ config });

    await payload.create({
      collection: "payments",
      data: {
        transactionId: merchantTransactionId,
        gateway: "phonepe",
        phonepeData: {
          merchantOrderId: merchantTransactionId,
          redirectUrl: redirectUrl,
          checkoutUrl: paymentResult.checkoutUrl,
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
          provider: "phonepe",
          code: paymentResult.code,
          message: paymentResult.message,
        },
      },
    });

    console.log("PhonePe payment order created successfully:", {
      merchantTransactionId,
      hasCheckoutUrl: !!paymentResult.checkoutUrl,
    });

    return NextResponse.json({
      success: true,
      merchantTransactionId: merchantTransactionId,
      checkoutUrl: paymentResult.checkoutUrl,
      amount: amount,
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
