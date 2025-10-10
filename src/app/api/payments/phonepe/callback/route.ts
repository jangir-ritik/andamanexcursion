// src/app/api/payments/phonepe/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { phonePeService } from "@/services/payments/phonePeService";
import crypto from "crypto";

/**
 * PhonePe Callback Handler
 *
 * This endpoint receives asynchronous notifications from PhonePe
 * about payment status changes. It's a backup mechanism - the main
 * booking processing happens in the status check API after redirect.
 *
 * This handler just updates payment records and logs events.
 */
export async function POST(req: NextRequest) {
  try {
    const responseBody = await req.text();

    console.log("PhonePe callback received:", {
      bodyLength: responseBody.length,
    });

    let bodyData;
    try {
      bodyData = JSON.parse(responseBody);
    } catch (parseError) {
      console.error("Failed to parse callback body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate callback authenticity using X-VERIFY header
    const xVerifyHeader = req.headers.get("X-VERIFY");
    
    if (!xVerifyHeader) {
      console.error("Missing X-VERIFY header in callback");
      return NextResponse.json(
        { error: "Missing X-VERIFY header" },
        { status: 401 }
      );
    }

    // Verify signature
    const saltKey = process.env.PHONEPE_SALT_KEY!;
    const saltIndex = process.env.PHONEPE_SALT_INDEX!;
    
    // PhonePe sends base64 encoded response in the body
    const base64Response = bodyData?.response || responseBody;
    const expectedSignature = crypto
      .createHash("sha256")
      .update(base64Response + "/pg/v1/callback" + saltKey)
      .digest("hex") + "###" + saltIndex;

    if (xVerifyHeader !== expectedSignature) {
      console.error("Invalid PhonePe callback signature");
      return NextResponse.json(
        { error: "Invalid callback signature" },
        { status: 401 }
      );
    }

    console.log("Callback validated successfully:", {
      type: bodyData.type,
      merchantOrderId: bodyData.payload?.merchantOrderId,
    });

    const { merchantOrderId, state, phonepeTransactionId } =
      bodyData.payload || {};

    if (!merchantOrderId) {
      console.error("Callback missing merchant order ID");
      return NextResponse.json(
        { error: "Missing merchant order ID" },
        { status: 400 }
      );
    }

    // Update payment record with callback data
    const payload = await getPayload({ config });

    const paymentRecords = await payload.find({
      collection: "payments",
      where: {
        "phonepeData.merchantOrderId": { equals: merchantOrderId },
      },
      limit: 1,
    });

    if (paymentRecords.docs && paymentRecords.docs.length > 0) {
      const paymentRecord = paymentRecords.docs[0];

      // Update payment record with callback data (must update entire nested object)
      const updatedPhonepeData = {
        ...(paymentRecord.phonepeData || {}),
        phonepeTransactionId: phonepeTransactionId,
        callbackData: JSON.stringify(bodyData),
        callbackReceivedAt: new Date().toISOString(),
      };

      await payload.update({
        collection: "payments",
        id: paymentRecord.id,
        data: {
          status:
            state === "SUCCESS"
              ? "success"
              : state === "FAILED"
              ? "failed"
              : "pending",
          phonepeData: updatedPhonepeData,
        },
      });

      console.log("Payment record updated from callback:", {
        orderId: merchantOrderId,
        status: state,
      });
    } else {
      console.warn("Payment record not found for callback:", merchantOrderId);
    }

    // Process based on callback type
    switch (bodyData.type) {
      case "PAYMENT_SUCCESS":
        console.log("Payment success callback received:", merchantOrderId);
        // Main booking processing happens in status check API
        // This is just for logging/audit trail
        break;

      case "PAYMENT_ERROR":
        console.log("Payment error callback received:", merchantOrderId);
        break;

      case "PAYMENT_PENDING":
        console.log("Payment pending callback received:", merchantOrderId);
        break;

      default:
        console.log("Unknown callback type:", bodyData.type);
    }

    // Always return 200 OK to PhonePe
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("PhonePe callback handling error:", error);

    // Still return 200 to prevent PhonePe from retrying
    // Log the error for manual review
    return NextResponse.json(
      {
        success: false,
        error: "Internal error",
        logged: true,
      },
      { status: 200 }
    );
  }
}
