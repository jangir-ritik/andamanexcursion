/**
 * Complete WhatsApp notification channel with Twilio Business API integration
 * Includes sandbox support for testing and production template handling
 */

import {
  BaseNotificationChannel,
  NotificationPayload,
  NotificationResult,
  BookingConfirmationData,
  BookingStatusUpdateData,
  PaymentFailedData,
  EnquiryData,
  ChannelConfig,
} from "./base";

// Twilio SDK for WhatsApp
import twilio from "twilio";

// WhatsApp template types for type safety
export interface WhatsAppTemplate {
  name: string;
  language: string;
  components?: Array<{
    type: "header" | "body" | "footer" | "button";
    parameters?: Array<{
      type: "text" | "currency" | "date_time";
      text?: string;
      currency?: {
        fallback_value: string;
        code: string;
        amount_1000: number;
      };
      date_time?: {
        fallback_value: string;
      };
    }>;
  }>;
}

export class WhatsAppNotificationChannel extends BaseNotificationChannel {
  name = "whatsapp";
  private client: twilio.Twilio | null = null;

  private readonly config: Required<ChannelConfig["whatsapp"]> = {
    accountId: process.env.TWILIO_ACCOUNT_SID || "",
    // Use sandbox for testing, production number for live
    fromNumber: this.getFromNumber(),
  };

  // Template mappings for different notification types
  private readonly templates = {
    booking_confirmation: "notifications_welcome_template",
    booking_status_update: "status_update_template",
    booking_reminder: "booking_reminder_template",
    payment_failed: "payment_failed_template",
    enquiry_confirmation: "enquiry_confirmation_template",
  };

  constructor() {
    super();

    if (this.isEnabled()) {
      try {
        this.client = twilio(
          process.env.TWILIO_ACCOUNT_SID!,
          process.env.TWILIO_AUTH_TOKEN!
        );
      } catch (error) {
        console.error("Failed to initialize Twilio client:", error);
        this.client = null;
      }
    }
  }

  private getFromNumber(): string {
    // Use sandbox for testing environments
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test"
    ) {
      return process.env.TWILIO_WHATSAPP_SANDBOX || "whatsapp:+14155238886";
    }

