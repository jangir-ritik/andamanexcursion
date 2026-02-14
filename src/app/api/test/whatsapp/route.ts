/**
 * WhatsApp Test Endpoint (Plivo)
 *
 * GET  /api/test/whatsapp - Check configuration
 * POST /api/test/whatsapp - Send test message using enquiry_confirmation template
 * Body: { "phone": "+919876543210" }
 */

import { NextRequest, NextResponse } from "next/server";
import { WhatsAppNotificationChannel } from "@/services/notifications/channels/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required. Example: { phone: '+919876543210' }" },
        { status: 400 }
      );
    }

    const whatsapp = new WhatsAppNotificationChannel();

    if (!whatsapp.isEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error: "WhatsApp not enabled",
          config: {
            hasAuthId: !!process.env.PLIVO_AUTH_ID,
            hasAuthToken: !!process.env.PLIVO_AUTH_TOKEN,
            fromNumber: process.env.PLIVO_WHATSAPP_NUMBER || "Not set",
          },
        },
        { status: 500 }
      );
    }

    // Send using enquiry_confirmation template as test
    const result = await whatsapp.send({
      type: "enquiry_confirmation",
      recipient: phone,
      data: {
        fullName: "Test User",
        enquiryId: "TEST-001",
        email: "test@example.com",
        phone: phone,
        selectedPackage: "WhatsApp Integration Test",
        message: "Test message",
        submissionDate: new Date().toISOString(),
      },
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test message sent!",
        messageUuid: result.messageId,
        details: result.metadata,
      });
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const whatsapp = new WhatsAppNotificationChannel();

  return NextResponse.json({
    service: "Plivo WhatsApp",
    enabled: whatsapp.isEnabled(),
    config: {
      hasAuthId: !!process.env.PLIVO_AUTH_ID,
      hasAuthToken: !!process.env.PLIVO_AUTH_TOKEN,
      fromNumber: process.env.PLIVO_WHATSAPP_NUMBER || "Not configured",
    },
    webhook: "/api/webhooks/plivo/whatsapp",
    usage: {
      method: "POST",
      body: { phone: "+919876543210" },
    },
  });
}
