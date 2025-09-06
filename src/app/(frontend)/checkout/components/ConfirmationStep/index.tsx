"use client";
import React from "react";
import { Download } from "lucide-react";
import { useSimpleCheckoutStore } from "@/store/SimpleCheckoutStore";
import { SectionTitle } from "@/components/atoms/SectionTitle/SectionTitle";
import { Button } from "@/components/atoms/Button/Button";
import styles from "./ConfirmationStep.module.css";
import { DescriptionText } from "@/components/atoms";
import { slotIdToTimeString } from "@/utils/timeUtils";
import type {
  UnifiedBookingData,
  PassengerRequirements,
} from "@/utils/CheckoutAdapter";
import { Location } from "@payload-types";
import { useCheckoutSession } from "@/store/SimpleCheckoutStore";

interface ConfirmationStepProps {
  bookingData: UnifiedBookingData;
  requirements: PassengerRequirements;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  bookingData,
  requirements,
}) => {
  const { bookingConfirmation, formData, resetAfterBooking } =
    useSimpleCheckoutStore();

  const { resetForNewBooking } = useCheckoutSession();

  // Get all booking details from the new unified data structure
  const getAllBookingDetails = () => {
    if (!bookingData?.items || bookingData.items.length === 0) return [];

    return bookingData.items
      .map((item, index) => {
        if (item.type === "activity") {
          return {
            id: item.id,
            index: index,
            type: "Activity" as const,
            title: item.title,
            location:
              item.location ||
              (typeof item.activity?.coreInfo?.location?.[0] === "string"
                ? item.activity.coreInfo.location[0]
                : item.activity?.coreInfo?.location?.[0]?.name) ||
              "N/A",
            date: item.date,
            time: item.time,
            duration: item.activity?.coreInfo?.duration || "N/A",
            image:
              typeof item.activity?.media?.featuredImage === "string"
                ? item.activity.media.featuredImage
                : item.activity?.media?.featuredImage?.url || null,
            price: item.price,
            passengers: {
              adults: item.passengers.adults || 0,
              children: item.passengers.children || 0,
              total:
                (item.passengers.adults || 0) + (item.passengers.children || 0),
            },
          };
        } else if (item.type === "ferry") {
          return {
            id: item.id,
            index: index,
            type: "Ferry" as const,
            title: item.title,
            location: `${item.ferry?.fromLocation || "N/A"} → ${
              item.ferry?.toLocation || "N/A"
            }`,
            date: item.date,
            time: item.ferry?.schedule?.departureTime || item.time || "N/A",
            duration: item.ferry?.schedule?.duration || "2h 30m",
            image: null,
            price: item.price,
            passengers: {
              adults: item.passengers.adults || 0,
              children: item.passengers.children || 0,
              total:
                (item.passengers.adults || 0) + (item.passengers.children || 0),
            },
            // Add ferry-specific details
            seats: item.ferry?.selectedSeats || [],
            ferryName: item.ferry?.ferryName || "Ferry",
            class:
              item.ferry?.selectedClass?.className ||
              item.ferry?.selectedClass?.name ||
              "N/A",
          };
        } else if (item.type === "boat") {
          return {
            id: item.id,
            index: index,
            type: "Boat" as const,
            title: item.title,
            location: `${item.boat?.route?.from || "N/A"} → ${
              item.boat?.route?.to || "N/A"
            }`,
            date: item.date,
            time: item.selectedTime || item.time || "N/A",
            duration: "1h 30m", // Default boat duration
            image: null,
            price: item.price,
            passengers: {
              adults: item.passengers.adults || 0,
              children: item.passengers.children || 0,
              total:
                (item.passengers.adults || 0) + (item.passengers.children || 0),
            },
            // Add boat-specific details
            boatName: item.boat?.name || "Boat",
            route: `${item.boat?.route?.from || "N/A"} → ${
              item.boat?.route?.to || "N/A"
            }`,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  };

  const allBookingDetails = getAllBookingDetails();

  // Calculate total price from booking data
  const getTotalPrice = () => {
    return bookingData?.totalPrice || 0;
  };

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
  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "N/A";

    // Handle slug format (e.g., "07-00", "14-30")
    if (timeString.includes("-")) {
      return slotIdToTimeString(timeString);
    }

    // Handle HH:MM format
    const [hours, minutes] = timeString.split(":");
    if (!hours || !minutes) return "N/A";
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes.padStart(2, "0")} ${ampm}`;
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
          specialWord="Confirmed!"
          className={styles.title}
          headingLevel="h1"
        />
        <DescriptionText text="Your booking has been confirmed. You will receive your e-ticket via WhatsApp shortly." />
      </div>

      {/* Booking Details Cards */}
      <div className={styles.bookingDetailsSection}>
        <div className={styles.bookingHeader}>
          <h3 className={styles.bookingTitle}>
            Booking Details ({allBookingDetails.length}{" "}
            {allBookingDetails.length === 1 ? "Item" : "Items"})
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
                      {typeof bookingDetail.location === "string"
                        ? bookingDetail.location
                        : (bookingDetail.location as Location[])[0]?.name}
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
                  {/* Ferry-specific details */}
                  {bookingDetail.type === "Ferry" && (
                    <>
                      {(bookingDetail as any).class && (
                        <div className={styles.tripDetail}>
                          <span className={styles.detailLabel}>Class</span>
                          <span className={styles.detailValue}>
                            {(bookingDetail as any).class}
                          </span>
                        </div>
                      )}
                      {(bookingDetail as any).seats?.length > 0 && (
                        <div className={styles.tripDetail}>
                          <span className={styles.detailLabel}>Seats</span>
                          <span className={styles.detailValue}>
                            {(bookingDetail as any).seats.join(", ")}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {/* Boat-specific details */}
                  {bookingDetail.type === "Boat" && (
                    <div className={styles.tripDetail}>
                      <span className={styles.detailLabel}>Boat</span>
                      <span className={styles.detailValue}>
                        {(bookingDetail as any).boatName}
                      </span>
                    </div>
                  )}
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
            Guests Information ({formData?.members?.length || 0})
          </h3>
        </div>

        <div className={styles.guestCards}>
          {(formData?.members || []).map((member) => (
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

        <Button
          variant="secondary"
          size="large"
          onClick={() => {
            resetForNewBooking();
            // resetAfterBooking();
            // Navigate back to home or booking page
            const firstItemType = bookingData?.items?.[0]?.type;
            window.location.href =
              firstItemType === "ferry"
                ? "/ferry"
                : firstItemType === "boat"
                ? "/boat"
                : "/activities";
          }}
          className={styles.newBookingButton}
        >
          Make Another Booking
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
