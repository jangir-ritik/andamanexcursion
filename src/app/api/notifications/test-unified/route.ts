/**
 * API endpoint to test the new unified notification system
 */

import { NextRequest, NextResponse } from "next/server";
import { notificationManager } from "@/services/notifications/NotificationManager";
import { NotificationService } from "@/services/notifications/notificationService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type = "test",
      testEmail = process.env.TEST_EMAIL || "test@andamanexcursion.com",
      testPhone = process.env.TEST_PHONE || "+91XXXXXXXXXX",
      testType = "channels", // "channels" | "legacy" | "both"
    } = body;

    const results: any = {
      timestamp: new Date().toISOString(),
      testType,
      success: true,
      errors: [],
    };

    // Test unified notification manager directly
    if (testType === "channels" || testType === "both") {
      console.log("Testing unified NotificationManager...");

      try {
        const channelResults = await notificationManager.testAllChannels();
        results.unifiedSystem = {
          channelStatus: notificationManager.getChannelStatus(),
          testResults: channelResults,
        };

        // Test a notification send
        const testNotification = await notificationManager.sendNotification({
          type: "test",
          recipients: {
            email: testEmail,
            phone: testPhone,
          },
          data: {
            message: "Testing unified notification system",
            timestamp: new Date().toISOString(),
          },
          preferences: {
            sendEmailUpdates: true,
            sendWhatsAppUpdates: true,
            language: "en",
          },
        });

        results.unifiedSystem.notificationTest = testNotification;
      } catch (error) {
        console.error("Unified system test error:", error);
        results.errors.push(
          `Unified system: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    // Test legacy notification service
    if (testType === "legacy" || testType === "both") {
      console.log("Testing legacy NotificationService...");

      try {
        const legacyResults = await NotificationService.testAllChannels();
        const emailTest = await NotificationService.testEmailConfiguration();

        results.legacySystem = {
          channelStatus: NotificationService.getChannelStatus(),
          allChannelsTest: legacyResults,
          emailTest: emailTest,
        };
      } catch (error) {
        console.error("Legacy system test error:", error);
        results.errors.push(
          `Legacy system: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    // Test specific notification type
    if (type === "booking-confirmation") {
      const mockBookingData = {
        bookingId: "test-booking-123",
        confirmationNumber: "TEST-CONF-456",
        customerName: "Test Customer",
        customerEmail: testEmail,
        bookingDate: new Date().toISOString(),
        serviceDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        totalAmount: 5000,
        currency: "INR",
        bookingType: "activity" as const,
        items: [
          {
            title: "Test Scuba Diving",
            date: new Date().toLocaleDateString(),
            time: "10:00 AM",
            location: "Havelock Island",
            passengers: 2,
          },
        ],
        passengers: [
          {
            fullName: "Test Customer",
            age: 30,
            gender: "Male",
          },
        ],
        contactPhone: testPhone,
      };

      try {
        const bookingResult = await notificationManager.sendBookingConfirmation(
          mockBookingData,
          { email: testEmail, phone: testPhone },
          { sendEmailUpdates: true, sendWhatsAppUpdates: true, language: "en" }
        );

        results.bookingConfirmationTest = bookingResult;
      } catch (error) {
        console.error("Booking confirmation test error:", error);
        results.errors.push(
          `Booking confirmation: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    // Determine overall success
    results.success = results.errors.length === 0;

    return NextResponse.json(results, {
      status: results.success ? 200 : 207, // Multi-status for partial success
    });
  } catch (error) {
    console.error("Test API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const channelStatus = notificationManager.getChannelStatus();

    return NextResponse.json({
      success: true,
      system: "Unified Notification System",
      version: "2.0.0",
      channels: channelStatus,
      availableTests: [
        "GET /api/notifications/test-unified - System status",
        "POST /api/notifications/test-unified - Test channels",
        "POST /api/notifications/test-unified { testType: 'channels' } - Test unified system only",
        "POST /api/notifications/test-unified { testType: 'legacy' } - Test legacy system only",
        "POST /api/notifications/test-unified { testType: 'both' } - Test both systems",
        "POST /api/notifications/test-unified { type: 'booking-confirmation' } - Test booking notification",
      ],
      environment: {
        resendConfigured: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.FROM_EMAIL || "not configured",
        testEmail: process.env.TEST_EMAIL || "not configured",
        testPhone: process.env.TEST_PHONE || "not configured",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
