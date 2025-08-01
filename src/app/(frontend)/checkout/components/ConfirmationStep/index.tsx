"use client";
import React from "react";
import { Download } from "lucide-react";
import {
  useCheckoutStore,
  useMembers,
  useCheckoutItems,
  useBookingConfirmation,
} from "@/store/CheckoutStore";
import { SectionTitle } from "@/components/atoms/SectionTitle/SectionTitle";
import { Button } from "@/components/atoms/Button/Button";
import styles from "./ConfirmationStep.module.css";
import { DescriptionText } from "@/components/atoms";

export const ConfirmationStep: React.FC = () => {
  const { getTotalPrice } = useCheckoutStore();
  const members = useMembers();
  const checkoutItems = useCheckoutItems();
  const bookingConfirmation = useBookingConfirmation();

  // Get all booking details
  const getAllBookingDetails = () => {
    if (checkoutItems.length === 0) return [];

    return checkoutItems
      .map((item, index) => {
        if (item.activityBooking) {
          const { activity, searchParams } = item.activityBooking;
          return {
            id: item.activityBooking.id,
            index: index,
            type: "Activity" as const,
            title: activity.title,
            location: activity.coreInfo.location[0]?.name || "N/A",
            date: searchParams.date,
            time: searchParams.time,
            duration: activity.coreInfo.duration,
            image: activity.media.featuredImage?.url || null,
            price: item.activityBooking.totalPrice,
            passengers: {
              adults: searchParams.adults || 0,
              children: searchParams.children || 0,
              total: (searchParams.adults || 0) + (searchParams.children || 0),
            },
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  };

  const allBookingDetails = getAllBookingDetails();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Handle download PDF
  const handleDownloadPDF = () => {
    console.log("Download PDF functionality to be implemented");
    alert("PDF download functionality will be implemented");
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  if (!bookingConfirmation || allBookingDetails.length === 0) {
    return (
      <div className={styles.confirmationStep}>
        <div className={styles.errorState}>
          <h2>Booking information not available</h2>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.confirmationStep}>
      {/* Success Header */}
      <div className={styles.successHeader}>
        <SectionTitle
          text="Booking Confirmed!"
          specialWord="Confirmed"
          className={styles.title}
        />
        <DescriptionText text="Your booking has been confirmed. You will receive your e-ticket via WhatsApp shortly." />
      </div>

      {/* Booking Details Cards */}
      <div className={styles.bookingDetailsSection}>
        <div className={styles.bookingHeader}>
          <h3 className={styles.bookingTitle}>
            Booking Details ({allBookingDetails.length}{" "}
            {allBookingDetails.length === 1 ? "Activity" : "Activities"})
          </h3>
          <div className={styles.bookingId}>
            <span className={styles.bookingIdLabel}>Booking ID:</span>
            <span className={styles.bookingIdValue}>
              {bookingConfirmation.confirmationNumber}
            </span>
          </div>
        </div>

        {allBookingDetails.map((bookingDetail, index) => (
          <div key={bookingDetail.id} className={styles.bookingDetailsCard}>
            <div className={styles.serviceInfo}>
              {bookingDetail.image && (
                <div className={styles.serviceImage}>
                  <img
                    src={bookingDetail.image}
                    alt={bookingDetail.title}
                    className={styles.image}
                  />
                </div>
              )}
              <div className={styles.serviceDetails}>
                <h4 className={styles.serviceName}>
                  {bookingDetail.title}
                  <span className={styles.activityNumber}>#{index + 1}</span>
                </h4>
                <div className={styles.tripDetailsGrid}>
                  <div className={styles.tripDetail}>
                    <span className={styles.detailLabel}>Location</span>
                    <span className={styles.detailValue}>
                      {bookingDetail.location}
                    </span>
                  </div>
                  <div className={styles.tripDetail}>
                    <span className={styles.detailLabel}>Time</span>
                    <span className={styles.detailValue}>
                      {formatTime(bookingDetail.time)}
                    </span>
                  </div>
                  <div className={styles.tripDetail}>
                    <span className={styles.detailLabel}>Date</span>
                    <span className={styles.detailValue}>
                      {formatDate(bookingDetail.date)}
                    </span>
                  </div>
                  <div className={styles.tripDetail}>
                    <span className={styles.detailLabel}>Duration</span>
                    <span className={styles.detailValue}>
                      {bookingDetail.duration}
                    </span>
                  </div>
                  <div className={styles.tripDetail}>
                    <span className={styles.detailLabel}>Passengers</span>
                    <span className={styles.detailValue}>
                      {bookingDetail.passengers.adults} Adults
                      {bookingDetail.passengers.children > 0 &&
                        `, ${bookingDetail.passengers.children} Children`}
                    </span>
                  </div>
                  <div className={styles.tripDetail}>
                    <span className={styles.detailLabel}>Price</span>
                    <span className={styles.detailValue}>
                      ₹{bookingDetail.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Total Price Summary */}
        <div className={styles.totalPriceCard}>
          <div className={styles.totalPriceRow}>
            <span className={styles.totalLabel}>Total Amount:</span>
            <span className={styles.totalValue}>
              ₹{getTotalPrice().toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Guest Information */}
      <div className={styles.guestInfoCard}>
        <div className={styles.guestInfoHeader}>
          <h3 className={styles.sectionTitleOrange}>
            Guests Information ({members.length})
          </h3>
        </div>

        <div className={styles.guestCards}>
          {members.map((member) => (
            <div key={member.id} className={styles.guestCard}>
              <div className={styles.guestHeader}>
                <h4 className={styles.guestName}>{member.fullName}</h4>
                <div className={styles.guestMeta}>
                  <span className={styles.ageGender}>
                    {member.age} years • {member.gender}
                  </span>
                </div>
              </div>

              <div className={styles.guestDetailsGrid}>
                <div className={styles.guestDetail}>
                  <span className={styles.detailLabel}>Contact Number</span>
                  <span className={styles.detailValue}>
                    {member.whatsappNumber || "NA"}
                  </span>
                </div>
                <div className={styles.guestDetail}>
                  <span className={styles.detailLabel}>Mail ID</span>
                  <span className={styles.detailValue}>
                    {member.email || "NA"}
                  </span>
                </div>
                <div className={styles.guestDetail}>
                  <span className={styles.detailLabel}>Passport Number</span>
                  <span className={styles.detailValue}>
                    {member.passportNumber}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download Actions */}
      <div className={styles.actionsCard}>
        <Button
          variant="primary"
          size="large"
          onClick={handleDownloadPDF}
          icon={<Download size={20} />}
          className={styles.downloadButton}
        >
          Download PDF
        </Button>
      </div>

      {/* Important Instructions */}
      <div className={styles.instructionsCard}>
        <h3 className={styles.instructionsTitle}>Important Instructions</h3>

        <div className={styles.instructionsGrid}>
          <div className={styles.instructionCategory}>
            <h4 className={styles.categoryTitle}>Arrival</h4>
            <ul className={styles.instructionsList}>
              <li>
                Please arrive 30 minutes before the scheduled departure time
              </li>
              <li>
                Report to the designated boarding point with valid ID proof
              </li>
            </ul>
          </div>

          <div className={styles.instructionCategory}>
            <h4 className={styles.categoryTitle}>Requirements</h4>
            <ul className={styles.instructionsList}>
              <li>
                Carry original photo ID proof (Passport/Aadhar/Driving License)
              </li>
              <li>Keep your e-ticket ready for verification</li>
            </ul>
          </div>

          <div className={styles.instructionCategory}>
            <h4 className={styles.categoryTitle}>Updates</h4>
            <ul className={styles.instructionsList}>
              <li>Weather conditions may affect departure schedule</li>
              <li>Updates will be sent via WhatsApp/SMS</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
