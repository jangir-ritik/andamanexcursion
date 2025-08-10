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
  Row,
  Column,
} from "@react-email/components";
import { BookingData } from "@/services/notifications/emailService";

interface BookingEmailTemplateProps extends BookingData {}

export const BookingEmailTemplate: React.FC<BookingEmailTemplateProps> = ({
  confirmationNumber,
  customerName,
  bookingDate,
  serviceDate,
  totalAmount,
  currency = "INR",
  bookingType,
  items,
  passengers,
  specialRequests,
  contactPhone,
  bookingId,
}) => {
  const previewText = `Your booking ${confirmationNumber} is confirmed! Andaman Excursion`;

  const formatCurrency = (amount: number, curr: string) => {
    if (curr === "INR") {
      return `₹${amount.toLocaleString("en-IN")}`;
    }
    return `${curr} ${amount}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getBookingTypeLabel = (type: string) => {
    switch (type) {
      case "ferry":
        return "🚢 Ferry Booking";
      case "activity":
        return "🏝️ Activity Booking";
      case "mixed":
        return "🎯 Combined Booking";
      default:
        return "📅 Booking";
    }
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>🏝️ Andaman Excursion</Text>
            <Text style={headerSubtitle}>Your Adventure Awaits!</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Booking Confirmed! 🎉</Heading>

            <Text style={text}>Dear {customerName},</Text>

            <Text style={text}>
              Great news! Your booking has been confirmed. We're excited to be
              part of your Andaman adventure!
            </Text>

            {/* Booking Summary Card */}
            <Section style={bookingCard}>
              <Text style={bookingCardTitle}>
                {getBookingTypeLabel(bookingType)}
              </Text>

              <Row style={bookingDetails}>
                <Column style={detailColumn}>
                  <Text style={detailLabel}>Confirmation Number</Text>
                  <Text style={detailValue}>{confirmationNumber}</Text>
                </Column>
                <Column style={detailColumn}>
                  <Text style={detailLabel}>Booking Date</Text>
                  <Text style={detailValue}>{formatDate(bookingDate)}</Text>
                </Column>
              </Row>

              {serviceDate && (
                <Row style={bookingDetails}>
                  <Column style={detailColumn}>
                    <Text style={detailLabel}>Service Date</Text>
                    <Text style={detailValue}>{formatDate(serviceDate)}</Text>
                  </Column>
                  <Column style={detailColumn}>
                    <Text style={detailLabel}>Total Amount</Text>
                    <Text style={detailValueAmount}>
                      {formatCurrency(totalAmount, currency)}
                    </Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Items/Services Booked */}
            <Section style={itemsSection}>
              <Heading style={h2}>Your Bookings</Heading>
              {items.map((item, index) => (
                <Section key={index} style={itemCard}>
                  <Text style={itemTitle}>{item.title}</Text>
                  <Text style={itemDetails}>
                    📅 {formatDate(item.date)} • 🕒 {item.time}
                  </Text>
                  {item.location && (
                    <Text style={itemDetails}>📍 {item.location}</Text>
                  )}
                  {item.passengers && (
                    <Text style={itemDetails}>
                      👥 {item.passengers} passengers
                    </Text>
                  )}
                </Section>
              ))}
            </Section>

            {/* Passenger Information */}
            {passengers && passengers.length > 0 && (
              <Section style={passengersSection}>
                <Heading style={h2}>Passenger Details</Heading>
                {passengers.map((passenger, index) => (
                  <Text key={index} style={passengerItem}>
                    {index + 1}. {passenger.fullName} ({passenger.age} years,{" "}
                    {passenger.gender || "N/A"})
                  </Text>
                ))}
              </Section>
            )}

            {/* Special Requests */}
            {specialRequests && (
              <Section style={specialRequestsSection}>
                <Heading style={h2}>Special Requests</Heading>
                <Text style={specialRequestsText}>{specialRequests}</Text>
              </Section>
            )}

            {/* Contact Information */}
            <Section style={contactSection}>
              <Heading style={h2}>Contact Information</Heading>
              <Text style={text}>
                📞 Phone: {contactPhone || "+91-XXXXX-XXXXX"}
              </Text>
              <Text style={text}>📧 Email: booking@andamanexcursion.com</Text>
              <Text style={text}>
                🕒 Support Hours: 9:00 AM - 8:00 PM (IST)
              </Text>
            </Section>

            {/* Important Information */}
            <Section style={importantInfoSection}>
              <Heading style={h2}>Important Information</Heading>
              <Text style={text}>
                • Please carry a valid government ID and this confirmation
              </Text>
              <Text style={text}>
                • Arrive at the departure point 30 minutes early
              </Text>
              <Text style={text}>
                • Check weather conditions before departure
              </Text>
              <Text style={text}>
                • Contact us immediately for any changes or cancellations
              </Text>
            </Section>

            {/* Action Button */}
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
            <Text style={footerText}>
              We're here to make your Andaman experience unforgettable.
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
  backgroundColor: "#0066cc",
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
  color: "#e6f3ff",
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

const bookingCard = {
  backgroundColor: "#f8f9fa",
  border: "2px solid #0066cc",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const bookingCardTitle = {
  color: "#0066cc",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const bookingDetails = {
  margin: "8px 0",
};

const detailColumn = {
  width: "50%",
  paddingRight: "16px",
};

const detailLabel = {
  color: "#666",
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};

const detailValue = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
};

const detailValueAmount = {
  color: "#0066cc",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0",
};

const itemsSection = {
  margin: "32px 0",
};

const itemCard = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #e9ecef",
  borderRadius: "6px",
  padding: "16px",
  margin: "8px 0",
};

const itemTitle = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 8px",
};

const itemDetails = {
  color: "#666",
  fontSize: "14px",
  margin: "0 0 4px",
};

const passengersSection = {
  margin: "32px 0",
};

const passengerItem = {
  color: "#555",
  fontSize: "14px",
  margin: "0 0 8px",
  paddingLeft: "8px",
};

const specialRequestsSection = {
  margin: "32px 0",
};

const specialRequestsText = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffeaa7",
  borderRadius: "4px",
  padding: "12px",
  color: "#856404",
  fontSize: "14px",
  fontStyle: "italic" as const,
  margin: "0",
};

const contactSection = {
  margin: "32px 0",
  backgroundColor: "#e7f3ff",
  padding: "16px",
  borderRadius: "6px",
};

const importantInfoSection = {
  margin: "32px 0",
  backgroundColor: "#fff5f5",
  border: "1px solid #fecaca",
  padding: "16px",
  borderRadius: "6px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "40px 0",
};

const button = {
  backgroundColor: "#0066cc",
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

export default BookingEmailTemplate;
