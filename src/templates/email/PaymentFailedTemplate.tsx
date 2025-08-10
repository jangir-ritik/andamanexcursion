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

interface PaymentFailedTemplateProps {
  customerEmail: string;
  customerName: string;
  attemptedAmount: number;
  failureReason?: string;
  bookingType?: string;
  currency?: string;
}

export const PaymentFailedTemplate: React.FC<PaymentFailedTemplateProps> = ({
  customerName,
  attemptedAmount,
  failureReason,
  bookingType = "booking",
  currency = "INR",
}) => {
  const previewText = `Payment failed for your ${bookingType} - Andaman Excursion`;

  const formatCurrency = (amount: number, curr: string) => {
    if (curr === "INR") {
      return `₹${amount.toLocaleString("en-IN")}`;
    }
    return `${curr} ${amount}`;
  };

  const getCommonFailureReasons = (reason?: string) => {
    const commonReasons = [
      {
        title: "Insufficient Balance",
        description: "Your account may not have enough funds",
        solution: "Check your account balance and try again",
      },
      {
        title: "Card Expired",
        description: "Your payment card may have expired",
        solution: "Update your card details and retry payment",
      },
      {
        title: "Network Issue",
        description: "Connection was lost during payment",
        solution: "Check your internet connection and try again",
      },
      {
        title: "Bank Declined",
        description: "Your bank declined the transaction",
        solution: "Contact your bank or try a different payment method",
      },
    ];

    return commonReasons;
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
            <Text style={headerSubtitle}>Payment Issue</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Payment Failed ❌</Heading>

            <Text style={text}>Dear {customerName},</Text>

            <Text style={text}>
              We're sorry, but your payment was not successful. Don't worry -
              your booking hasn't been lost, and you can easily retry your
              payment.
            </Text>

            {/* Payment Failure Card */}
            <Section style={failureCard}>
              <Text style={failureEmoji}>💳</Text>
              <Text style={failureTitle}>Payment Processing Failed</Text>
              <Text style={failureAmount}>
                Amount: {formatCurrency(attemptedAmount, currency)}
              </Text>

              {failureReason && (
                <Section style={reasonSection}>
                  <Text style={reasonTitle}>Reason:</Text>
                  <Text style={reasonText}>{failureReason}</Text>
                </Section>
              )}
            </Section>

            {/* What You Can Do */}
            <Section style={solutionSection}>
              <Heading style={h2}>What You Can Do</Heading>

              {/* Retry Payment Button */}
              <Section style={buttonSection}>
                <Button
                  style={retryButton}
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/checkout/retry`}
                >
                  Retry Payment
                </Button>
              </Section>

              <Text style={text}>
                <strong>Or try these solutions:</strong>
              </Text>

              {getCommonFailureReasons().map((reason, index) => (
                <Section key={index} style={reasonCard}>
                  <Text style={reasonCardTitle}>{reason.title}</Text>
                  <Text style={reasonCardDescription}>
                    {reason.description}
                  </Text>
                  <Text style={reasonCardSolution}>💡 {reason.solution}</Text>
                </Section>
              ))}
            </Section>

            {/* Alternative Payment Methods */}
            <Section style={paymentMethodsSection}>
              <Heading style={h2}>Alternative Payment Methods</Heading>
              <Text style={text}>
                If you continue to experience issues, try these payment options:
              </Text>

              <Section style={methodsList}>
                <Text style={methodItem}>💳 Different Credit/Debit Card</Text>
                <Text style={methodItem}>🏦 Net Banking</Text>
                <Text style={methodItem}>📱 UPI Payment</Text>
                <Text style={methodItem}>
                  💰 Digital Wallets (Paytm, PhonePe, etc.)
                </Text>
              </Section>
            </Section>

            {/* Booking Assistance */}
            <Section style={assistanceSection}>
              <Heading style={h2}>Need Assistance?</Heading>
              <Text style={text}>
                Our booking team is here to help you complete your reservation:
              </Text>

              <Text style={contactText}>
                📞 Call us at: <strong>+91-XXXXX-XXXXX</strong>
              </Text>
              <Text style={contactText}>
                📧 Email us: <strong>support@andamanexcursion.com</strong>
              </Text>
              <Text style={contactText}>
                💬 WhatsApp: <strong>+91-XXXXX-XXXXX</strong>
              </Text>
              <Text style={contactText}>
                🕒 Available: <strong>9:00 AM - 8:00 PM (IST)</strong>
              </Text>
            </Section>

            {/* Important Note */}
            <Section style={noteSection}>
              <Text style={noteTitle}>📌 Important Note</Text>
              <Text style={noteText}>
                • Your booking details have been saved securely
              </Text>
              <Text style={noteText}>
                • No amount has been charged to your account
              </Text>
              <Text style={noteText}>
                • You can retry payment within 24 hours to secure the same rates
              </Text>
              <Text style={noteText}>
                • Our team can help you complete the booking over the phone
              </Text>
            </Section>

            {/* Security Notice */}
            <Section style={securitySection}>
              <Text style={securityTitle}>
                🔐 Your Security is Our Priority
              </Text>
              <Text style={text}>
                All payment information is processed securely through encrypted
                connections. We never store your complete card details on our
                servers.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Don't give up on your Andaman adventure! 🌴
            </Text>
            <Text style={footerText}>
              We're here to help you complete your booking successfully.
            </Text>
            <Text style={footerSubtext}>
              If you need immediate assistance, please contact our support team.
              We're committed to making your booking experience smooth and
              secure.
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
  backgroundColor: "#ef4444",
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
  color: "#fecaca",
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

const failureCard = {
  backgroundColor: "#fef2f2",
  border: "2px solid #ef4444",
  borderRadius: "8px",
  padding: "32px 24px",
  margin: "32px 0",
  textAlign: "center" as const,
};

const failureEmoji = {
  fontSize: "48px",
  margin: "0 0 16px",
  display: "block",
};

const failureTitle = {
  color: "#dc2626",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 12px",
};

const failureAmount = {
  color: "#991b1b",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const reasonSection = {
  backgroundColor: "#ffffff",
  border: "1px solid #f87171",
  borderRadius: "6px",
  padding: "16px",
  margin: "16px 0 0",
  textAlign: "left" as const,
};

const reasonTitle = {
  color: "#dc2626",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 4px",
};

const reasonText = {
  color: "#555",
  fontSize: "14px",
  margin: "0",
};

const solutionSection = {
  margin: "32px 0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const retryButton = {
  backgroundColor: "#22c55e",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "200px",
  padding: "14px 0",
  margin: "0 auto",
};

const reasonCard = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #e9ecef",
  borderRadius: "6px",
  padding: "16px",
  margin: "12px 0",
};

const reasonCardTitle = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 8px",
};

const reasonCardDescription = {
  color: "#666",
  fontSize: "14px",
  margin: "0 0 8px",
};

const reasonCardSolution = {
  color: "#0066cc",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
};

const paymentMethodsSection = {
  margin: "32px 0",
  backgroundColor: "#f0f9ff",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #0ea5e9",
};

const methodsList = {
  margin: "16px 0",
};

const methodItem = {
  color: "#0369a1",
  fontSize: "14px",
  margin: "0 0 8px",
  paddingLeft: "8px",
};

const assistanceSection = {
  margin: "32px 0",
  backgroundColor: "#f0fdf4",
  padding: "20px",
  borderRadius: "8px",
  border: "1px solid #22c55e",
};

const contactText = {
  color: "#15803d",
  fontSize: "14px",
  margin: "0 0 8px",
};

const noteSection = {
  margin: "32px 0",
  backgroundColor: "#fffbeb",
  border: "1px solid #f59e0b",
  borderRadius: "8px",
  padding: "20px",
};

const noteTitle = {
  color: "#92400e",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 12px",
};

const noteText = {
  color: "#92400e",
  fontSize: "14px",
  margin: "0 0 8px",
};

const securitySection = {
  margin: "32px 0",
  backgroundColor: "#f8fafc",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  padding: "20px",
};

const securityTitle = {
  color: "#475569",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 12px",
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

export default PaymentFailedTemplate;
