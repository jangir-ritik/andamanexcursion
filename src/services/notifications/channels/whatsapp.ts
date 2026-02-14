/**
 * WhatsApp notification channel with Plivo WhatsApp Business API
 * Uses approved templates for all business-initiated messages
 */

import {
  BaseNotificationChannel,
  NotificationPayload,
  NotificationResult,
  BookingConfirmationData,
  BookingStatusUpdateData,
  PaymentFailedData,
  EnquiryData,
} from "./base";

import * as plivo from "plivo";

export class WhatsAppNotificationChannel extends BaseNotificationChannel {
  name = "whatsapp";
  private client: plivo.Client | null = null;

  // Approved Plivo template names
  private readonly templates = {
    booking_confirmation: "copy_booking_conformation_hx3a96db396e8ce0dee85b1c9cb6f7ec18",
    booking_status_update: "status_update_template_hx9e2ef803ef033cc9e572cd096e77a486",
    booking_reminder: "booking_reminder_template_hx34db11f9481cc4192e939b9593ddabfc",
    payment_failed: "payment_failed_template_hxe3ab754a258d9342213a8f0a732fb37d",
    enquiry_confirmation: "enquiry_confirmation_template_hxdef2c5a728890825bd40f13e00da910a",
  };

  constructor() {
    super();

    if (this.isEnabled()) {
      try {
        this.client = new plivo.Client(
          process.env.PLIVO_AUTH_ID!,
          process.env.PLIVO_AUTH_TOKEN!
        );
      } catch (error) {
        console.error("Failed to initialize Plivo client:", error);
        this.client = null;
      }
    }
  }

  private getFromNumber(): string {
    return process.env.PLIVO_WHATSAPP_NUMBER || "";
  }

  isEnabled(): boolean {
    const authId = process.env.PLIVO_AUTH_ID;
    const authToken = process.env.PLIVO_AUTH_TOKEN;
    const fromNumber = this.getFromNumber();

    const enabled = !!(authId && authToken && fromNumber);

    if (!enabled) {
      console.log("WhatsApp is NOT enabled:", {
        hasAuthId: !!authId,
        hasAuthToken: !!authToken,
        fromNumber: fromNumber || "Not set",
      });
    }

    return enabled;
  }

  private getClient(): plivo.Client {
    if (!this.client) {
      throw new Error("WhatsApp client not initialized - check Plivo credentials");
    }
    return this.client;
  }

  async send<T>(payload: NotificationPayload<T>): Promise<NotificationResult> {
    if (!this.isEnabled()) {
      return this.createResult(
        false,
        undefined,
        "WhatsApp service not configured - missing Plivo credentials or WhatsApp number"
      );
    }

    if (!this.validatePhoneNumber(payload.recipient)) {
      return this.createResult(
        false,
        undefined,
        `Invalid phone number format: ${payload.recipient}. Must be in +91XXXXXXXXXX format`
      );
    }

    try {
      const client = this.getClient();
      const to = this.formatPhoneNumber(payload.recipient);
      const template = this.buildTemplate(payload);

      console.log("Sending WhatsApp:", {
        type: payload.type,
        to: this.maskPhoneNumber(payload.recipient),
        template: template.name,
      });

      const response = await client.messages.create(
        this.getFromNumber(),
        to,
        "",
        {
          type: "whatsapp",
          template: JSON.stringify({
            name: template.name,
            language: template.language,
            components: template.components,
          }),
        }
      );

      const messageUuid = response.messageUuid?.[0] || "unknown";

      console.log("WhatsApp sent:", {
        messageUuid,
        recipient: this.maskPhoneNumber(payload.recipient),
      });

      return this.createResult(true, messageUuid, undefined, {
        provider: "plivo-whatsapp",
        recipient: this.maskPhoneNumber(payload.recipient),
        template: template.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`WhatsApp error for ${payload.type}:`, error);

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid destination")) return this.createResult(false, undefined, "Invalid WhatsApp number");
        if (msg.includes("template")) return this.createResult(false, undefined, "Message template not approved or invalid");
        if (msg.includes("rate limit") || msg.includes("throttl")) return this.createResult(false, undefined, "Rate limit exceeded");
        if (msg.includes("authentication") || msg.includes("unauthorized")) return this.createResult(false, undefined, "Plivo authentication failed");
        if (msg.includes("not registered")) return this.createResult(false, undefined, "WhatsApp number not registered on Plivo");
      }

      return this.createResult(
        false,
        undefined,
        error instanceof Error ? error.message : "Unknown WhatsApp error"
      );
    }
  }

