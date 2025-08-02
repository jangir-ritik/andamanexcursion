"use client";
import React, { JSX, useState } from "react";
import { Edit2, Users, Info } from "lucide-react";
import { useCheckoutStore, useCheckoutItems } from "@/store/CheckoutStore";
import { SectionTitle } from "@/components/atoms/SectionTitle/SectionTitle";
import { Button } from "@/components/atoms/Button/Button";
import styles from "./ReviewStep.module.css";
import PaymentButton from "@/components/checkout/PaymentButton";

// Types for better type safety
interface BookingDetail {
  index: number;
  type: "Activity" | "Ferry";
  title: string;
  location: string;
  date: string;
  time: string;
  duration: string;
  adults: number;
  children: number;
  totalPassengers: number;
  price: number;
  image: string | null;
}

export const ReviewStep: React.FC = () => {
  const { setCurrentStep, getTotalPrice, isLoading, persistedFormData } =
    useCheckoutStore();

  const checkoutItems = useCheckoutItems();

  const [showMemberMapping, setShowMemberMapping] = useState(false);
  // Get members from persisted form data
  const members = persistedFormData?.members || [];
  const termsAccepted = persistedFormData?.termsAccepted || false;

  // Get booking details from checkout items
  const getAllBookingDetails = (): BookingDetail[] => {
    return checkoutItems
      .map((item, index): BookingDetail | null => {
        if (item.activityBooking) {
          const { activity, searchParams } = item.activityBooking;
          return {
            index,
            type: "Activity" as const,
            title: activity.title,
            location: activity.coreInfo.location[0]?.name || "N/A",
            date: searchParams.date,
            time: searchParams.time,
            duration: activity.coreInfo.duration,
            adults: searchParams.adults,
            children: searchParams.children,
            totalPassengers: searchParams.adults + searchParams.children,
            price: item.activityBooking.totalPrice,
            image: activity.media.featuredImage?.url || null,
          };
        } else if (item.ferryBooking) {
          const ferry = item.ferryBooking;
          return {
            index,
            type: "Ferry" as const,
            title: `${ferry.fromLocation} to ${ferry.toLocation}`,
            location: `${ferry.fromLocation} - ${ferry.toLocation}`,
            date: ferry.date,
            time: ferry.time,
            duration: "N/A",
            adults: ferry.adults,
            children: ferry.children,
            totalPassengers: ferry.adults + ferry.children,
            price: ferry.totalPrice,
            image: null,
          };
        }
        return null;
      })
      .filter((item): item is BookingDetail => item !== null);
  };

  const allBookingDetails = getAllBookingDetails();

  // Handle edit member
  const handleEditMember = () => {
    setCurrentStep(1);
  };

  // Validate that we can proceed
  const canProceed = () => {
    return termsAccepted && members.length > 0 && persistedFormData;
  };

  // Show loading state if no form data
  if (!persistedFormData) {
    return (
      <div className={styles.reviewStep}>
        <div className={styles.header}>
          <SectionTitle
            text="Review Your Booking"
            specialWord="Booking"
            className={styles.title}
          />
          <p className={styles.description}>
            No booking data found. Please complete the passenger details first.
          </p>
        </div>
        <div className={styles.content}>
          <Button onClick={() => setCurrentStep(1)}>
            Go to Passenger Details
          </Button>
        </div>
      </div>
    );
  }

  // Render member details with improved UX
  const renderMemberDetails = (): JSX.Element[] => {
    const memberSections: JSX.Element[] = [];

    // Activity-specific member assignment
    memberSections.push(
      <div key="member-info" className={styles.memberInfoCard}>
        <div className={styles.infoHeader}>
          <Info size={20} className={styles.infoIcon} />
          <h3>Passenger Assignment</h3>
        </div>
        <div className={styles.infoContent}>
          <p>
            <strong>Assignment Method:</strong> Activity-specific passenger
            selection
          </p>
          <p>
            <strong>Total passengers:</strong> {members.length} passengers for{" "}
            {allBookingDetails.length} activities
          </p>
          <button
            className={styles.mapPassengersButton}
            onClick={() => setShowMemberMapping(!showMemberMapping)}
          >
            {showMemberMapping ? "Hide" : "Show"} Assignment Details
          </button>
        </div>
      </div>
    );

    // Activity breakdown (collapsible)
    if (showMemberMapping) {
      memberSections.push(
        <div key="activity-breakdown" className={styles.activityBreakdown}>
          <h4>Activity Assignment Breakdown:</h4>
          {allBookingDetails.map((activity, activityIndex) => {
            const assignedMembers = members.filter(
              (member) =>
                member.selectedActivities &&
                member.selectedActivities.includes(activityIndex)
            );

            return (
              <div key={activityIndex} className={styles.activityRequirement}>
                <div className={styles.activityInfo}>
                  <span className={styles.activityName}>{activity.title}</span>
                  <span className={styles.passengerCount}>
                    Required: {activity.adults} adults, {activity.children}{" "}
                    children
                  </span>
                </div>
                <div className={styles.assignedCount}>
                  Assigned: {assignedMembers.length} passengers
                  {assignedMembers.length < activity.totalPassengers && (
                    <span className={styles.warningText}>
                      {" "}
                      (⚠️ Insufficient)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Activity-specific member details sections
    allBookingDetails.forEach((activity, activityIndex) => {
      const assignedMembers = members.filter(
        (member) =>
          member.selectedActivities &&
          member.selectedActivities.includes(activityIndex)
      );

      if (assignedMembers.length === 0) return;

      memberSections.push(
        <div
          key={`activity-${activityIndex}`}
          className={styles.memberDetailsSection}
        >
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <Users size={20} />
              {activity.title} - {assignedMembers.length} Passengers
            </h3>
            <button className={styles.editButton} onClick={handleEditMember}>
              Edit Assignment
              <Edit2 size={16} />
            </button>
          </div>

          <div className={styles.activityDetails}>
            <div className={styles.activityMeta}>
              <span>
                <strong>Date:</strong>{" "}
                {new Date(activity.date).toLocaleDateString()}
              </span>
              <span>
                <strong>Location:</strong> {activity.location}
              </span>
              <span>
                <strong>Required:</strong> {activity.totalPassengers} passengers
              </span>
            </div>
          </div>

          <div className={styles.membersList}>
            {assignedMembers.map((member, memberIndex) => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.memberCardHeader}>
                  <div className={styles.memberInfo}>
                    <h4 className={styles.memberName}>
                      {member.fullName || `Passenger ${memberIndex + 1}`}
                      {member.isPrimary && (
                        <span className={styles.primaryBadge}>
                          Primary Contact
                        </span>
                      )}
                    </h4>
                    <p className={styles.memberSummary}>
                      {member.age} years • {member.gender || "Not specified"} •{" "}
                      {member.nationality}
                    </p>
                  </div>
                </div>

                <div className={styles.memberCardContent}>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Full Name as per ID</span>
                      <span className={styles.value}>
                        {member.fullName || "Not provided"}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Age</span>
                      <span className={styles.value}>{member.age}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Gender</span>
                      <span className={styles.value}>
                        {member.gender || "Not specified"}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Nationality</span>
                      <span className={styles.value}>{member.nationality}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Passport Number</span>
                      <span className={styles.value}>
                        {member.passportNumber || "Not provided"}
                      </span>
                    </div>
                  </div>

                  {member.isPrimary && (
                    <div className={styles.contactSection}>
                      <h5 className={styles.contactTitle}>
                        Contact Information
                      </h5>
                      <div className={styles.contactGrid}>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>WhatsApp Number</span>
                          <span className={styles.value}>
                            {member.whatsappNumber || "Not provided"}
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Email ID</span>
                          <span className={styles.value}>
                            {member.email || "Not provided"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    });

    return memberSections;
  };

  return (
    <div className={styles.reviewStep}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            <h3>Processing Payment...</h3>
            <p>
              Please wait while we process your booking. Do not refresh the
              page.
            </p>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <SectionTitle
          text="Review Your Booking"
          specialWord="Booking"
          className={styles.title}
        />
        <p className={styles.description}>
          Please review your passenger details and booking information
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.leftColumn}>
          {/* Improved member details */}
          {renderMemberDetails()}

          {/* Important Instructions */}
          <div className={styles.instructionsCard}>
            <h3 className={styles.instructionsTitle}>Important Instructions</h3>

            <div className={styles.instructionsGrid}>
              <div className={styles.instructionCategory}>
                <h4 className={styles.categoryTitle}>Arrival</h4>
                <ul className={styles.instructionsList}>
                  <li>
                    Arrive 30 minutes before departure time for each activity
                  </li>
                  <li>
                    Report to the designated boarding point with valid ID proof
                  </li>
                </ul>
              </div>

              <div className={styles.instructionCategory}>
                <h4 className={styles.categoryTitle}>Requirements</h4>
                <ul className={styles.instructionsList}>
                  <li>Please carry valid photo ID proof for all passengers</li>
                  <li>
                    Each passenger is assigned to specific activities as
                    selected
                  </li>
                </ul>
              </div>

              <div className={styles.instructionCategory}>
                <h4 className={styles.categoryTitle}>Updates</h4>
                <ul className={styles.instructionsList}>
                  <li>E-tickets will be sent to registered WhatsApp</li>
                  <li>Primary contact will receive all communications</li>
                  <li>Weather conditions may affect schedule</li>
                  <li>No-show will result in full cancellation charges</li>
                </ul>
              </div>
            </div>
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
              {allBookingDetails.map((item, index) => {
                if (!item || item.type !== "Activity") return null;

                return (
                  <div key={index} className={styles.bookingItem}>
                    {item.image && (
                      <div className={styles.bookingImage}>
                        <img
                          src={item.image}
                          alt={item.title}
                          className={styles.image}
                        />
                      </div>
                    )}
                    <div className={styles.bookingDetails}>
                      <h4 className={styles.bookingTitle}>{item.title}</h4>
                      <p className={styles.bookingLocation}>
                        Location: {item.location}
                      </p>
                      <p className={styles.bookingDateTime}>
                        Date:{" "}
                        {new Date(item.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        | Time: {item.time}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div
                style={{
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "var(--space-6)",
                }}
              >
                {/* Price Breakdown */}
                <div className={styles.priceDetails}>
                  {allBookingDetails.map((item, index) => {
                    if (!item) return null;

                    return (
                      <div key={index} className={styles.priceItem}>
                        <span className={styles.priceLabel}>
                          {item.title} ({item.totalPassengers} pax)
                        </span>
                        <span className={styles.priceValue}>
                          ₹{item.price.toLocaleString()}.00
                        </span>
                      </div>
                    );
                  })}

                  <div style={{ marginBottom: "var(--space-6)" }}>
                    <div className={styles.priceTotal}>
                      <span className={styles.totalLabel}>Total</span>
                      <span className={styles.totalValue}>
                        ₹{getTotalPrice().toLocaleString()}.00
                      </span>
                    </div>
                  </div>
                </div>

                {/* Proceed Button */}
                <PaymentButton
                  className={styles.proceedButton}
                  disabled={!canProceed() || isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
