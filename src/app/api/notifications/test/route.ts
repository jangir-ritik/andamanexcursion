import { NextRequest, NextResponse } from "next/server";

import { notificationManager } from "@/services/notifications/NotificationManager";
import { NotificationService } from "@/services/notifications/notificationService";

export async function POST(request: NextRequest) {
  try {
    const { type, testEmail, testPhone, bookingId } = await request.json();

    if (!testEmail && type !== "config") {
      return NextResponse.json(
        { error: "Test email address is required" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "config":
        // Test both email and WhatsApp configuration
        const channelStatus = notificationManager.getChannelStatus();
        const testResults = await notificationManager.testAllChannels();

        // Debug WhatsApp configuration
        console.log("[Debug] Environment Variables:");
        console.log("- TWILIO_ACCOUNT_SID:", !!process.env.TWILIO_ACCOUNT_SID);
        console.log("- TWILIO_AUTH_TOKEN:", !!process.env.TWILIO_AUTH_TOKEN);
        console.log(
          "- TWILIO_WHATSAPP_NUMBER:",
          process.env.TWILIO_WHATSAPP_NUMBER
        );

        result = {
          success:
            channelStatus.email?.enabled ||
            channelStatus.whatsapp?.enabled ||
            false,
          channelStatus,
          testResults,
          debug: {
            twilioConfigured: !!(
              process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
            ),
            whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
          },
        };
        break;

      case "booking-confirmation":
        // Test booking confirmation email + WhatsApp
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

        // Format phone number properly (add +91 if missing)
        const formattedPhone = testPhone
          ? formatPhoneNumber(testPhone)
          : "+918107664041";

        console.log("[Debug] Recipients:", {
          email: testEmail,
          phone: formattedPhone,
          originalPhone: testPhone,
        });

        const bookingResult = await notificationManager.sendBookingConfirmation(
          sampleBookingData,
          {
            email: testEmail,
            phone: formattedPhone,
          },
          {
            sendEmailUpdates: true,
            sendWhatsAppUpdates: !!testPhone, // Only send WhatsApp if phone provided
            language: "en",
          }
        );

        result = {
          success:
            bookingResult.email?.success ||
            bookingResult.whatsapp?.success ||
            false,
          email: bookingResult.email,
          whatsapp: bookingResult.whatsapp,
          debug: {
            phoneFormatted: formattedPhone,
            whatsappEnabled: !!testPhone,
          },
        };
        break;

      case "status-update":
        // Test booking status update email + WhatsApp
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

        const formattedStatusPhone = testPhone
          ? formatPhoneNumber(testPhone)
          : undefined;

        const statusResult = await notificationManager.sendBookingStatusUpdate(
          sampleStatusUpdate,
          {
            email: testEmail,
            phone: formattedStatusPhone,
          },
          {
            sendEmailUpdates: true,
            sendWhatsAppUpdates: !!testPhone,
            language: "en",
          }
        );

        result = {
          success:
            statusResult.email?.success ||
            statusResult.whatsapp?.success ||
            false,
          email: statusResult.email,
          whatsapp: statusResult.whatsapp,
        };

        break;

      case "payment-failed":
        // Test payment failed email (usually email only)
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
          email: paymentResult.email,
          whatsapp: paymentResult.whatsapp,
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

        console.log("[Debug] Testing with real booking ID:", bookingId);
        result = await NotificationService.sendBookingConfirmation(bookingId);

        // Add debug info about the booking
        try {
          const { getPayload } = await import("payload");
          const config = await import("@/payload.config");
          const payload = await getPayload({ config: config.default });
          const booking = await payload.findByID({
            collection: "bookings",
            id: bookingId,
          });

          console.log(
            "[Debug] Booking phone number:",
            booking.customerInfo?.customerPhone
          );
          console.log(
            "[Debug] Booking preferences:",
            booking.communicationPreferences
          );

          // result.debug = {
          //   originalPhone: booking.customerInfo?.customerPhone,
          //   phoneFormatted: booking.customerInfo?.customerPhone
          //     ? formatPhoneNumber(booking.customerInfo.customerPhone)
          //     : null,
          //   preferences: booking.communicationPreferences,
          // };
        } catch (e) {
          console.error("Could not fetch booking for debug:", e);
        }

        break;

      case "whatsapp-only":
        // Test WhatsApp only
        if (!testPhone) {
          return NextResponse.json(
            { error: "Test phone number is required for WhatsApp test" },
            { status: 400 }
          );
        }

        const whatsappPhone = formatPhoneNumber(testPhone);
        const whatsappChannel = notificationManager.getChannel("whatsapp");

        if (!whatsappChannel) {
          return NextResponse.json(
            { error: "WhatsApp channel not found" },
            { status: 500 }
          );
        }

        console.log("[Debug] Testing WhatsApp with phone:", whatsappPhone);
        console.log(
          "[Debug] WhatsApp channel enabled:",
          whatsappChannel.isEnabled()
        );

        const whatsappTestResult = await whatsappChannel.test?.();

        result = {
          success: whatsappTestResult?.success || false,
          whatsapp: whatsappTestResult,
          debug: {
            phoneFormatted: whatsappPhone,
            channelEnabled: whatsappChannel.isEnabled(),
          },
        };
        break;

      default:
        return NextResponse.json(
          {
            error:
              "Invalid test type. Use: config, booking-confirmation, status-update, payment-failed, booking-by-id, or whatsapp-only",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      result,
      message: `Test ${type} completed`,
    });
  } catch (error) {
    console.error("Notification test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Notification test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to format phone numbers
function formatPhoneNumber(phone: string): string {
  if (!phone) return "";

  // Remove any spaces, dashes, or other formatting
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

  // If it already starts with +91, return as is
  if (cleanPhone.startsWith("+91")) {
    return cleanPhone;
  }

  // If it starts with 91 (without +), add the +
  if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
    return "+" + cleanPhone;
  }

  // If it's a 10-digit Indian number, add +91
  if (cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone)) {
    return "+91" + cleanPhone;
  }

  // If it starts with 0, remove it and add +91 (old Indian format)
  if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
    return "+91" + cleanPhone.substring(1);
  }

  // Return as is if we can't format it
  console.warn("[formatPhoneNumber] Could not format phone:", phone);
  return cleanPhone;
}

export async function GET() {
  return NextResponse.json({
    message: "Notification Test Endpoint",
    usage: {
      method: "POST",
      body: {
        type: "config | booking-confirmation | status-update | payment-failed | booking-by-id | whatsapp-only",
        testEmail: "test@example.com (required for most types)",
        testPhone:
          "+918107664041 or 8107664041 (optional, for WhatsApp testing)",
        bookingId: "booking-id (required for booking-by-id type only)",
      },
      examples: [
        {
          type: "config",
          description: "Test notification configuration for all channels",
        },
        {
          type: "booking-confirmation",
          testEmail: "test@example.com",
          testPhone: "8107664041",
          description:
            "Send sample booking confirmation via email and WhatsApp",
        },
        {
          type: "whatsapp-only",
          testPhone: "8107664041",
          description: "Test WhatsApp channel only",
        },
        {
          type: "booking-by-id",
          testEmail: "test@example.com",
          bookingId: "actual-booking-id",
          description: "Send confirmation using real booking data",
        },
      ],
    },
  });
}
