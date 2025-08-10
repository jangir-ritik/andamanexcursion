import { Resend } from "resend";
import { BookingEmailTemplate } from "@/templates/email/BookingConfirmationTemplate";
import { BookingStatusUpdateTemplate } from "@/templates/email/BookingStatusUpdateTemplate";
import { PaymentFailedTemplate } from "@/templates/email/PaymentFailedTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface BookingData {
  bookingId: string;
  confirmationNumber: string;
  customerName: string;
  customerEmail: string;
  bookingDate: string;
  serviceDate?: string;
  totalAmount: number;
  currency: string;
  bookingType: "ferry" | "activity" | "mixed";
  items: Array<{
    title: string;
    date: string;
    time: string;
    location?: string;
    passengers?: number;
  }>;
  passengers?: Array<{
    fullName: string;
    age: number;
    gender?: string;
  }>;
  specialRequests?: string;
  contactPhone?: string;
}

export interface BookingStatusUpdate {
  bookingId: string;
  confirmationNumber: string;
  customerName: string;
  customerEmail: string;
  oldStatus: string;
  newStatus: string;
  message?: string;
  updateDate: string;
}

export class EmailService {
  private static readonly FROM_EMAIL =
    process.env.FROM_EMAIL || "noreply@andamanexcursion.com";
  private static readonly FROM_NAME = "Andaman Excursion";

  /**
   * Send booking confirmation email after successful payment
   */
  static async sendBookingConfirmation(
    bookingData: BookingData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is not configured");
        return { success: false, error: "Email service not configured" };
      }

      const { data, error } = await resend.emails.send({
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        to: bookingData.customerEmail,
        subject: `Booking Confirmed - ${bookingData.confirmationNumber}`,
        react: BookingEmailTemplate({ ...bookingData }),
        headers: {
          "X-Entity-Ref-ID": bookingData.bookingId,
          "X-Booking-Type": bookingData.bookingType,
        },
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }

      console.log("Booking confirmation email sent successfully:", data?.id);
      return { success: true };
    } catch (error) {
      console.error("Failed to send booking confirmation email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send booking status update email (confirmed, cancelled, completed, etc.)
   */
  static async sendBookingStatusUpdate(
    updateData: BookingStatusUpdate
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is not configured");
        return { success: false, error: "Email service not configured" };
      }

      const subject = this.getStatusUpdateSubject(
        updateData.newStatus,
        updateData.confirmationNumber
      );

      const { data, error } = await resend.emails.send({
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        to: updateData.customerEmail,
        subject,
        react: BookingStatusUpdateTemplate({ ...updateData }),
        headers: {
          "X-Entity-Ref-ID": updateData.bookingId,
          "X-Status-Update": `${updateData.oldStatus}->${updateData.newStatus}`,
        },
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }

      console.log("Status update email sent successfully:", data?.id);
      return { success: true };
    } catch (error) {
      console.error("Failed to send status update email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send payment failed notification email
   */
  static async sendPaymentFailedNotification(
    bookingData: Partial<BookingData> & {
      customerEmail: string;
      customerName: string;
      attemptedAmount: number;
      failureReason?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is not configured");
        return { success: false, error: "Email service not configured" };
      }

      const { data, error } = await resend.emails.send({
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        to: bookingData.customerEmail,
        subject: "Payment Failed - Andaman Excursion",
        react: PaymentFailedTemplate({ ...bookingData }),
        headers: {
          "X-Payment-Failed": "true",
          "X-Amount": bookingData.attemptedAmount.toString(),
        },
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }

      console.log("Payment failed email sent successfully:", data?.id);
      return { success: true };
    } catch (error) {
      console.error("Failed to send payment failed email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send bulk notification emails (for promotional or informational purposes)
   */
  static async sendBulkNotification(
    recipients: string[],
    subject: string,
    template: React.ComponentType<any>,
    templateData: any
  ): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    const emailPromises = recipients.map(async (email) => {
      try {
        const { error } = await resend.emails.send({
          from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
          to: email,
          subject,
          react: template(templateData),
        });

        if (error) {
          errors.push(`${email}: ${error.message}`);
        }
      } catch (error) {
        errors.push(
          `${email}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });

    await Promise.allSettled(emailPromises);

    return {
      success: errors.length === 0,
      errors,
    };
  }

  /**
   * Test email configuration
   */
  static async testEmailConfiguration(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        return { success: false, error: "RESEND_API_KEY is not configured" };
      }

      const { data, error } = await resend.emails.send({
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        to: process.env.TEST_EMAIL || "test@andamanexcursion.com",
        subject: "Email Configuration Test - Andaman Excursion",
        html: "<h1>Email service is working correctly!</h1><p>This is a test email from your Andaman Excursion booking system.</p>",
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private static getStatusUpdateSubject(
    status: string,
    confirmationNumber: string
  ): string {
    const statusMessages = {
      confirmed: "Booking Confirmed",
      cancelled: "Booking Cancelled",
      completed: "Booking Completed",
      no_show: "Booking Update - No Show",
      pending: "Booking Pending",
    };

    const message =
      statusMessages[status as keyof typeof statusMessages] || "Booking Update";
    return `${message} - ${confirmationNumber}`;
  }
}