  private buildTemplate<T>(
    payload: NotificationPayload<T>
  ): { name: string; language: string; components: any[] } {
    switch (payload.type) {
      case "booking_confirmation":
        return this.bookingConfirmationTemplate(payload.data as BookingConfirmationData);
      case "booking_status_update":
        return this.statusUpdateTemplate(payload.data as BookingStatusUpdateData);
      case "booking_reminder":
        return this.reminderTemplate(payload.data as BookingStatusUpdateData);
      case "payment_failed":
        return this.paymentFailedTemplate(payload.data as PaymentFailedData);
      case "enquiry_confirmation":
        return this.enquiryConfirmationTemplate(payload.data as EnquiryData);
      default:
        return this.enquiryConfirmationTemplate({
          fullName: "Customer",
          enquiryId: "N/A",
          selectedPackage: "General",
        } as EnquiryData);
    }
  }

  private bookingConfirmationTemplate(data: BookingConfirmationData) {
    return {
      name: this.templates.booking_confirmation,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.customerName },
            { type: "text", text: data.confirmationNumber },
            { type: "text", text: data.bookingType },
            { type: "text", text: data.items[0]?.title || "" },
            {
              type: "text",
              text: new Date(data.items[0]?.date || data.bookingDate).toLocaleDateString("en-IN"),
            },
            { type: "text", text: data.items[0]?.time || "" },
            { type: "text", text: (data.items[0]?.passengers || 1).toString() },
            { type: "text", text: `₹${data.totalAmount.toLocaleString()}` },
          ],
        },
      ],
    };
  }

  private statusUpdateTemplate(data: BookingStatusUpdateData) {
    return {
      name: this.templates.booking_status_update,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.customerName },
            { type: "text", text: data.confirmationNumber },
            { type: "text", text: `${data.oldStatus} → ${data.newStatus}` },
            { type: "text", text: data.message || "Status updated successfully" },
          ],
        },
      ],
    };
  }

  private reminderTemplate(data: BookingStatusUpdateData) {
    return {
      name: this.templates.booking_reminder,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.customerName },
            { type: "text", text: data.confirmationNumber },
            {
              type: "text",
              text: new Date(data.updateDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            },
          ],
        },
      ],
    };
  }

  private paymentFailedTemplate(data: PaymentFailedData) {
    return {
      name: this.templates.payment_failed,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.customerName },
            { type: "text", text: `₹${data.attemptedAmount.toLocaleString()}` },
            { type: "text", text: data.failureReason || "Payment processing error" },
          ],
        },
      ],
    };
  }

  private enquiryConfirmationTemplate(data: EnquiryData) {
    return {
      name: this.templates.enquiry_confirmation,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.fullName },
            { type: "text", text: data.enquiryId },
            { type: "text", text: data.selectedPackage || "General Enquiry" },
          ],
        },
      ],
    };
  }

  private validatePhoneNumber(phone: string): boolean {
    if (!this.validateRecipient(phone)) return false;
    return /^\+[1-9]\d{1,14}$/.test(phone.trim());
  }

  private formatPhoneNumber(phone: string): string {
    return phone.startsWith("+") ? phone.trim() : "+" + phone.trim();
  }

  private maskPhoneNumber(phone: string): string {
    if (phone.length < 8) return phone;
    return phone.substring(0, 4) + "X".repeat(phone.length - 7) + phone.substring(phone.length - 3);
  }

  async getMessageStatus(messageUuid: string): Promise<{
    status: string;
    errorCode?: string;
  }> {
    const client = this.getClient();
    const message = await client.messages.get(messageUuid);
    return {
      status: message.messageState || "unknown",
      errorCode: message.errorCode || undefined,
    };
  }
}
