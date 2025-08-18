import React from "react";
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
        react: BookingEmailTemplate({ ...bookingData }) as React.ReactElement,
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
        react: BookingStatusUpdateTemplate({
          ...updateData,
        }) as React.ReactElement,
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
        react: PaymentFailedTemplate({ ...bookingData }) as React.ReactElement,
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
          react: React.createElement(template, templateData),
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

  /**
   * Send enquiry confirmation to customer
   */
  static async sendEnquiryConfirmation(
    customerEmail: string,
    enquiryData: EnquiryData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is not configured");
        return { success: false, error: "Email service not configured" };
      }

      const { data, error } = await resend.emails.send({
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        to: customerEmail,
        subject: `Enquiry Received - ${enquiryData.enquiryId}`,
        html: this.generateEnquiryConfirmationHTML(enquiryData),
        headers: {
          "X-Entity-Ref-ID": enquiryData.enquiryId,
          "X-Enquiry-Type": "confirmation",
        },
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }

      console.log("Enquiry confirmation email sent successfully:", data?.id);
      return { success: true };
    } catch (error) {
      console.error("Failed to send enquiry confirmation email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send enquiry notification to admin
   */
  static async sendEnquiryNotification(
    enquiryData: EnquiryData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is not configured");
        return { success: false, error: "Email service not configured" };
      }

      const adminEmail =
        process.env.ADMIN_EMAIL || "admin@andamanexcursion.com";

      const { data, error } = await resend.emails.send({
        from: `${this.FROM_NAME} <${this.FROM_EMAIL}>`,
        to: adminEmail,
        subject: `New Enquiry - ${enquiryData.enquiryId}`,
        html: this.generateEnquiryNotificationHTML(enquiryData),
        headers: {
          "X-Entity-Ref-ID": enquiryData.enquiryId,
          "X-Enquiry-Type": "notification",
        },
      });

      if (error) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
      }

      console.log("Enquiry notification email sent successfully:", data?.id);
      return { success: true };
    } catch (error) {
      console.error("Failed to send enquiry notification email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate customer confirmation email HTML
   */
  private static generateEnquiryConfirmationHTML(
    enquiryData: EnquiryData
  ): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Thank You for Your Enquiry!</h1>
      <p>Dear ${enquiryData.fullName},</p>
      <p>We have received your enquiry and will respond within 24 hours. Here are the details:</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Enquiry Details</h3>
        <p><strong>Enquiry ID:</strong> ${enquiryData.enquiryId}</p>
        <p><strong>Submission Date:</strong> ${new Date(
          enquiryData.submissionDate
        ).toLocaleDateString()}</p>
        ${
          enquiryData.selectedPackage
            ? `<p><strong>Package:</strong> ${enquiryData.selectedPackage}</p>`
            : ""
        }
        ${
          enquiryData.packageInfo?.price
            ? `<p><strong>Price:</strong> ₹${enquiryData.packageInfo.price.toLocaleString()}</p>`
            : ""
        }
      </div>
      
      ${
        enquiryData.message
          ? `
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Your Message</h4>
          <p>${enquiryData.message}</p>
        </div>
      `
          : ""
      }
      
      <p>Our team will review your enquiry and get back to you soon with a detailed quote and itinerary.</p>
      
      <p>Best regards,<br>
      The Andaman Excursion Team</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #6b7280; font-size: 14px;">
        If you have any immediate questions, please contact us at:<br>
        📞 +91-XXXX-XXXX-XX<br>
        📧 info@andamanexcursion.com
      </p>
    </div>
  `;
  }

  /**
   * Generate admin notification email HTML
   */
  private static generateEnquiryNotificationHTML(
    enquiryData: EnquiryData
  ): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">New Enquiry Received</h1>
      
      <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
        <p><strong>Enquiry ID:</strong> ${enquiryData.enquiryId}</p>
        <p><strong>Source:</strong> ${
          enquiryData.enquirySource || "Unknown"
        }</p>
        <p><strong>Submitted:</strong> ${new Date(
          enquiryData.submissionDate
        ).toLocaleString()}</p>
      </div>
      
      <h3>Customer Information</h3>
      <ul>
        <li><strong>Name:</strong> ${enquiryData.fullName}</li>
        <li><strong>Email:</strong> ${enquiryData.email}</li>
        <li><strong>Phone:</strong> ${enquiryData.phone}</li>
      </ul>
      
      ${
        enquiryData.selectedPackage
          ? `
        <h3>Package Information</h3>
        <ul>
          <li><strong>Package:</strong> ${enquiryData.selectedPackage}</li>
          ${
            enquiryData.packageInfo?.price
              ? `<li><strong>Price:</strong> ₹${enquiryData.packageInfo.price.toLocaleString()}</li>`
              : ""
          }
          ${
            enquiryData.packageInfo?.period
              ? `<li><strong>Duration:</strong> ${enquiryData.packageInfo.period}</li>`
              : ""
          }
        </ul>
      `
          : ""
      }
      
      ${
        enquiryData.message
          ? `
        <h3>Customer Message</h3>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
          <p>${enquiryData.message}</p>
        </div>
      `
          : ""
      }
      
      ${
        enquiryData.additionalMessage
          ? `
        <h3>Additional Message</h3>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
          <p>${enquiryData.additionalMessage}</p>
        </div>
      `
          : ""
      }
      
      <p><a href="${process.env.NEXT_PUBLIC_URL}/admin/collections/enquiries/${
      enquiryData.enquiryId
    }" 
         style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        View in Admin Panel
      </a></p>
    </div>
  `;
  }
}

// Add these interfaces and methods to your existing EmailService class

export interface EnquiryData {
  enquiryId: string;
  fullName: string;
  email: string;
  phone: string;
  selectedPackage?: string;
  message?: string;
  additionalMessage?: string;
  packageInfo?: {
    title?: string;
    price?: number;
    period?: string;
  };
  enquirySource?: "search" | "other" | "package-detail" | "direct";
  submissionDate: string;
}