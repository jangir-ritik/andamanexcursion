/**
 * WhatsApp notification channel (Future Implementation)
 * This channel is prepared for WhatsApp Business API integration
 * Currently returns placeholder responses until implementation is complete
 */

import {
  BaseNotificationChannel,
  NotificationPayload,
  NotificationResult,
  BookingConfirmationData,
  BookingStatusUpdateData,
  ChannelConfig,
} from "./base";

export class WhatsAppNotificationChannel extends BaseNotificationChannel {
  name = "whatsapp";

  private readonly config: ChannelConfig["whatsapp"] = {
    accountId: process.env.WHATSAPP_ACCOUNT_ID,
    fromNumber: process.env.WHATSAPP_FROM_NUMBER,
  };

  isEnabled(): boolean {
    // Currently disabled until WhatsApp Business API is set up
    return false;

    // Future implementation:
    // return !!(this.config.accountId && this.config.fromNumber && process.env.WHATSAPP_ACCESS_TOKEN);
  }

  async send<T>(payload: NotificationPayload<T>): Promise<NotificationResult> {
    if (!this.isEnabled()) {
      return this.createResult(
        false,
        undefined,
        "WhatsApp service not enabled"
      );
    }

    if (!this.validatePhoneNumber(payload.recipient)) {
      return this.createResult(false, undefined, "Invalid phone number");
    }

    // TODO: Implement WhatsApp Business API integration
    // For now, return success to indicate the channel is working
    console.log(
      `[WhatsApp Channel] Would send ${payload.type} notification to ${payload.recipient}`
    );

    try {
      const message = this.buildWhatsAppMessage(payload);

      // Future implementation:
      // const result = await this.sendWhatsAppMessage(payload.recipient, message);
      // return this.createResult(true, result.messageId);

      // Current placeholder:
      return this.createResult(true, `wa-${Date.now()}`, undefined, {
        provider: "whatsapp-placeholder",
        message: message.substring(0, 100) + "...",
        recipient: this.maskPhoneNumber(payload.recipient),
      });
    } catch (error) {
      console.error(`WhatsApp channel error for type ${payload.type}:`, error);
      return this.createResult(
        false,
        undefined,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  async test(): Promise<NotificationResult> {
    const testPhone = process.env.TEST_PHONE || "+91XXXXXXXXXX";

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
    if (!this.validateRecipient(phone)) return false;

    // Basic phone number validation (international format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.trim());
  }

  private buildWhatsAppMessage<T>(payload: NotificationPayload<T>): string {
    const { type, data } = payload;

    switch (type) {
      case "booking_confirmation":
        return this.buildBookingConfirmationMessage(
          data as BookingConfirmationData
        );

      case "booking_status_update":
        return this.buildStatusUpdateMessage(data as BookingStatusUpdateData);

      case "booking_reminder":
        return this.buildReminderMessage(data as BookingStatusUpdateData);

      case "payment_failed":
        return this.buildPaymentFailedMessage(data as any);

      case "test":
        return this.buildTestMessage(data as any);

      default:
        return `Andaman Excursion: You have a new notification. Please check your email for details.`;
    }
  }

  private buildBookingConfirmationMessage(
    data: BookingConfirmationData
  ): string {
    const currencySymbol = data.currency === "INR" ? "₹" : data.currency;

    return `🏝️ *Andaman Excursion - Booking Confirmed!*

Dear ${data.customerName},

✅ Your booking has been confirmed!

📋 *Booking Details:*
• Confirmation: ${data.confirmationNumber}
• Amount: ${currencySymbol}${data.totalAmount.toLocaleString()}
• Date: ${new Date(data.bookingDate).toLocaleDateString("en-IN")}

📍 *Services Booked:*
${data.items
  .map((item) => `• ${item.title} - ${item.date} at ${item.time}`)
  .join("\n")}

⚠️ *Important:*
• Arrive 30 minutes early
• Bring valid government ID
• Save this confirmation

Need help? Reply to this message or call us.

Thank you for choosing Andaman Excursion! 🌴`;
  }

  private buildStatusUpdateMessage(data: BookingStatusUpdateData): string {
    const statusEmojis = {
      confirmed: "✅",
      cancelled: "❌",
      completed: "🎉",
      no_show: "⚠️",
      pending: "⏳",
    };

    const emoji =
      statusEmojis[data.newStatus as keyof typeof statusEmojis] || "📋";

    return `🏝️ *Andaman Excursion - Status Update*

Dear ${data.customerName},

${emoji} Your booking status has been updated:

📋 *Booking:* ${data.confirmationNumber}
🔄 *Status:* ${data.oldStatus} → ${data.newStatus}
📅 *Updated:* ${new Date(data.updateDate).toLocaleDateString("en-IN")}

${data.message ? `💬 *Message:* ${data.message}` : ""}

${
  data.newStatus === "confirmed"
    ? `
⚠️ *Remember:*
• Arrive 30 minutes early
• Bring valid government ID
• Check weather conditions
`
    : ""
}

Need help? Reply to this message.

Thank you! 🌴`;
  }

  private buildReminderMessage(data: BookingStatusUpdateData): string {
    return `🏝️ *Andaman Excursion - Booking Reminder*

Dear ${data.customerName},

⏰ This is a friendly reminder about your upcoming booking:

📋 *Booking:* ${data.confirmationNumber}
📅 *Date:* Tomorrow

⚠️ *Important Reminders:*
• Arrive 30 minutes early
• Bring valid government ID
• Check weather conditions
• Contact us for any changes

${data.message ? `💬 ${data.message}` : ""}

Safe travels! 🌴`;
  }

  private buildPaymentFailedMessage(data: any): string {
    return `🏝️ *Andaman Excursion - Payment Failed*

Dear ${data.customerName},

❌ Your payment of ₹${data.attemptedAmount.toLocaleString()} could not be processed.

${data.failureReason ? `Reason: ${data.failureReason}` : ""}

Please try again or contact our support team.

We're here to help! 🌴`;
  }

  private buildTestMessage(data: any): string {
    return `🏝️ *Andaman Excursion - Test Message*

This is a test WhatsApp notification from your booking system.

✅ WhatsApp notifications are working correctly!

${data.message || ""}

Sent at: ${new Date().toLocaleString("en-IN")}`;
  }

  private maskPhoneNumber(phone: string): string {
    // Mask middle digits for privacy in logs
    if (phone.length < 8) return phone;
    const start = phone.substring(0, 4);
    const end = phone.substring(phone.length - 3);
    const middle = "X".repeat(phone.length - 7);
    return start + middle + end;
  }

  /**
   * Future implementation: Send actual WhatsApp message via Business API
   */
  private async sendWhatsAppMessage(
    to: string,
    message: string
  ): Promise<{ messageId: string }> {
    // TODO: Implement WhatsApp Business API call
    // Example implementation structure:

    /*
    const response = await fetch(`https://graph.facebook.com/v18.0/${this.config.accountId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    const result = await response.json();
    return { messageId: result.messages[0].id };
    */

    throw new Error("WhatsApp Business API not implemented yet");
  }
}
