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
import { EnquiryData } from "@/services/notifications/channels/base";

interface EnquiryConfirmationTemplateProps extends EnquiryData {}

export const EnquiryConfirmationTemplate: React.FC<
  EnquiryConfirmationTemplateProps
> = ({
  enquiryId,
  fullName,
  email,
  phone,
  selectedPackage,
  message,
  packageInfo,
  enquirySource,
  submissionDate,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const previewText = `Thank you for your enquiry ${enquiryId} - Andaman Excursion`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>🏝️ Andaman Excursion</Text>
            <Text style={headerSubtitle}>Thank You for Your Enquiry!</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Thank You for Your Enquiry!</Heading>

            <Text style={text}>Dear {fullName},</Text>

            <Text style={text}>
              We have received your enquiry and will respond within 24 hours.
              Here are the details:
            </Text>

            {/* Enquiry Details Card */}
            <Section style={enquiryCard}>
              <Text style={enquiryCardTitle}>Enquiry Details</Text>

              <Text style={detailText}>
                <strong>Enquiry ID:</strong> {enquiryId}
              </Text>
              <Text style={detailText}>
                <strong>Submission Date:</strong> {formatDate(submissionDate)}
              </Text>
              {selectedPackage && (
                <Text style={detailText}>
                  <strong>Package:</strong> {selectedPackage}
                </Text>
              )}
              {packageInfo?.price && (
                <Text style={detailText}>
                  <strong>Price:</strong> ₹{packageInfo.price.toLocaleString()}
                </Text>
              )}
              {packageInfo?.period && (
                <Text style={detailText}>
                  <strong>Duration:</strong> {packageInfo.period}
                </Text>
              )}
            </Section>

            {/* Customer Message */}
            {message && (
              <Section style={messageSection}>
                <Heading style={h2}>Your Message</Heading>
                <Text style={messageText}>{message}</Text>
              </Section>
            )}

            <Text style={text}>
              Our team will review your enquiry and get back to you soon with a
              detailed quote and itinerary.
            </Text>

            <Text style={text}>
              Best regards,
              <br />
              The Andaman Excursion Team
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              If you have any immediate questions, please contact us at:
            </Text>
            <Text style={footerText}>📞 +91-XXXX-XXXX-XX</Text>
            <Text style={footerText}>📧 info@andamanexcursion.com</Text>
            <Text style={footerSubtext}>
              This email was sent regarding enquiry {enquiryId}. If you have any
              questions, please contact our support team.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

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
  backgroundColor: "#2563eb",
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

const enquiryCard = {
  backgroundColor: "#f3f4f6",
  padding: "20px",
  borderRadius: "8px",
  margin: "24px 0",
};

const enquiryCardTitle = {
  color: "#2563eb",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px",
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
  backgroundColor: "#fef3c7",
  border: "1px solid #ffeaa7",
  borderRadius: "6px",
  padding: "16px",
  color: "#856404",
  fontSize: "14px",
  fontStyle: "italic" as const,
  margin: "0",
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

export default EnquiryConfirmationTemplate;
