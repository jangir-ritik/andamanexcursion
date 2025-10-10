// ⚠️ DEPRECATED: This route is a duplicate of create-order
// Use /api/payments/phonepe/create-order instead
//
// This file incorrectly uses pg-sdk-node SDK.
// The correct implementation is in /api/payments/phonepe/create-order/route.ts
//
// DO NOT USE THIS ROUTE

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      error: "This route is deprecated. Use /api/payments/phonepe/create-order instead",
      correctRoute: "/api/payments/phonepe/create-order",
    },
    { status: 410 } // 410 Gone
  );
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error: "This route is deprecated. Use /api/payments/phonepe/create-order instead",
      correctRoute: "/api/payments/phonepe/create-order",
    },
    { status: 410 }
  );
}

// Old implementation below (kept for reference only)
/*
export async function GET_OLD(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const txnId = searchParams.get("txnId");

    if (!txnId) {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    console.log("Checking payment status for:", txnId);

    // Get PhonePe client
    const client = getPhonePeClient();

    // Check status using SDK
    const statusResult = await client.checkStatus(txnId);

    if (!statusResult.success) {
      return NextResponse.json({
        success: false,
        status: "FAILED",
        message: statusResult.message || "Payment status check failed",
        transactionId: txnId,
      });
    }

    // Map PhonePe status codes to Andaman Excursion application statuses
    const { code, data } = statusResult;
    let appStatus: string;

    switch (code) {
      case "PAYMENT_SUCCESS":
        appStatus = "SUCCESS";
        break;
      case "PAYMENT_PENDING":
        appStatus = "PENDING";
        break;
      case "PAYMENT_DECLINED":
      case "PAYMENT_ERROR":
      case "TRANSACTION_NOT_FOUND":
        appStatus = "FAILED";
        break;
      default:
        appStatus = "UNKNOWN";
    }

    console.log("Payment status result:", {
      transactionId: txnId,
      phonePeStatus: code,
      appStatus: appStatus,
    });

    return NextResponse.json({
      success: statusResult.success,
      status: appStatus,
      code: code,
      transactionId: txnId,
      phonePeTransactionId: data?.transactionId,
      amount: data?.amount,
      paymentInstrument: data?.paymentInstrument,
      message: statusResult.message,
    });
  } catch (error: any) {
    console.error("PhonePe status check error:", error);
    return NextResponse.json(
      {
        success: false,
        status: "ERROR",
        error: error.message || "Failed to check payment status",
      },
      { status: 500 }
    );
  }
}
*/
