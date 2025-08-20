import React from "react";
import {
  Html,
  Body,
  Head,
  Heading,
  Hr,
  Container,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";
import type { BookingStatusUpdateData } from "@/services/notifications/channels/base";

interface BookingStatusUpdateTemplateProps extends BookingStatusUpdateData {}

export const BookingStatusUpdateTemplate: React.FC<
  BookingStatusUpdateTemplateProps
> = ({
  confirmationNumber,
  customerName,
  oldStatus,
  newStatus,
  message,
  updateDate,
  bookingId,
}) => {
  const previewText = `Your booking ${confirmationNumber} status has been updated`;

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return {
          emoji: "✅",
          color: "#22c55e",
          title: "Booking Confirmed",
          description: "Your booking is now confirmed and ready to go!",
        };
      case "cancelled":
        return {
          emoji: "❌",
          color: "#ef4444",
          title: "Booking Cancelled",
          description: "Your booking has been cancelled.",
        };
      case "completed":
        return {
          emoji: "🎉",
          color: "#8b5cf6",
          title: "Booking Completed",
          description:
            "Thank you for choosing us! We hope you had an amazing experience.",
        };
      case "no_show":
        return {
          emoji: "⚠️",
          color: "#f59e0b",
          title: "No Show Recorded",
          description: "You did not show up for your scheduled booking.",
        };
      case "pending":
        return {
          emoji: "⏳",
          color: "#6b7280",
          title: "Booking Pending",
          description: "Your booking is pending confirmation.",
        };
      default:
        return {
          emoji: "📋",
          color: "#3b82f6",
          title: "Status Updated",
          description: "Your booking status has been updated.",
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusInfo = getStatusInfo(newStatus);

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>🏝️ Andaman Excursion</Text>
            <Text style={headerSubtitle}>Booking Status Update</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Booking Status Update</Heading>

            <Text style={text}>Dear {customerName},</Text>

            <Text style={text}>
              We wanted to update you on the status of your booking.
            </Text>

            {/* Status Update Card */}
            <Section style={{ ...statusCard, borderColor: statusInfo.color }}>
              <Text style={statusEmoji}>{statusInfo.emoji}</Text>
              <Text style={{ ...statusTitle, color: statusInfo.color }}>
                {statusInfo.title}
              </Text>
              <Text style={statusDescription}>{statusInfo.description}</Text>

              <Section style={statusDetails}>
                <Text style={detailText}>
                  <strong>Confirmation Number:</strong> {confirmationNumber}
                </Text>
                <Text style={detailText}>
                  <strong>Updated:</strong> {formatDate(updateDate)}
                </Text>
                <Text style={detailText}>
                  <strong>Previous Status:</strong> {oldStatus}
                </Text>
                <Text style={detailText}>
                  <strong>Current Status:</strong> {newStatus}
                </Text>
              </Section>
            </Section>

            {/* Custom Message */}
            {message && (
              <Section style={messageSection}>
                <Heading style={h2}>Additional Information</Heading>
                <Text style={messageText}>{message}</Text>
              </Section>
            )}

            {/* Status-specific Actions */}
            {newStatus === "confirmed" && (
              <Section style={actionSection}>
                <Text style={text}>
                  <strong>What's Next:</strong>
                </Text>
                <Text style={text}>• Save this confirmation email</Text>
                <Text style={text}>• Arrive 30 minutes before departure</Text>
                <Text style={text}>• Bring a valid government ID</Text>
                <Text style={text}>
                  • Check weather conditions before departure
                </Text>
              </Section>
            )}

            {newStatus === "cancelled" && (
              <Section style={actionSection}>
                <Text style={text}>
                  <strong>Cancellation Information:</strong>
                </Text>
                <Text style={text}>
                  • Refund processing time: 5-7 business days
                </Text>
                <Text style={text}>
                  • You will receive a separate email about refunds
                </Text>
                <Text style={text}>• Contact us if you need to rebook</Text>
              </Section>
            )}

            {newStatus === "completed" && (
              <Section style={actionSection}>
                <Text style={text}>
                  <strong>We'd Love Your Feedback:</strong>
                </Text>
                <Text style={text}>
                  Help us improve by sharing your experience with other
                  travelers.
                </Text>
                <Section style={buttonSection}>
                  <Button
                    style={button}
                    href={`${process.env.NEXT_PUBLIC_APP_URL}/review/${bookingId}`}
                  >
                    Leave a Review
                  </Button>
                </Section>
              </Section>
            )}

            {/* Contact Information */}
            <Section style={contactSection}>
              <Heading style={h2}>Need Help?</Heading>
              <Text style={text}>📞 Phone: +91-XXXXX-XXXXX</Text>
              <Text style={text}>📧 Email: support@andamanexcursion.com</Text>
              <Text style={text}>
                🕒 Support Hours: 9:00 AM - 8:00 PM (IST)
              </Text>
            </Section>

            {/* View Booking Button */}
            <Section style={buttonSection}>
              <Button
                style={button}
                href={`${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingId}`}
              >
                View Booking Details
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Thank you for choosing Andaman Excursion! 🌴
            </Text>
            <Text style={footerSubtext}>
              This email was sent regarding booking {confirmationNumber}. If you
              have any questions, please contact our support team.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const header = {
  backgroundColor: "#3b82f6",
  borderRadius: "8px 8px 0 0",
  padding: "32px 40px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0 0 8px",
};

const headerSubtitle = {
  color: "#dbeafe",
  fontSize: "16px",
  margin: "0",
};

const content = {
  padding: "40px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const h2 = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "32px 0 16px",
};

const text = {
  color: "#555",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const statusCard = {
  backgroundColor: "#f8f9fa",
  border: "2px solid",
  borderRadius: "8px",
  padding: "32px 24px",
  margin: "32px 0",
  textAlign: "center" as const,
};

const statusEmoji = {
  fontSize: "48px",
  margin: "0 0 16px",
  display: "block",
};

const statusTitle = {
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 12px",
};

const statusDescription = {
  color: "#666",
  fontSize: "16px",
  margin: "0 0 24px",
};

const statusDetails = {
  backgroundColor: "#ffffff",
  border: "1px solid #e9ecef",
  borderRadius: "6px",
  padding: "20px",
  margin: "24px 0 0",
  textAlign: "left" as const,
};

const detailText = {
  color: "#555",
  fontSize: "14px",
  margin: "0 0 8px",
};

const messageSection = {
  margin: "32px 0",
};

const messageText = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffeaa7",
  borderRadius: "6px",
  padding: "16px",
  color: "#856404",
  fontSize: "14px",
  margin: "0",
};

const actionSection = {
  margin: "32px 0",
  backgroundColor: "#f0f9ff",
  padding: "20px",
  borderRadius: "6px",
  border: "1px solid #0ea5e9",
};

const contactSection = {
  margin: "32px 0",
  backgroundColor: "#e7f3ff",
  padding: "16px",
  borderRadius: "6px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3b82f6",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "200px",
  padding: "12px 0",
  margin: "0 auto",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 40px",
  textAlign: "center" as const,
};

const footerText = {
  margin: "0 0 8px",
};

const footerSubtext = {
  margin: "16px 0 0",
  color: "#aab7c4",
};

export default BookingStatusUpdateTemplate;
