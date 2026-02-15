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

  // Support phone number for all templates
  private readonly SUPPORT_PHONE = "+91-8107664041";

  // Approved Plivo template names (Meta-approved)
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
          template: {
            name: template.name,
            language: template.language,
            components: template.components,
          },
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
    // Template requires 10 parameters as per WhatsApp Manager screenshot
    const firstItem = data.items[0] || {};
    const route = firstItem.location || `${data.bookingType} Booking`;
    const date = new Date(firstItem.date || data.bookingDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    return {
      name: this.templates.booking_confirmation,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.customerName }, // {{1}} Customer Name
            { type: "text", text: data.confirmationNumber }, // {{2}} Booking ID
            { type: "text", text: route }, // {{3}} Route/Title
            { type: "text", text: date }, // {{4}} Date
            { type: "text", text: firstItem.time || "--" }, // {{5}} Departure Time
            { type: "text", text: (firstItem.passengers || 1).toString() }, // {{6}} Passengers
            { type: "text", text: "Premium" }, // {{7}} Class/Seat
            { type: "text", text: `₹${data.totalAmount.toLocaleString("en-IN")}` }, // {{8}} Amount
            { type: "text", text: "1 hour" }, // {{9}} Arrival Time
            { type: "text", text: this.SUPPORT_PHONE }, // {{10}} Support Phone
          ],
        },
      ],
    };
  }

  private statusUpdateTemplate(data: BookingStatusUpdateData) {
    // Get status emoji based on new status
    const getStatusEmoji = (status: string): string => {
      const lowerStatus = status.toLowerCase();
      if (lowerStatus.includes('cancel')) return '❌';
      if (lowerStatus.includes('complet')) return '✅';
      if (lowerStatus.includes('confirm')) return '✅';
      return '🔄';
    };

    const statusText = data.newStatus.charAt(0).toUpperCase() + data.newStatus.slice(1);
    const statusEmoji = getStatusEmoji(data.newStatus);
    const updateDate = new Date(data.updateDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    return {
      name: this.templates.booking_status_update,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: statusText }, // {{1}} Status text
            { type: "text", text: statusEmoji }, // {{2}} Status emoji
            { type: "text", text: data.customerName }, // {{3}} Customer Name
            { type: "text", text: data.confirmationNumber }, // {{4}} Confirmation Number
            { type: "text", text: data.oldStatus }, // {{5}} Old Status
            { type: "text", text: data.newStatus }, // {{6}} New Status
            { type: "text", text: updateDate }, // {{7}} Date
            { type: "text", text: data.message || "Your booking status has been updated." }, // {{8}} Custom message
            { type: "text", text: this.SUPPORT_PHONE }, // {{9}} Support phone
          ],
        },
      ],
    };
  }

  private reminderTemplate(data: BookingStatusUpdateData) {
    const reminderDate = new Date(data.updateDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return {
      name: this.templates.booking_reminder,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.customerName }, // {{1}} Customer Name
            { type: "text", text: data.confirmationNumber }, // {{2}} Confirmation Number
            { type: "text", text: reminderDate }, // {{3}} Date
            { type: "text", text: "⛵" }, // {{4}} Closing emoji
            { type: "text", text: this.SUPPORT_PHONE }, // {{5}} Support phone
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
            { type: "text", text: data.customerName }, // {{1}} Customer Name
            { type: "text", text: `₹${data.attemptedAmount.toLocaleString("en-IN")}` }, // {{2}} Amount
            { type: "text", text: data.failureReason || "Payment processing error" }, // {{3}} Failure Reason
            { type: "text", text: this.SUPPORT_PHONE }, // {{4}} Support phone
          ],
        },
      ],
    };
  }

  private enquiryConfirmationTemplate(data: EnquiryData) {
    const submissionDate = new Date(data.submissionDate || Date.now()).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return {
      name: this.templates.enquiry_confirmation,
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: data.fullName }, // {{1}} Customer Name
            { type: "text", text: data.enquiryId }, // {{2}} Enquiry ID
            { type: "text", text: data.selectedPackage || "General Enquiry" }, // {{3}} Selected Package
            { type: "text", text: submissionDate }, // {{4}} Submission Date
            { type: "text", text: "🌴" }, // {{5}} Closing emoji
            { type: "text", text: this.SUPPORT_PHONE }, // {{6}} Support phone
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
