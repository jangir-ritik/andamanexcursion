"use client";
import React from "react";
import { Edit2, ArrowUpRight } from "lucide-react";
import {
  useCheckoutStore,
  useMembers,
  useCheckoutItems,
} from "@/store/CheckoutStore";
import { SectionTitle } from "@/components/atoms/SectionTitle/SectionTitle";
import { Button } from "@/components/atoms/Button/Button";
import { cn } from "@/utils/cn";
import styles from "./ReviewStep.module.css";

export const ReviewStep: React.FC = () => {
  const {
    prevStep,
    submitBooking,
    setCurrentStep,
    getTotalPrice,
    getTotalPassengers,
    termsAccepted,
  } = useCheckoutStore();
  const members = useMembers();
  const checkoutItems = useCheckoutItems();
  const { isSubmitting } = useCheckoutStore();

  // Get booking details from checkout items
  const getBookingDetails = () => {
    if (checkoutItems.length === 0) return null;

    const firstItem = checkoutItems[0];
    if (firstItem.activityBooking) {
      const { activity, searchParams } = firstItem.activityBooking;
      return {
        type: "Activity" as const,
        title: activity.title,
        location: activity.coreInfo.location[0]?.name || "N/A",
        date: searchParams.date,
        time: searchParams.time,
        duration: activity.coreInfo.duration,
        adults: searchParams.adults,
        children: searchParams.children,
        infants: searchParams.infants,
        image: activity.media.featuredImage?.url || null,
      };
    } else if (firstItem.ferryBooking) {
      const ferry = firstItem.ferryBooking;
      return {
        type: "Ferry" as const,
        title: `${ferry.fromLocation} to ${ferry.toLocation}`,
        location: `${ferry.fromLocation} - ${ferry.toLocation}`,
        date: ferry.date,
        time: ferry.time,
        duration: "N/A",
        adults: ferry.adults,
        children: ferry.children,
        infants: ferry.infants,
        image: null,
      };
    }

    return null;
  };

  const bookingDetails = getBookingDetails();

  // Handle edit member
  const handleEditMember = () => {
    setCurrentStep(1);
  };

  // Handle proceed to booking
  const handleProceedToBooking = async () => {
    if (!termsAccepted || members.length === 0) {
      return;
    }

    await submitBooking();
  };

  // Validate that we can proceed
  const canProceed = () => {
    return (
      termsAccepted &&
      members.length > 0 &&
      members.every(
        (member) =>
          member.fullName &&
          member.age &&
          member.gender &&
          member.nationality &&
          member.passportNumber &&
          (member.isPrimary ? member.whatsappNumber && member.email : true)
      )
    );
  };

  // Group members into basic details and contact details
  const primaryMember = members.find((member) => member.isPrimary);
  const otherMembers = members.filter((member) => !member.isPrimary);

  const renderMemberBasicDetails = (memberList: any, title: any) => (
    <div className={styles.membersCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <button className={styles.editButton} onClick={handleEditMember}>
          Edit Details
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className={styles.membersList}>
        {memberList.map((member: any, index: any) => (
          <div key={member.id}>
            {/* Basic Info Row */}
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Full Name as per ID</span>
                <span className={styles.value}>
                  {member.fullName || `Member ${index + 1}`}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Enter Age</span>
                <span className={styles.value}>{member.age}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Gender</span>
                <span className={styles.value}>{member.gender}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Nationality</span>
                <span className={styles.value}>{member.nationality}</span>
              </div>
            </div>

            {/* Passport Row */}
            <div className={styles.detailsGrid} style={{ marginTop: "24px" }}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Passport Number</span>
                <span className={styles.value}>{member.passportNumber}</span>
              </div>
            </div>

            {/* Contact Details for Primary Member */}
            {member.isPrimary && (
              <>
                <div style={{ marginTop: "24px", marginBottom: "16px" }}>
                  <h4 className={styles.cardTitle}>Contact Details</h4>
                </div>
                <div className={styles.detailsGrid}>
                  {member.whatsappNumber && (
                    <div className={styles.detailItem}>
                      <span className={styles.label}>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          Whatsapp Number
                        </span>
                      </span>
                      <span className={styles.value}>
                        {member.whatsappNumber}
                      </span>
                    </div>
                  )}
                  {member.email && (
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Email ID</span>
                      <span className={styles.value}>{member.email}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.reviewStep}>
      <div className={styles.header}>
        <SectionTitle
          text="Traveller Details"
          specialWord="Details"
          className={styles.title}
        />
        <p className={styles.description}>
          Almost there! Give your details a quick look
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.leftColumn}>
          {/* Render member cards separately for each person */}
          {members.map((member, index) =>
            renderMemberBasicDetails([member], "Basic Details")
          )}

          {/* Important Instructions */}
          <div className={styles.instructionsCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Important Instructions</h3>
            </div>
            <ul className={styles.instructionsList}>
              <li>Please carry valid photo ID proof</li>
              <li>Arrive 30 minutes before departure time</li>
              <li>E-ticket will be sent to registered WhatsApp</li>
              <li>No-show will result in full cancellation charges</li>
              <li>Weather conditions may affect schedule</li>
            </ul>
          </div>
        </div>

        <div className={styles.rightColumn}>
          {/* Billing Summary */}
          <div className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Billing Summary</h3>
            </div>

            <div className={styles.bookingInfo}>
              {/* Activity Items */}
              {checkoutItems.map((item, index) => {
                if (item.activityBooking) {
                  const { activity, searchParams } = item.activityBooking;
                  return (
                    <div
                      key={index}
                      className={styles.bookingItem}
                    >
                      {activity.media.featuredImage?.url && (
                        <div className={styles.bookingImage}>
                          <img
                            src={activity.media.featuredImage.url}
                            alt={activity.title}
                            className={styles.image}
                          />
                        </div>
                      )}
                      <div className={styles.bookingDetails}>
                        <h4 className={styles.bookingTitle}>
                          {activity.title}
                        </h4>
                      </div>
                    </div>
                  );
                }
                return null;
              })}

              {/* Date and Time Info */}
              {bookingDetails && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    📅{" "}
                    {new Date(bookingDetails.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    🕐 {bookingDetails.time}
                  </div>
                </div>
              )}

              {/* Type and Duration */}
              {bookingDetails && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                  }}
                >
                  <span>Type: Shore diving</span>
                  <span>Duration: {bookingDetails.duration}</span>
                </div>
              )}

              <div
                style={{ borderTop: "1px solid #E1E1E1", paddingTop: "24px" }}
              >
                {/* Price Breakdown */}
                <div className={styles.priceDetails}>
                  {checkoutItems.map((item, index) => {
                    if (item.activityBooking) {
                      return (
                        <div key={index} className={styles.priceItem}>
                          <span className={styles.priceLabel}>
                            {item.activityBooking.activity.title}
                          </span>
                          <span className={styles.priceValue}>
                            ₹
                            {(
                              getTotalPrice() / checkoutItems.length
                            ).toLocaleString()}
                            .00
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}

                  <div
                    style={{
                      borderTop: "1px solid #B0B0B0",
                      paddingTop: "16px",
                      marginTop: "16px",
                    }}
                  >
                    <div className={styles.priceTotal}>
                      <span className={styles.totalLabel}>Total</span>
                      <span className={styles.totalValue}>
                        ₹{getTotalPrice().toLocaleString()}.00
                      </span>
                    </div>
                  </div>
                </div>

                {/* Proceed Button */}
                <button
                  className={styles.proceedButton}
                  onClick={handleProceedToBooking}
                  disabled={!canProceed() || isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Proceed to Pay"}
                  <ArrowUpRight size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
