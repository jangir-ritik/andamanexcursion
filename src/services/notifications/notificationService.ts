import { EmailService, BookingData, BookingStatusUpdate } from "./emailService";
import { getPayload } from "payload";
import config from "@/payload.config";

export interface NotificationPreferences {
  sendEmailUpdates: boolean;
  sendWhatsAppUpdates: boolean;
  language: "en" | "hi";
}

export class NotificationService {
  /**
   * Send booking confirmation notification (email + WhatsApp if enabled)
   */
  static async sendBookingConfirmation(bookingId: string): Promise<{
    email?: { success: boolean; error?: string };
    whatsapp?: { success: boolean; error?: string };
  }> {
    try {
      const payload = await getPayload({ config });

      // Get booking details
      const booking = await payload.findByID({
        collection: "bookings",
        id: bookingId,
      });

      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }

      const results: any = {};

      // Send email if customer has email and email notifications enabled
      if (
        booking.customerInfo?.customerEmail &&
        booking.communicationPreferences?.sendEmailUpdates !== false
      ) {
        const emailData: BookingData =
          this.transformBookingToEmailData(booking);
        results.email = await EmailService.sendBookingConfirmation(emailData);
      }

      // TODO: Add WhatsApp notification here when implemented
      // if (booking.customerInfo?.customerPhone && booking.communicationPreferences?.sendWhatsAppUpdates) {
      //   results.whatsapp = await WhatsAppService.sendBookingConfirmation(...);
      // }

      return results;
    } catch (error) {
      console.error(
        "NotificationService.sendBookingConfirmation error:",
        error
      );
      return {
        email: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Send booking status update notification
   */
  static async sendBookingStatusUpdate(
    bookingId: string,
    oldStatus: string,
    newStatus: string,
    customMessage?: string
  ): Promise<{
    email?: { success: boolean; error?: string };
    whatsapp?: { success: boolean; error?: string };
  }> {
    try {
      const payload = await getPayload({ config });

      const booking = await payload.findByID({
        collection: "bookings",
        id: bookingId,
      });

      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }

      const results: any = {};

      // Send email notification
      if (
        booking.customerInfo?.customerEmail &&
        booking.communicationPreferences?.sendEmailUpdates !== false
      ) {
        const statusUpdateData: BookingStatusUpdate = {
          bookingId: booking.bookingId || "",
          confirmationNumber: booking.confirmationNumber || "",
          customerName: booking.customerInfo.primaryContactName || "",
          customerEmail: booking.customerInfo.customerEmail || "",
          oldStatus: oldStatus,
          newStatus: newStatus,
          message: customMessage,
          updateDate: new Date().toISOString(),
        };

        results.email = await EmailService.sendBookingStatusUpdate(
          statusUpdateData
        );
      }

      // Log status change to booking record
      try {
        await payload.update({
          collection: "bookings",
          id: bookingId,
          data: {
            internalNotes: `${
              booking.internalNotes || ""
            }\nStatus changed: ${oldStatus} → ${newStatus} (${new Date().toISOString()})`,
          },
        });
      } catch (logError) {
        console.error("Failed to log status change:", logError);
      }

      return results;
    } catch (error) {
      console.error(
        "NotificationService.sendBookingStatusUpdate error:",
        error
      );
      return {
        email: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Send payment failed notification
   */
  static async sendPaymentFailedNotification(
    customerEmail: string,
    customerName: string,
    attemptedAmount: number,
    failureReason?: string,
    bookingType?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await EmailService.sendPaymentFailedNotification({
        customerEmail,
        customerName,
        attemptedAmount,
        failureReason,
        bookingType: (bookingType as "ferry" | "activity" | "mixed") || "mixed",
        currency: "INR",
      });
    } catch (error) {
      console.error(
        "NotificationService.sendPaymentFailedNotification error:",
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send reminder notifications (e.g., 24 hours before activity)
   */
  static async sendBookingReminder(bookingId: string): Promise<{
    email?: { success: boolean; error?: string };
    whatsapp?: { success: boolean; error?: string };
  }> {
    try {
      const payload = await getPayload({ config });

      const booking = await payload.findByID({
        collection: "bookings",
        id: bookingId,
      });

      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }

      const results: any = {};

      // For now, we'll use the status update email template for reminders
      if (
        booking.customerInfo?.customerEmail &&
        booking.communicationPreferences?.sendEmailUpdates !== false
      ) {
        const reminderData: BookingStatusUpdate = {
          bookingId: booking.bookingId || "",
          confirmationNumber: booking.confirmationNumber || "",
          customerName: booking.customerInfo.primaryContactName || "",
          customerEmail: booking.customerInfo.customerEmail || "",
          oldStatus: booking.status,
          newStatus: booking.status, // Same status, just a reminder
          message:
            "This is a friendly reminder about your upcoming booking. Please arrive 30 minutes early and bring a valid ID.",
          updateDate: new Date().toISOString(),
        };

        results.email = await EmailService.sendBookingStatusUpdate(
          reminderData
        );
      }

      return results;
    } catch (error) {
      console.error("NotificationService.sendBookingReminder error:", error);
      return {
        email: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Test email configuration
   */
  static async testEmailConfiguration(): Promise<{
    success: boolean;
    error?: string;
  }> {
    return await EmailService.testEmailConfiguration();
  }

  /**
   * Send bulk notifications (for promotional emails, updates, etc.)
   */
  static async sendBulkNotification(
    recipients: string[],
    subject: string,
    template: React.ComponentType<any>,
    templateData: any
  ): Promise<{ success: boolean; errors: string[] }> {
    return await EmailService.sendBulkNotification(
      recipients,
      subject,
      template,
      templateData
    );
  }

  /**
   * Transform booking record to email data format
   */
  private static transformBookingToEmailData(booking: any): BookingData {
    return {
      bookingId: booking.bookingId || "",
      confirmationNumber: booking.confirmationNumber || "",
      customerName: booking.customerInfo?.primaryContactName || "",
      customerEmail: booking.customerInfo?.customerEmail || "",
      bookingDate: booking.bookingDate,
      serviceDate:
        booking.activities?.[0]?.serviceDate ||
        booking.ferries?.[0]?.serviceDate,
      totalAmount: booking.pricing.totalAmount,
      currency: booking.pricing.currency || "INR",
      bookingType: booking.bookingType || "mixed",
      items: [
        // Transform activities
        ...(booking.activities || []).map((activity: any) => ({
          title: activity.activityBooking?.activity?.title || "Activity",
          date: activity.serviceDate || "",
          time: activity.serviceTime || "",
          location: activity.activityBooking?.activity?.location?.name,
          passengers: activity.passengersCount,
        })),
        // Transform ferries
        ...(booking.ferries || []).map((ferry: any) => ({
          title: `Ferry: ${ferry.ferryBooking?.ferry?.name || "Ferry Service"}`,
          date: ferry.serviceDate || "",
          time: ferry.departureTime || "",
          location: `${ferry.fromLocation} → ${ferry.toLocation}`,
          passengers: ferry.passengersCount,
        })),
      ],
      passengers:
        booking.passengers?.map((passenger: any) => ({
          fullName: passenger.fullName,
          age: passenger.age,
          gender: passenger.gender,
        })) || [],
      specialRequests: booking.specialRequests,
      contactPhone: booking.customerInfo.customerPhone,
    };
  }
}

export default NotificationService;