    // Use production WhatsApp number for live environment
    return process.env.TWILIO_WHATSAPP_NUMBER || "";
  }

  isEnabled(): boolean {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = this.getFromNumber();
    const environment = process.env.NODE_ENV || "development";

    // console.log("[WhatsApp Debug] Environment check:");
    // console.log("- TWILIO_ACCOUNT_SID:", accountSid ? "✓ Set" : "✗ Missing");
    // console.log("- TWILIO_AUTH_TOKEN:", authToken ? "✓ Set" : "✗ Missing");
    // console.log("- TWILIO_WHATSAPP_NUMBER:", fromNumber || "✗ Missing");
    // console.log("- Environment:", environment);
    // console.log(
    //   "- FromNumber starts with 'whatsapp:':",
    //   fromNumber?.startsWith("whatsapp:") ? "✓ Yes" : "✗ No"
    // );

    const enabled = !!(
      accountSid &&
      authToken &&
      fromNumber &&
      fromNumber.startsWith("whatsapp:")
    );

    // console.log("- Channel enabled:", enabled ? "✓ YES" : "✗ NO");
    return enabled;
  }

  private getClient(): twilio.Twilio {
    if (!this.client) {
      throw new Error(
        "WhatsApp client not initialized - service may not be enabled"
      );
    }
    return this.client;
  }

  async send<T>(payload: NotificationPayload<T>): Promise<NotificationResult> {
    // console.log("[WhatsApp Debug] Send called with:", {
    //   type: payload.type,
    //   recipient: payload.recipient,
    //   enabled: this.isEnabled(),
    //   environment: process.env.NODE_ENV || "development",
    // });

    if (!this.isEnabled()) {
      // console.log("[WhatsApp Debug] Channel not enabled - skipping");
      return this.createResult(
        false,
        undefined,
        "WhatsApp service not configured - missing Twilio credentials or WhatsApp number"
      );
    }

    if (!this.validatePhoneNumber(payload.recipient)) {
      // console.log("[WhatsApp Debug] Invalid phone number:", payload.recipient);
      return this.createResult(false, undefined, "Invalid phone number format");
    }

    // console.log("[WhatsApp Debug] Proceeding with send...");

    try {
      const client = this.getClient();
      const formattedRecipient = this.formatWhatsAppNumber(payload.recipient);
      const messageData = await this.buildWhatsAppMessage(payload);

      const result = await this.sendWhatsAppMessage(
        client,
        formattedRecipient,
        messageData
      );

      return this.createResult(true, result.sid, undefined, {
        provider: "twilio-whatsapp",
        recipient: this.maskPhoneNumber(payload.recipient),
        templateUsed: messageData.templateName || "simple_message",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`WhatsApp channel error for type ${payload.type}:`, error);

      // Enhanced error handling for common Twilio errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        if (error.message.includes("63007")) {
          return this.createResult(
            false,
            undefined,
            "WhatsApp channel not found - check if number is properly configured for WhatsApp Business API"
          );
        }
        if (error.message.includes("21211")) {
          return this.createResult(false, undefined, "Invalid WhatsApp number");
        }
        if (error.message.includes("63016")) {
          return this.createResult(
            false,
            undefined,
            "Message template not approved"
          );
        }
        if (error.message.includes("63017")) {
          return this.createResult(false, undefined, "Rate limit exceeded");
        }
        if (errorMessage.includes("trial")) {
          return this.createResult(
            false,
            undefined,
            "Trial account limitation - upgrade to send WhatsApp messages to unverified numbers"
          );
        }
      }

      return this.createResult(
        false,
        undefined,
        error instanceof Error ? error.message : "Unknown WhatsApp error"
      );
    }
  }

  async test(): Promise<NotificationResult> {
    const testPhone = process.env.TEST_PHONE || "+918107664041";

    const testPayload: NotificationPayload<{ message: string }> = {
      type: "test",
      recipient: testPhone,
      data: {
        message:
          "This is a test WhatsApp message from your notification system.",
      },
    };

    return this.send(testPayload);
  }

  private validatePhoneNumber(phone: string): boolean {
    // console.log("[WhatsApp Debug] Validating phone:", phone);

    if (!this.validateRecipient(phone)) {
      // console.log("[WhatsApp Debug] Basic validation failed");
      return false;
    }

    // WhatsApp requires international format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    const isValid = phoneRegex.test(phone.trim());

    // console.log(
    //   "[WhatsApp Debug] Regex validation:",
    //   isValid ? "✓ Pass" : "✗ Fail"
    // );
    // console.log(
    //   "[WhatsApp Debug] Expected format: +[country][number] (e.g., +918107664041)"
    // );

    return isValid;
  }

  private formatWhatsAppNumber(phone: string): string {
    const cleanPhone = phone.startsWith("+") ? phone : "+" + phone;
    return `whatsapp:${cleanPhone}`;
  }

  private async buildWhatsAppMessage<T>(
    payload: NotificationPayload<T>
  ): Promise<{
    templateName?: string;
    templateData?: WhatsAppTemplate;
    body?: string;
  }> {
    const { type, data } = payload;

    switch (type) {
      case "booking_confirmation":
        return this.buildBookingConfirmationTemplate(
          data as BookingConfirmationData
        );

      case "booking_status_update":
        return this.buildStatusUpdateTemplate(data as BookingStatusUpdateData);

      case "booking_reminder":
        return this.buildReminderTemplate(data as BookingStatusUpdateData);

      case "payment_failed":
        return this.buildPaymentFailedTemplate(data as PaymentFailedData);

      case "enquiry_confirmation":
        return this.buildEnquiryConfirmationTemplate(data as EnquiryData);

      case "test":
        return {
          body: "🧪 Test message: WhatsApp integration is working!\n\nThis message was sent from Andaman Excursion's notification system.",
        };

      default:
        return {
          body: "You have a new notification from Andaman Excursion. Please check your email for details.",
        };
    }
  }

  private buildBookingConfirmationTemplate(data: BookingConfirmationData) {
    // In development/testing, return simple body message
    if (process.env.NODE_ENV !== "production") {
      return {
        body: `🌴 ANDAMAN EXCURSION - Booking Confirmed! 🌴

Hello ${data.customerName}!

Your booking is confirmed:
🎫 Confirmation: ${data.confirmationNumber}
💰 Amount: ₹${data.totalAmount.toLocaleString()}
📅 Date: ${new Date(data.bookingDate).toLocaleDateString("en-IN")}
🚢 Service: ${data.items.map((item) => item.title).join(", ")}

${data.items
  .map((item) => `⏰ ${item.time} | 📍 ${item.location || "Location TBD"}`)
  .join("\n")}

Thank you for choosing us!

Support: +91-8107664041`,
      };
    }

    // Production: Use template
    return {
      templateName: this.templates.booking_confirmation,
      templateData: {
        name: this.templates.booking_confirmation,
        language: "en",
        components: [
          {
            type: "body" as const,
            parameters: [
              { type: "text" as const, text: data.customerName },
              { type: "text" as const, text: data.confirmationNumber },
              {
                type: "currency" as const,
                currency: {
                  fallback_value: `₹${data.totalAmount.toLocaleString()}`,
                  code: "INR",
                  amount_1000: data.totalAmount * 1000,
                },
              },
              {
                type: "text" as const,
                text: new Date(data.bookingDate).toLocaleDateString("en-IN"),
              },
              {
                type: "text" as const,
                text: data.items.map((item) => item.title).join(", "),
              },
            ],
          },
        ],
      },
    };
  }

  private buildStatusUpdateTemplate(data: BookingStatusUpdateData) {
    // In development/testing, return simple body message
    if (process.env.NODE_ENV !== "production") {
      const statusEmojis: Record<string, string> = {
        confirmed: "✅",
        cancelled: "❌",
        completed: "🎉",
        no_show: "⚠️",
        pending: "⏳",
      };

      return {
        body: `🔄 Booking Status Update

Hello ${data.customerName},

Your booking ${data.confirmationNumber} status has been updated:

${statusEmojis[data.oldStatus] || "📋"} ${data.oldStatus} → ${
          statusEmojis[data.newStatus] || "📋"
        } ${data.newStatus}

${data.message ? `\nMessage: ${data.message}` : ""}

For questions, contact: +91-8107664041`,
      };
    }

    // Production: Use template
    return {
      templateName: this.templates.booking_status_update,
      templateData: {
        name: this.templates.booking_status_update,
        language: "en",
        components: [
          {
            type: "body" as const,
            parameters: [
              { type: "text" as const, text: data.customerName },
              { type: "text" as const, text: data.confirmationNumber },
              {
                type: "text" as const,
                text: `${data.oldStatus} → ${data.newStatus}`,
              },
              {
                type: "text" as const,
                text: data.message || "No additional message",
              },
            ],
          },
        ],
      },
    };
  }

  private buildReminderTemplate(data: BookingStatusUpdateData) {
    // In development/testing, return simple body message
    if (process.env.NODE_ENV !== "production") {
      return {
        body: `⏰ Booking Reminder

Hello ${data.customerName},

This is a friendly reminder about your upcoming booking:

🎫 Confirmation: ${data.confirmationNumber}
📅 Tomorrow's service

Please remember to:
• Arrive 30 minutes early
• Bring a valid ID
• Check weather conditions

Support: +91-8107664041`,
      };
    }

    // Production: Use template
    return {
      templateName: this.templates.booking_reminder,
      templateData: {
        name: this.templates.booking_reminder,
        language: "en",
        components: [
          {
            type: "body" as const,
            parameters: [
              { type: "text" as const, text: data.customerName },
              { type: "text" as const, text: data.confirmationNumber },
              {
                type: "date_time" as const,
                date_time: {
                  fallback_value: "tomorrow",
                },
              },
            ],
          },
        ],
      },
    };
  }

  private buildPaymentFailedTemplate(data: PaymentFailedData) {
    // In development/testing, return simple body message
    if (process.env.NODE_ENV !== "production") {
      return {
        body: `❌ Payment Failed

Hello ${data.customerName},

Unfortunately, your payment of ₹${data.attemptedAmount.toLocaleString()} could not be processed.

Reason: ${data.failureReason || "Payment processing error"}

Please try again or contact us for assistance:
📧 Email: support@andamanexcursion.com
📞 Phone: +91-8107664041

We're here to help!`,
      };
    }

    // Production: Use template
    return {
      templateName: this.templates.payment_failed,
      templateData: {
        name: this.templates.payment_failed,
        language: "en",
        components: [
          {
            type: "body" as const,
            parameters: [
              { type: "text" as const, text: data.customerName },
              {
                type: "currency" as const,
                currency: {
                  fallback_value: `₹${data.attemptedAmount.toLocaleString()}`,
                  code: "INR",
                  amount_1000: data.attemptedAmount * 1000,
                },
              },
              {
                type: "text" as const,
                text: data.failureReason || "Payment processing error",
              },
            ],
          },
        ],
      },
    };
  }

  private buildEnquiryConfirmationTemplate(data: EnquiryData) {
    // In development/testing, return simple body message
    if (process.env.NODE_ENV !== "production") {
      return {
        body: `📝 Enquiry Received

Hello ${data.fullName},

Thank you for your enquiry!

🆔 Enquiry ID: ${data.enquiryId}
📦 Package: ${data.selectedPackage || "General Enquiry"}

We've received your message and will respond within 24 hours.

${
  data.packageInfo
    ? `
Package Details:
• ${data.packageInfo.title}
• Price: ₹${data.packageInfo.price?.toLocaleString()}
• Duration: ${data.packageInfo.period}
`
    : ""
}

Contact us anytime:
📞 +91-8107664041
📧 info@andamanexcursion.com`,
      };
    }

    // Production: Use template
    return {
      templateName: this.templates.enquiry_confirmation,
      templateData: {
        name: this.templates.enquiry_confirmation,
        language: "en",
        components: [
          {
            type: "body" as const,
            parameters: [
              { type: "text" as const, text: data.fullName },
              { type: "text" as const, text: data.enquiryId },
              {
                type: "text" as const,
                text: data.selectedPackage || "General Enquiry",
              },
            ],
          },
        ],
      },
    };
  }

  private async sendWhatsAppMessage(
    client: twilio.Twilio,
    to: string,
    messageData: {
      templateName?: string;
      templateData?: WhatsAppTemplate;
      body?: string;
    }
  ): Promise<{ sid: string }> {
    try {
      let result;

      // In development/testing, prefer simple messages
      if (process.env.NODE_ENV !== "production") {
        const message =
          messageData.body || this.buildSimpleMessage(messageData.templateData);

        // console.log(`[WhatsApp Debug] Sending sandbox message to: ${to}`);
        // console.log(
        //   `[WhatsApp Debug] Message preview:`,
        //   message.substring(0, 100) + "..."
        // );

        result = await client.messages.create({
          from: this.getFromNumber(),
          to: to,
          body: message,
        });
      } else {
        // Production: Use templates
        if (messageData.templateName && messageData.templateData) {
          const contentSid = this.getContentSid(messageData.templateName);

          if (!contentSid) {
            // console.log(
            //   `[WhatsApp Debug] No content SID found for template: ${messageData.templateName}, falling back to simple message`
            // );

            const fallbackMessage = this.buildSimpleMessage(
              messageData.templateData
            );
            result = await client.messages.create({
              from: this.getFromNumber(),
              to: to,
              body: fallbackMessage,
            });
          } else {
            const contentVariables = this.formatContentVariables(
              messageData.templateData
            );

            // console.log(`[WhatsApp Debug] Sending template message:`, {
            //   contentSid,
            //   contentVariables,
            //   to,
            // });

            result = await client.messages.create({
              from: this.getFromNumber(),
              to: to,
              contentSid: contentSid,
              contentVariables: contentVariables,
            });
          }
        } else if (messageData.body) {
          result = await client.messages.create({
            from: this.getFromNumber(),
            to: to,
            body: messageData.body,
          });
        } else {
          throw new Error("No valid message content provided");
        }
      }

      // console.log(`[WhatsApp Debug] Message sent successfully:`, result.sid);
      return { sid: result.sid };
    } catch (error: any) {
      console.error("Twilio WhatsApp API error:", error);

      if (error.code) {
        console.error(`[WhatsApp Debug] Twilio Error Code: ${error.code}`);
        console.error(
          `[WhatsApp Debug] Twilio Error Message: ${error.message}`
        );
        console.error(`[WhatsApp Debug] More Info: ${error.moreInfo || "N/A"}`);
      }

      throw error;
    }
  }

  private getContentSid(templateName: string): string | null {
    // Only use Content SIDs in production
    if (process.env.NODE_ENV !== "production") {
      return null; // Force simple messages in development
    }

    const contentSidMapping: Record<string, string> = {
      notifications_welcome_template:
        process.env.TWILIO_WELCOME_TEMPLATE_SID ||
        "HX3edf43c6e376e59648d60c56f57ecdf0",
      booking_confirmation_template:
        process.env.TWILIO_BOOKING_CONFIRMATION_SID || "",
      status_update_template: process.env.TWILIO_STATUS_UPDATE_SID || "",
      booking_reminder_template: process.env.TWILIO_REMINDER_SID || "",
      payment_failed_template: process.env.TWILIO_PAYMENT_FAILED_SID || "",
      enquiry_confirmation_template:
        process.env.TWILIO_ENQUIRY_CONFIRMATION_SID || "",
    };

    return contentSidMapping[templateName] || "";
  }

  private formatContentVariables(templateData: WhatsAppTemplate): string {
    const variables: Record<string, string> = {};

    templateData.components?.forEach((component, compIndex) => {
      if (component.parameters) {
        component.parameters.forEach((param, paramIndex) => {
          const key = `${compIndex + 1}_${paramIndex + 1}`;
          variables[key] =
            param.text ||
            param.currency?.fallback_value ||
            param.date_time?.fallback_value ||
            "";
        });
      }
    });

    return JSON.stringify(variables);
  }

  private buildSimpleMessage(templateData?: WhatsAppTemplate): string {
    if (!templateData) {
      return "Test message from Andaman Excursion - WhatsApp integration is working!";
    }

    // Extract parameters for any template type
    const params: string[] = [];
    templateData.components?.forEach((component) => {
      if (component.parameters) {
        component.parameters.forEach((param) => {
          if (param.text) params.push(param.text);
          if (param.currency?.fallback_value)
            params.push(param.currency.fallback_value);
          if (param.date_time?.fallback_value)
            params.push(param.date_time.fallback_value);
        });
      }
    });

    const [customerName, confirmationNumber, amount, date, items] = params;

    return `🌴 ANDAMAN EXCURSION - Booking Confirmed! 🌴

Hello ${customerName || "Customer"}!

Your booking is confirmed:
🎫 Confirmation: ${confirmationNumber || "N/A"}
💰 Amount: ${amount || "N/A"}
📅 Date: ${date || "N/A"}
🚢 Service: ${items || "Ferry Service"}

Thank you for choosing us!

Support: +91-8107664041`;
  }

  private maskPhoneNumber(phone: string): string {
    if (phone.length < 8) return phone;
    const start = phone.substring(0, 4);
    const end = phone.substring(phone.length - 3);
    const middle = "X".repeat(phone.length - 7);
    return start + middle + end;
  }

  /**
   * Check delivery status of a sent message
   */
  async getMessageStatus(messageSid: string): Promise<{
    status: string;
    errorCode?: string;
    errorMessage?: string;
  }> {
    try {
      const client = this.getClient();
      const message = await client.messages(messageSid).fetch();

      return {
        status: message.status,
        errorCode: message.errorCode?.toString(),
        errorMessage: message.errorMessage || undefined,
      };
    } catch (error) {
      throw new Error(`Failed to fetch message status: ${error}`);
    }
  }

  /**
   * Get account WhatsApp phone number info
   */
  async getPhoneNumberInfo(): Promise<{
    sid: string;
    phoneNumber: string;
    status: string;
  }> {
    try {
      const client = this.getClient();
      const phoneNumbers = await client.incomingPhoneNumbers.list({
        phoneNumber: this.getFromNumber().replace("whatsapp:", ""),
      });

      if (phoneNumbers.length === 0) {
        throw new Error("WhatsApp phone number not found in account");
      }

      const phoneNumber = phoneNumbers[0];
      return {
        sid: phoneNumber.sid,
        phoneNumber: phoneNumber.phoneNumber,
        status: phoneNumber.status,
      };
    } catch (error) {
      throw new Error(`Failed to get phone number info: ${error}`);
    }
  }

  /**
   * Test if sandbox is properly configured
   */
  async testSandboxConnection(): Promise<NotificationResult> {
    try {
      const client = this.getClient();

      // Test with sandbox number
      const result = await client.messages.create({
        from: "whatsapp:+14155238886", // Twilio sandbox
        to: "whatsapp:+918107664041", // Your test number
        body: "🧪 Sandbox test from Andaman Excursion - If you receive this, WhatsApp sandbox is working!",
      });

      return this.createResult(true, result.sid, undefined, {
        provider: "twilio-whatsapp-sandbox",
        testType: "sandbox_connection",
      });
    } catch (error) {
      return this.createResult(
        false,
        undefined,
        error instanceof Error ? error.message : "Sandbox test failed"
      );
    }
  }
}
