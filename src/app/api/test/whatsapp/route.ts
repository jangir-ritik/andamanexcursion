// app/api/test/whatsapp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { WhatsAppNotificationChannel } from "@/services/notifications/channels/whatsapp";

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
    endpoints: {
      test: {
        method: "POST",
        url: "/api/test/whatsapp",
        body: {
          phone: "+918600713587",
          template: "hello | enquiry | booking_confirmation | payment_failed | reminder | status_update"
        }
      }
    },
    webhook: "/api/webhooks/plivo/whatsapp",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, template = "enquiry" } = body;

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number is required",
          example: { phone: "+918600713587", template: "hello" }
        },
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

    let result;

    console.log(`Sending ${template} template to ${phone}`);

    switch (template) {
      case "hello":
        result = await whatsapp.sendHelloWorld(phone);
        break;

      case "enquiry":
        result = await whatsapp.send({
          type: "enquiry_confirmation",
          recipient: phone,
          data: {
            fullName: "Test User",
            enquiryId: "ENQ" + Date.now().toString().slice(-6),
            email: "test@example.com",
            phone: phone,
            selectedPackage: "Island Tour Package - Premium",
            message: "Test enquiry message",
            submissionDate: new Date().toISOString(),
          },
        });
        break;

      case "booking_confirmation":
        result = await whatsapp.send({
          type: "booking_confirmation",
          recipient: phone,
          data: {
            customerName: "Test User",
            confirmationNumber: "BK" + Date.now().toString().slice(-8),
            bookingType: "ferry",
            bookingDate: new Date().toISOString(),
            totalAmount: 4500,
            items: [{
              location: "Port Blair → Havelock Island",
              date: new Date().toISOString(),
              time: "08:30 AM",
              passengers: 2
            }]
          },
        });
        break;

      case "payment_failed":
        result = await whatsapp.send({
          type: "payment_failed",
          recipient: phone,
          data: {
            customerName: "Test User",
            attemptedAmount: 4500,
            failureReason: "Insufficient funds",
            bookingId: "BK" + Date.now().toString().slice(-8),
            paymentMethod: "Credit Card"
          },
        });
        break;

      case "reminder":
        result = await whatsapp.send({
          type: "booking_reminder",
          recipient: phone,
          data: {
            customerName: "Test User",
            confirmationNumber: "BK" + Date.now().toString().slice(-8),
            updateDate: new Date().toISOString(),
            oldStatus: "confirmed",
            newStatus: "reminder"
          },
        });
        break;

      case "status_update":
        result = await whatsapp.send({
          type: "booking_status_update",
          recipient: phone,
          data: {
            customerName: "Test User",
            confirmationNumber: "BK" + Date.now().toString().slice(-8),
            oldStatus: "Confirmed",
            newStatus: "Completed",
            updateDate: new Date().toISOString(),
            message: "Your trip has been completed. Thank you for sailing with us!"
          },
        });
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid template. Use: hello, enquiry, booking_confirmation, payment_failed, reminder, status_update"
          },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${template} template sent successfully!`,
        messageUuid: result.messageId,
        template: template,
        details: result.metadata,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: result.error,
        template: template
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}