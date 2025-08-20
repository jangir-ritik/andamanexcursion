import { NextRequest, NextResponse } from "next/server";

import { notificationManager } from "@/services/notifications/NotificationManager";
import { NotificationService } from "@/services/notifications/notificationService";

export async function POST(request: NextRequest) {
  try {
    const { type, testEmail, bookingId } = await request.json();

    if (!testEmail && type !== "config") {
      return NextResponse.json(
        { error: "Test email address is required" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "config":
        // Test email configuration
        const channelStatus = notificationManager.getChannelStatus();
        const testResults = await notificationManager.testAllChannels();
        result = {
          success: channelStatus.email?.enabled || false,
          channelStatus,
          testResults,
        };
        break;

      case "booking-confirmation":
        // Test booking confirmation email
        const sampleBookingData = {
          bookingId: "test-123",
          confirmationNumber: "AE-TEST-001",
          customerName: "Test User",
          customerEmail: testEmail,
          bookingDate: new Date().toISOString(),
          serviceDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          totalAmount: 5000,
          currency: "INR",
          bookingType: "mixed" as const,
          items: [
            {
              title: "Scuba Diving at Havelock",
              date: new Date(Date.now() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              time: "10:00 AM",
              location: "Havelock Island",
              passengers: 2,
            },
            {
              title: "Ferry: Port Blair → Havelock",
              date: new Date(Date.now() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              time: "08:00 AM",
              location: "Port Blair → Havelock",
              passengers: 2,
            },
          ],
          passengers: [
            { fullName: "Test User", age: 30, gender: "Male" },
            { fullName: "Jane Doe", age: 28, gender: "Female" },
          ],
          specialRequests: "Please arrange vegetarian meals",
          contactPhone: "+91-9876543210",
        };

        const bookingResult = await notificationManager.sendBookingConfirmation(
          sampleBookingData,
          { email: testEmail },
          { sendEmailUpdates: true, sendWhatsAppUpdates: false, language: "en" }
        );

        result = {
          success: bookingResult.email?.success || false,
          error: bookingResult.email?.error,
          messageId: bookingResult.email?.messageId,
        };
        break;

      case "status-update":
        // Test booking status update email
        const sampleStatusUpdate = {
          bookingId: "test-123",
          confirmationNumber: "AE-TEST-001",
          customerName: "Test User",
          customerEmail: testEmail,
          oldStatus: "pending",
          newStatus: "confirmed",
          message: "Your payment has been processed successfully!",
          updateDate: new Date().toISOString(),
        };

        const statusResult = await notificationManager.sendBookingStatusUpdate(
          sampleStatusUpdate,
          { email: testEmail },
          { sendEmailUpdates: true, sendWhatsAppUpdates: false, language: "en" }
        );

        result = {
          success: statusResult.email?.success || false,
          error: statusResult.email?.error,
          messageId: statusResult.email?.messageId,
        };

        break;

      case "payment-failed":
        // Test payment failed email
        const paymentData = {
          customerEmail: testEmail,
          customerName: "Test User",
          attemptedAmount: 5000,
          failureReason: "Your bank declined the transaction",
          bookingType: "ferry" as const,
          currency: "INR",
        };
        const paymentResult =
          await notificationManager.sendPaymentFailedNotification(paymentData);

        result = {
          success: paymentResult.email?.success || false,
          error: paymentResult.email?.error,
          messageId: paymentResult.email?.messageId,
        };
        break;

      case "booking-by-id":
        // Test with real booking ID
        if (!bookingId) {
          return NextResponse.json(
            { error: "Booking ID is required for this test type" },
            { status: 400 }
          );
        }

        result = await NotificationService.sendBookingConfirmation(bookingId);
        break;

      default:
        return NextResponse.json(
          {
            error:
              "Invalid test type. Use: config, booking-confirmation, status-update, payment-failed, or booking-by-id",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      result,
      message: `Test email ${type} completed`,
    });
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Email test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Email Notification Test Endpoint",
    usage: {
      method: "POST",
      body: {
        type: "config | booking-confirmation | status-update | payment-failed | booking-by-id",
        testEmail: "test@example.com (required for most types)",
        bookingId: "booking-id (required for booking-by-id type only)",
      },
      examples: [
        {
          type: "config",
          description: "Test email configuration without sending email",
        },
        {
          type: "booking-confirmation",
          testEmail: "test@example.com",
          description: "Send sample booking confirmation email",
        },
        {
          type: "status-update",
          testEmail: "test@example.com",
          description: "Send sample status update email",
        },
        {
          type: "payment-failed",
          testEmail: "test@example.com",
          description: "Send sample payment failed email",
        },
        {
          type: "booking-by-id",
          testEmail: "test@example.com",
          bookingId: "actual-booking-id",
          description: "Send confirmation email using real booking data",
        },
      ],
    },
  });
}
