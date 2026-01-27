/**
 * Complete WhatsApp notification channel with Twilio Business API integration
 * Updated with new message formats as confirmed by client
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
    booking_confirmation: "booking_confirmation_template",
    booking_status_update: "status_update_template",
    booking_reminder: "booking_reminder_template",
    payment_failed: "payment_failed_template",
    enquiry_confirmation: "enquiry_confirmation_template",
  };

  // Support phone number
  private readonly supportPhone = process.env.SUPPORT_PHONE || "+91-8107664041";

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

    const enabled = !!(
      accountSid &&
      authToken &&
      fromNumber &&
      fromNumber.startsWith("whatsapp:")
    );

    if (!enabled) {
      console.log("⚠️ WhatsApp is NOT enabled. Checklist:", {
        hasAccountSid: !!accountSid,
        hasAuthToken: !!authToken,
        fromNumber: fromNumber,
        startsWithWhatsapp: fromNumber?.startsWith("whatsapp:"),
        environment
      });
    } else {
      console.log("✅ WhatsApp is enabled:", {
        environment,
        fromNumber
      });
    }

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
    console.log("🔔 WhatsApp send() called with payload:", {
      type: payload.type,
      recipient: this.maskPhoneNumber(payload.recipient),
      hasData: !!payload.data
    });

    if (!this.isEnabled()) {
      console.error("❌ WhatsApp service not enabled. Configuration check:", {
        accountSid: !!process.env.TWILIO_ACCOUNT_SID,
        authToken: !!process.env.TWILIO_AUTH_TOKEN,
        fromNumber: this.getFromNumber(),
        nodeEnv: process.env.NODE_ENV
      });
      return this.createResult(
        false,
        undefined,
        "WhatsApp service not configured - missing Twilio credentials or WhatsApp number"
      );
    }

    if (!this.validatePhoneNumber(payload.recipient)) {
      console.error("❌ Invalid phone number format:", payload.recipient);
      return this.createResult(false, undefined, `Invalid phone number format: ${payload.recipient}. Must be in +91XXXXXXXXXX format`);
    }

    try {
      const client = this.getClient();
      const formattedRecipient = this.formatWhatsAppNumber(payload.recipient);
      const messageData = await this.buildWhatsAppMessage(payload);

      console.log("📤 Sending WhatsApp message:", {
        to: formattedRecipient,
        from: this.getFromNumber(),
        hasBody: !!messageData.body,
        hasTemplate: !!messageData.templateName,
        messagePreview: messageData.body?.substring(0, 100) + "..."
      });

      const result = await this.sendWhatsAppMessage(
        client,
        formattedRecipient,
        messageData
      );

      console.log("✅ WhatsApp message sent successfully:", {
        sid: result.sid,
        recipient: this.maskPhoneNumber(payload.recipient)
      });

      return this.createResult(true, result.sid, undefined, {
        provider: "twilio-whatsapp",
        recipient: this.maskPhoneNumber(payload.recipient),
        templateUsed: messageData.templateName || "simple_message",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`❌ WhatsApp channel error for type ${payload.type}:`, error);

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
          "Test message from Andaman Excursion notification system.",
      },
    };

    return this.send(testPayload);
  }

  private validatePhoneNumber(phone: string): boolean {
    if (!this.validateRecipient(phone)) {
      return false;
    }

    // WhatsApp requires international format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    const isValid = phoneRegex.test(phone.trim());

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
          body: "Test Successful! 🧪\n\nWhatsApp notification system is working!\n📅 Test Date: " + 
                new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
                "\n🕐 Test Time: " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) +
                "\n✅ Status: Active\n\nThis confirms your WhatsApp integration is properly configured.\n\nAndaman Excursion Tech Team",
        };

      default:
        return {
          body: "You have a new notification from Andaman Excursion. Please check your email for details.",
        };
    }
  }

  private buildBookingConfirmationTemplate(data: BookingConfirmationData) {
    // In development/testing, return new format body message
    if (process.env.NODE_ENV !== "production") {
      let serviceLine = "booking";
      let details = "";
      let closingEmoji = "🌊";

      // Determine service type and build details accordingly
      if (data.bookingType === "ferry") {
        serviceLine = "ferry booking";
        closingEmoji = "🌊";
        
        if (data.items.length === 1) {
          const item = data.items[0];
          const date = new Date(item.date).toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          });
          
          details = `🚢 Booking Details:\nBooking ID: ${data.confirmationNumber}\nRoute: ${item.title.replace('Ferry: ', '')}\nDate: ${date}\nDeparture: ${item.time}\nPassengers: ${item.passengers || 1}\n`;
          
          // Add seat/class if available
          if (data.specialRequests?.includes("Premium") || data.specialRequests?.includes("Economy")) {
            details += `💺 Seat/Class: ${data.specialRequests.includes("Premium") ? "Premium" : "Economy"}\n`;
          }
        } else {
          details = `🚢 Booking Details:\nBooking ID: ${data.confirmationNumber}\n`;
          data.items.forEach((item, index) => {
            const date = new Date(item.date).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            });
            details += `Service ${index + 1}: ${item.title}\nDate: ${date}\nTime: ${item.time}\n`;
          });
          details += `Passengers: ${data.items[0]?.passengers || 1}\n`;
        }
      } 
      else if (data.bookingType === "activity") {
        serviceLine = "activity booking";
        closingEmoji = "🤿";
        
        if (data.items.length === 1) {
          const item = data.items[0];
          const date = new Date(item.date).toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          });
          
          details = `🎯 Booking Details:\nBooking ID: ${data.confirmationNumber}\nActivity: ${item.title}\nDate: ${date}\nTime: ${item.time}\nParticipants: ${item.passengers || 1}\n`;
        }
      } 
      else if (data.bookingType === "mixed") {
        serviceLine = "booking";
        closingEmoji = "🌴";
        
        details = `📦 Package Details:\nBooking ID: ${data.confirmationNumber}\n\n`;
        
        // Add ferry details
        const ferryItems = data.items.filter(item => item.title.includes('Ferry:'));
        if (ferryItems.length > 0) {
          details += `🚢 Ferry:\n`;
          ferryItems.forEach(item => {
            const date = new Date(item.date).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            });
            details += `Route: ${item.title.replace('Ferry: ', '')}\nDate: ${date}\nDeparture: ${item.time}\n`;
          });
          details += `Passengers: ${ferryItems[0]?.passengers || 1}\n\n`;
        }
        
        // Add activity details
        const activityItems = data.items.filter(item => !item.title.includes('Ferry:'));
        if (activityItems.length > 0) {
          details += `🎯 Activity:\n`;
          activityItems.forEach(item => {
            const date = new Date(item.date).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            });
            details += `${item.title}\nDate: ${date}\nTime: ${item.time}\n\n`;
          });
        }
      }

      // Build the complete message
      const message = `Booking Confirmed! ✅\n\nHi ${data.customerName},\nYour ${serviceLine} with Andaman Excursion is confirmed!\n${details}💰 Amount Paid: ₹${data.totalAmount.toLocaleString()}\n\nImportant:\n- Please arrive ${data.bookingType === 'ferry' ? '1 hour' : '30 minutes'} before ${data.bookingType === 'ferry' ? 'departure' : 'activity'}\n- Carry a valid ID proof\n- Please carry a valid ticket / e-ticket.\n\nHave a ${data.bookingType === 'ferry' ? 'safe journey' : data.bookingType === 'activity' ? 'amazing experience' : 'wonderful trip'}! ${closingEmoji}\nAndaman Excursion | Support: ${this.supportPhone}`;

      return {
        body: message
      };
    }

    // Production: Use template with new format variables
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
              { type: "text" as const, text: data.bookingType },
              { type: "text" as const, text: data.items[0]?.title || "" },
              {
                type: "text" as const,
                text: new Date(data.items[0]?.date || data.bookingDate).toLocaleDateString('en-IN')
              },
              {
                type: "text" as const,
                text: data.items[0]?.time || ""
              },
              {
                type: "text" as const,
                text: (data.items[0]?.passengers || 1).toString()
              },
              {
                type: "currency" as const,
                currency: {
                  fallback_value: `₹${data.totalAmount.toLocaleString()}`,
                  code: "INR",
                  amount_1000: data.totalAmount * 1000,
                },
              },
            ],
          },
        ],
      },
    };
  }

  private buildStatusUpdateTemplate(data: BookingStatusUpdateData) {
    // In development/testing, return new format body message
    if (process.env.NODE_ENV !== "production") {
      const statusEmoji = {
        'confirmed': '✅',
        'cancelled': '❌',
        'completed': '✅',
        'no_show': '⚠️',
        'pending': '⏳'
      }[data.newStatus.toLowerCase()] || '🔄';

      const statusText = {
        'confirmed': 'Updated',
        'cancelled': 'Cancelled',
        'completed': 'Updated',
        'no_show': 'Update',
        'pending': 'Updated'
      }[data.newStatus.toLowerCase()] || 'Updated';

      const date = new Date(data.updateDate).toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });

      let customMessage = "";
      if (data.newStatus.toLowerCase() === 'cancelled') {
        customMessage = "We're sorry to see you go!\nFull refund will be processed in 5-7 working days.";
      } else if (data.newStatus.toLowerCase() === 'no_show') {
        customMessage = "We missed you at the departure point!\nPlease contact support to reschedule.";
      } else if (data.newStatus.toLowerCase() === 'completed') {
        customMessage = "We hope you had a great experience!\nThank you for choosing Andaman Excursion 🌊";
      } else {
        customMessage = data.message || "Thank you for choosing Andaman Excursion 🌊";
      }

      const message = `Booking ${statusText}! ${statusEmoji}\n\nHi ${data.customerName},\nYour booking status has been updated:\n📋 Booking ID: ${data.confirmationNumber}\n📊 Status: ${data.oldStatus} → ${data.newStatus}\n📅 Date: ${date}\n\n${customMessage}\n\nFor any feedback, contact support:\n${this.supportPhone}`;

      return {
        body: message
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
                text: data.message || "Status updated successfully",
              },
            ],
          },
        ],
      },
    };
  }

  private buildReminderTemplate(data: BookingStatusUpdateData) {
    // In development/testing, return new format body message
    if (process.env.NODE_ENV !== "production") {
      const date = new Date(data.updateDate).toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });

      const message = `Booking Reminder! ⏰\n\nHi ${data.customerName},\nFriendly reminder about your upcoming booking:\n📋 Booking ID: ${data.confirmationNumber}\n📅 Date: ${date}\n\nImportant:\n- Arrive 1 hour before departure\n- Carry valid ID proof and e-ticket\n- Check weather conditions\n\nSee you tomorrow! ⛵\nAndaman Excursion | Support: ${this.supportPhone}`;

      return {
        body: message
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
    // In development/testing, return new format body message
    if (process.env.NODE_ENV !== "production") {
      const message = `Payment Failed! ❌\n\nHi ${data.customerName},\nWe couldn't process your payment:\n💳 Amount: ₹${data.attemptedAmount.toLocaleString()}\n🚫 Reason: ${data.failureReason || "Payment processing error"}\n\nPlease try again or update your payment method.\nYour booking is on hold until payment is complete.\n\nNeed help? Contact support:\n${this.supportPhone}`;

      return {
        body: message
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
    // In development/testing, return new format body message
    if (process.env.NODE_ENV !== "production") {
      const date = new Date(data.submissionDate).toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });

      let packageDetails = "";
      if (data.packageInfo) {
        packageDetails = `\nPackage Details:\n• ${data.packageInfo.title || data.selectedPackage}\n• Price: ₹${data.packageInfo.price?.toLocaleString() || "Contact for price"}\n• Duration: ${data.packageInfo.period || "Custom"}\n\n`;
      }

      const message = `Enquiry Received! 📝\n\nHi ${data.fullName},\nThank you for your enquiry!\n📋 Enquiry ID: ${data.enquiryId}\n📦 Package: ${data.selectedPackage || "General Enquiry"}\n📅 Submitted: ${date}\n\nOur team will contact you within 24 hours.\nFor urgent matters, call us directly.\n\nLooking forward to serving you! 🌴\nAndaman Excursion | Support: ${this.supportPhone}`;

      return {
        body: message
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

      return { sid: result.sid };
    } catch (error: any) {
      console.error("Twilio WhatsApp API error:", error);

      if (error.code) {
        console.error(`Twilio Error Code: ${error.code}`);
        console.error(`Twilio Error Message: ${error.message}`);
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
      return "Booking Confirmed! ✅\n\nHi Customer,\nYour booking with Andaman Excursion is confirmed!\n\nPlease check your email for details.\n\nAndaman Excursion | Support: " + this.supportPhone;
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

    const [customerName, confirmationNumber] = params;

    return `Booking Confirmed! ✅\n\nHi ${customerName || "Customer"},\nYour booking with Andaman Excursion is confirmed!\n\nBooking ID: ${confirmationNumber || "N/A"}\n\nPlease check your email for full details.\n\nAndaman Excursion | Support: ${this.supportPhone}`;
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