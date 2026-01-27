/**
 * WhatsApp Test Endpoint
 * Use this to test WhatsApp messaging configuration
 *
 * Usage:
 * POST /api/test/whatsapp
 * Body: { "phone": "+919876543210" }
 */

import { NextRequest, NextResponse } from "next/server";
import { WhatsAppNotificationChannel } from "@/services/notifications/channels/whatsapp";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 WhatsApp Test Endpoint called");

    // Parse request body
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number is required",
          usage: "Send POST request with { phone: '+919876543210' }",
        },
        { status: 400 }
      );
    }

    console.log("📞 Testing WhatsApp for phone:", phone);

    // Initialize WhatsApp channel
    const whatsappChannel = new WhatsAppNotificationChannel();

    // Check if enabled
    const isEnabled = whatsappChannel.isEnabled();
    console.log("WhatsApp enabled status:", isEnabled);

    if (!isEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: "WhatsApp service is not enabled",
          configuration: {
            hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
            hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
            twilioNumber: process.env.TWILIO_WHATSAPP_NUMBER || "Not set",
            sandboxNumber: process.env.TWILIO_WHATSAPP_SANDBOX || "Not set",
            nodeEnv: process.env.NODE_ENV,
          },
          help: "Check your .env file for TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER (or TWILIO_WHATSAPP_SANDBOX for testing)",
        },
        { status: 500 }
      );
    }

    // Send test message
    console.log("📤 Sending test message...");
    const result = await whatsappChannel.send({
      type: "test",
      recipient: phone,
      data: {
        message: "Test message from Andaman Excursion",
      },
    });

    console.log("📬 WhatsApp send result:", result);

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: "WhatsApp test message sent successfully!",
          messageSid: result.messageId,
          details: result.metadata,
          note: "Check the phone number for the message. If using sandbox, make sure the number has joined the sandbox first.",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Unknown error",
          troubleshooting: {
            commonIssues: [
              "Phone number not in sandbox (for development)",
              "Invalid phone number format (must be +91XXXXXXXXXX)",
              "Twilio account in trial mode - recipient not verified",
              "WhatsApp Business API not enabled",
            ],
            sandbox: {
              instructions: "Send 'join <your-sandbox-keyword>' to the Twilio sandbox number to opt-in",
              sandboxNumber: process.env.TWILIO_WHATSAPP_SANDBOX || "+14155238886",
            },
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ WhatsApp test endpoint error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const whatsappChannel = new WhatsAppNotificationChannel();
  const isEnabled = whatsappChannel.isEnabled();

  return NextResponse.json(
    {
      service: "WhatsApp Test Endpoint",
      enabled: isEnabled,
      configuration: {
        hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
        hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_WHATSAPP_SANDBOX || "Not configured",
        nodeEnv: process.env.NODE_ENV,
        templateSids: {
          bookingConfirmation: !!process.env.TWILIO_BOOKING_CONFIRMATION_SID,
          statusUpdate: !!process.env.TWILIO_STATUS_UPDATE_SID,
          reminder: !!process.env.TWILIO_REMINDER_SID,
          paymentFailed: !!process.env.TWILIO_PAYMENT_FAILED_SID,
          enquiryConfirmation: !!process.env.TWILIO_ENQUIRY_CONFIRMATION_SID,
        },
      },
      usage: {
        method: "POST",
        endpoint: "/api/test/whatsapp",
        body: {
          phone: "+919876543210",
        },
        note: "For sandbox testing, users must first join by sending 'join <keyword>' to the Twilio WhatsApp sandbox number",
      },
      sandboxSetup: {
        step1: "Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message",
        step2: `Send 'join <your-sandbox-keyword>' from your phone to ${process.env.TWILIO_WHATSAPP_SANDBOX || "+14155238886"}`,
        step3: "Wait for confirmation message",
        step4: "Then test using this endpoint",
      },
    },
    { status: 200 }
  );
}
