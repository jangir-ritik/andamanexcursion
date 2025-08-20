import { getPayload } from "payload";
import config from "@/payload.config";
import { notificationManager } from "./NotificationManager";
import {
  BookingConfirmationData,
  BookingStatusUpdateData,
  PaymentFailedData,
  EnquiryData,
} from "./channels/base";

export interface NotificationPreferences {
  sendEmailUpdates: boolean;
  sendWhatsAppUpdates: boolean;
  language: "en" | "hi";
}

// Legacy interfaces for backward compatibility
export interface BookingData extends BookingConfirmationData {}
export interface BookingStatusUpdate extends BookingStatusUpdateData {}

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

      // Transform booking data
      const bookingData = this.transformBookingToEmailData(booking);

      // Prepare recipients and preferences
      const recipients = {
        email: booking.customerInfo?.customerEmail,
        phone: booking.customerInfo?.customerPhone,
      };

      const preferences: NotificationPreferences = {
        sendEmailUpdates:
          booking.communicationPreferences?.sendEmailUpdates !== false,
        sendWhatsAppUpdates:
          booking.communicationPreferences?.sendWhatsAppUpdates === true,
        language: booking.communicationPreferences?.language || "en",
      };

      // Send notification through unified manager
      const results = await notificationManager.sendBookingConfirmation(
        bookingData,
        recipients,
        preferences
      );

      // Transform results to match legacy interface
      return {
        email: results.email,
        whatsapp: results.whatsapp,
      };
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

      // Prepare status update data
      const statusUpdateData: BookingStatusUpdateData = {
        bookingId: booking.bookingId || "",
        confirmationNumber: booking.confirmationNumber || "",
        customerName: booking.customerInfo.primaryContactName || "",
        customerEmail: booking.customerInfo.customerEmail || "",
        oldStatus: oldStatus,
        newStatus: newStatus,
        message: customMessage,
        updateDate: new Date().toISOString(),
      };

      // Prepare recipients and preferences
      const recipients = {
        email: booking.customerInfo?.customerEmail,
        phone: booking.customerInfo?.customerPhone,
      };

      const preferences: NotificationPreferences = {
        sendEmailUpdates:
          booking.communicationPreferences?.sendEmailUpdates !== false,
        sendWhatsAppUpdates:
          booking.communicationPreferences?.sendWhatsAppUpdates === true,
        language: booking.communicationPreferences?.language || "en",
      };

      // Send notification through unified manager
      const results = await notificationManager.sendBookingStatusUpdate(
        statusUpdateData,
        recipients,
        preferences,
        customMessage
      );

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

      return {
        email: results.email,
        whatsapp: results.whatsapp,
      };
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
      const paymentData: PaymentFailedData = {
        customerEmail,
        customerName,
        attemptedAmount,
        failureReason,
        bookingType: (bookingType as "ferry" | "activity" | "mixed") || "mixed",
        currency: "INR",
      };

      const preferences: NotificationPreferences = {
        sendEmailUpdates: true,
        sendWhatsAppUpdates: false, // Payment failures typically only via email
        language: "en",
      };

      const results = await notificationManager.sendPaymentFailedNotification(
        paymentData,
        preferences
      );

      return results.email || { success: false, error: "No email result" };
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

      // Prepare reminder data (using status update format for reminders)
      const reminderData: BookingStatusUpdateData = {
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

      // Prepare recipients and preferences
      const recipients = {
        email: booking.customerInfo?.customerEmail,
        phone: booking.customerInfo?.customerPhone,
      };

      const preferences: NotificationPreferences = {
        sendEmailUpdates:
          booking.communicationPreferences?.sendEmailUpdates !== false,
        sendWhatsAppUpdates:
          booking.communicationPreferences?.sendWhatsAppUpdates === true,
        language: booking.communicationPreferences?.language || "en",
      };

      // Send reminder through unified manager
      const results = await notificationManager.sendBookingReminder(
        reminderData,
        recipients,
        preferences
      );

      return {
        email: results.email,
        whatsapp: results.whatsapp,
      };
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
    try {
      const results = await notificationManager.testAllChannels();
      return results.email || { success: false, error: "No email test result" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
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
    try {
      return await notificationManager.sendBulkNotification(
        recipients,
        subject,
        template.name, // Use template name as string identifier
        templateData
      );
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Transform booking record to email data format
   */
  private static transformBookingToEmailData(
    booking: any
  ): BookingConfirmationData {
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

  /**
   * Send enquiry confirmation to customer
   */
  static async sendEnquiryConfirmation(
    enquiryData: EnquiryData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const preferences: NotificationPreferences = {
        sendEmailUpdates: true,
        sendWhatsAppUpdates: false, // Typically enquiries are confirmed via email
        language: "en",
      };

      const results = await notificationManager.sendEnquiryConfirmation(
        enquiryData,
        preferences
      );

      return results.email || { success: false, error: "No email result" };
    } catch (error) {
      console.error(
        "NotificationService.sendEnquiryConfirmation error:",
        error
      );
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
    enquiryData: EnquiryData,
    adminEmail?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const results = await notificationManager.sendEnquiryNotification(
        enquiryData,
        adminEmail
      );

      return results.email || { success: false, error: "No email result" };
    } catch (error) {
      console.error(
        "NotificationService.sendEnquiryNotification error:",
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get notification channel status
   */
  static getChannelStatus(): Record<
    string,
    { enabled: boolean; name: string }
  > {
    return notificationManager.getChannelStatus();
  }

  /**
   * Test all notification channels
   */
  static async testAllChannels(): Promise<{
    email?: { success: boolean; error?: string };
    whatsapp?: { success: boolean; error?: string };
  }> {
    try {
      const results = await notificationManager.testAllChannels();
      return {
        email: results.email,
        whatsapp: results.whatsapp,
      };
    } catch (error) {
      return {
        email: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }
}

export default NotificationService;
