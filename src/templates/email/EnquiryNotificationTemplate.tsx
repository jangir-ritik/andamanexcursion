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

interface EnquiryNotificationTemplateProps extends EnquiryData {}

export const EnquiryNotificationTemplate: React.FC<
  EnquiryNotificationTemplateProps
> = ({
  enquiryId,
  fullName,
  email,
  phone,
  selectedPackage,
  message,
  additionalMessage,
  packageInfo,
  enquirySource,
  submissionDate,
}) => {
  const previewText = `New Enquiry ${enquiryId} - Andaman Excursion`;

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

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>🏝️ Andaman Excursion</Text>
            <Text style={headerSubtitle}>New Enquiry Received</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>New Enquiry Received</Heading>

            {/* Alert Box */}
            <Section style={alertBox}>
              <Text style={alertText}>
                <strong>Enquiry ID:</strong> {enquiryId}
              </Text>
              <Text style={alertText}>
                <strong>Source:</strong> {enquirySource || "Unknown"}
              </Text>
              <Text style={alertText}>
                <strong>Submitted:</strong> {formatDate(submissionDate)}
              </Text>
            </Section>

            {/* Customer Information */}
            <Section style={infoSection}>
              <Heading style={h2}>Customer Information</Heading>
              <Text style={detailText}>
                <strong>Name:</strong> {fullName}
              </Text>
              <Text style={detailText}>
                <strong>Email:</strong> {email}
              </Text>
              <Text style={detailText}>
                <strong>Phone:</strong> {phone}
              </Text>
            </Section>

            {/* Package Information */}
            {selectedPackage && (
              <Section style={infoSection}>
                <Heading style={h2}>Package Information</Heading>
                <Text style={detailText}>
                  <strong>Package:</strong> {selectedPackage}
                </Text>
                {packageInfo?.price && (
                  <Text style={detailText}>
                    <strong>Price:</strong> ₹
                    {packageInfo.price.toLocaleString()}
                  </Text>
                )}
                {packageInfo?.period && (
                  <Text style={detailText}>
                    <strong>Duration:</strong> {packageInfo.period}
                  </Text>
                )}
              </Section>
            )}

            {/* Customer Message */}
            {message && (
              <Section style={infoSection}>
                <Heading style={h2}>Customer Message</Heading>
                <Text style={messageText}>{message}</Text>
              </Section>
            )}

            {/* Additional Message */}
            {additionalMessage && (
              <Section style={infoSection}>
                <Heading style={h2}>Additional Message</Heading>
                <Text style={messageText}>{additionalMessage}</Text>
              </Section>
            )}

            {/* Action Button */}
            <Section style={buttonSection}>
              <Button
                style={button}
                href={`${process.env.NEXT_PUBLIC_URL}/admin/collections/enquiries/${enquiryId}`}
              >
                View in Admin Panel
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              This is an automated notification for enquiry {enquiryId}.
            </Text>
            <Text style={footerSubtext}>
              Please respond to the customer within 24 hours.
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
  backgroundColor: "#dc2626",
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

const alertBox = {
  backgroundColor: "#fee2e2",
  borderLeft: "4px solid #dc2626",
  padding: "15px",
  margin: "20px 0",
};

const alertText = {
  color: "#dc2626",
  fontSize: "14px",
  margin: "0 0 8px",
};

const infoSection = {
  margin: "24px 0",
};

const detailText = {
  color: "#555",
  fontSize: "14px",
  margin: "0 0 8px",
};

const messageText = {
  backgroundColor: "#f9fafb",
  padding: "15px",
  borderRadius: "8px",
  color: "#555",
  fontSize: "14px",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "40px 0",
};

const button = {
  backgroundColor: "#2563eb",
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

export default EnquiryNotificationTemplate;
