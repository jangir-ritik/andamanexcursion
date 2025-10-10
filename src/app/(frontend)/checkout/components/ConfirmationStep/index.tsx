"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { useCheckoutStore } from "@/store/CheckoutStore";
import { BeforeUnloadModal } from "@/components/molecules/BeforeUnloadModal";
import { SectionTitle } from "@/components/atoms/SectionTitle/SectionTitle";
import { DescriptionText } from "@/components/atoms/DescriptionText/DescriptionText";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Download,
  Share2,
  MessageCircle,
  AlertTriangle,
  Clock,
  XCircle,
} from "lucide-react";
import { slotIdToTimeString } from "@/utils/timeUtils";
import type {
  UnifiedBookingData,
  PassengerRequirements,
} from "@/utils/CheckoutAdapter";
import { Location } from "@payload-types";
import styles from "./ConfirmationStep.module.css";

interface ConfirmationStepProps {
  bookingData: UnifiedBookingData;
  requirements: PassengerRequirements;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  bookingData,
  requirements,
}) => {
  const { bookingConfirmation, formData, resetAfterBooking } =
    useCheckoutStore();
  const router = useRouter();

  // Debug logging
  console.log("ConfirmationStep - Data check:", {
    hasBookingConfirmation: !!bookingConfirmation,
    hasFullBookingData: !!bookingConfirmation?.fullBookingData,
    bookingDataItems: bookingData?.items?.length || 0,
    bookedFerries: bookingConfirmation?.fullBookingData?.bookedFerries?.length || 0,
    bookedActivities: bookingConfirmation?.fullBookingData?.bookedActivities?.length || 0,
    bookedBoats: bookingConfirmation?.fullBookingData?.bookedBoats?.length || 0,
  });

  // State for before unload modal
  const [showBeforeUnloadModal, setShowBeforeUnloadModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );

  // Handle browser beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "Your booking confirmation details will be lost if you leave this page.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Handle navigation attempts
  const handleNavigation = (path: string) => {
    setPendingNavigation(path);
    setShowBeforeUnloadModal(true);
  };

  // Handle modal responses
  const handleStayOnPage = () => {
    setShowBeforeUnloadModal(false);
    setPendingNavigation(null);
  };

  const handleLeavePage = () => {
    setShowBeforeUnloadModal(false);
    if (pendingNavigation) {
      resetAfterBooking();
      router.push(pendingNavigation);
    }
  };

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

  // Calculate total price from booking data or bookingConfirmation
  const getTotalPrice = () => {
    // After payment, use fullBookingData
    if (bookingConfirmation?.fullBookingData?.pricing?.totalAmount) {
      return bookingConfirmation.fullBookingData.pricing.totalAmount;
    }
    // During checkout flow, use bookingData
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

  // After payment, we have bookingConfirmation but no bookingData.items
  // So only check bookingConfirmation
  if (!bookingConfirmation) {
    return (
      <div className={styles.confirmationStep}>
        <div className={styles.errorState}>
          <h2>Booking information not available</h2>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      </div>
    );
  }

  // Get status-specific styling and content
  const getStatusConfig = () => {
    switch (bookingConfirmation.status) {
      case "confirmed":
        return {
          icon: <CheckCircle size={48} className={styles.successIcon} />,
          title: "Booking Confirmed!",
          specialWord: "Confirmed!",
          description:
            bookingConfirmation.successMessage ||
            "Your booking has been confirmed. You will receive your e-ticket via WhatsApp shortly.",
          headerClass: styles.successHeader,
          showDownload: true,
        };
      case "pending":
        return {
          icon: <Clock size={48} className={styles.pendingIcon} />,
          title: "Booking Processing",
          specialWord: "Processing",
          description:
            bookingConfirmation.errorMessage ||
            "Your payment was successful but booking is still processing. You will receive confirmation shortly.",
          headerClass: styles.pendingHeader,
          showDownload: false,
        };
      case "failed":
        return {
          icon: <XCircle size={48} className={styles.errorIcon} />,
          title: "Booking Issue",
          specialWord: "Issue",
          description:
            bookingConfirmation.errorMessage ||
            "Your payment was successful but there was an issue with the booking. Our team will contact you shortly.",
          headerClass: styles.errorHeader,
          showDownload: false,
        };
      default:
        return {
          icon: <CheckCircle size={48} className={styles.successIcon} />,
          title: "Booking Confirmed!",
          specialWord: "Confirmed!",
          description:
            "Your booking has been confirmed. You will receive your e-ticket via WhatsApp shortly.",
          headerClass: styles.successHeader,
          showDownload: true,
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Helper function to get user-friendly error messages
  const getErrorTypeMessage = (error: string): string => {
    const lowerError = error.toLowerCase();

    if (
      lowerError.includes("seats not available") ||
      lowerError.includes("seat") ||
      lowerError.includes("already booked")
    ) {
      return "Selected seats are no longer available";
    } else if (
      lowerError.includes("wallet balance") ||
      lowerError.includes("insufficient") ||
      lowerError.includes("balance")
    ) {
      return "Temporary system issue with ferry operator";
    } else if (lowerError.includes("save passengers failed")) {
      return "Issue processing passenger details";
    } else {
      return `Ferry booking error: ${error}`;
    }
  };

  // Helper function to get specific action messages
  const getErrorActionMessage = (error: string): string | null => {
    const lowerError = error.toLowerCase();

    if (
      lowerError.includes("seats not available") ||
      lowerError.includes("seat") ||
      lowerError.includes("already booked")
    ) {
      return "We'll help you select alternative seats or provide a full refund.";
    } else if (
      lowerError.includes("wallet balance") ||
      lowerError.includes("insufficient") ||
      lowerError.includes("balance")
    ) {
      return "Your booking will be processed automatically once the system is restored. Please note down the booking ID for future reference.";
    } else if (lowerError.includes("save passengers failed")) {
      return "Our team will contact you within 2 hours to complete your booking.";
    }
    return null;
  };

  return (
    <div className={styles.confirmationStep}>
      {/* Status Header */}
      <div className={statusConfig.headerClass}>
        {/* <div className={styles.statusIconContainer}>
          {statusConfig.icon}
        </div> */}
        <SectionTitle
          text={statusConfig.title}
          specialWord={statusConfig.specialWord}
          className={styles.title}
          headingLevel="h1"
        />
        <DescriptionText
          className={styles.description}
          text={statusConfig.description}
        />

        {/* Show provider booking details if available */}
        {bookingConfirmation.providerBooking &&
          !bookingConfirmation.providerBooking.success && (
            <div className={styles.providerErrorDetails}>
              <div className={styles.errorBadge}>
                <AlertTriangle size={16} />
                <span>
                  {getErrorTypeMessage(
                    bookingConfirmation.providerBooking.error || ""
                  )}
                </span>
              </div>
              {bookingConfirmation.providerBooking.errorType === "timeout" && (
                <p className={styles.timeoutNote}>
                  The booking may still be processing. We'll update you once
                  confirmed.
                </p>
              )}
              {getErrorActionMessage(
                bookingConfirmation.providerBooking.error || ""
              ) && (
                <p className={styles.actionNote}>
                  {getErrorActionMessage(
                    bookingConfirmation.providerBooking.error || ""
                  )}
                </p>
              )}
            </div>
          )}
      </div>

      {/* Booking Details Cards */}
      <div className={styles.bookingDetailsSection}>
        <div className={styles.bookingHeader}>
          <h3 className={styles.bookingTitle}>
            Booking Details
            {allBookingDetails.length > 0 && 
              ` (${allBookingDetails.length} ${allBookingDetails.length === 1 ? "Item" : "Items"})`
            }
          </h3>
          <div className={styles.bookingId}>
            <span className={styles.bookingIdLabel}>Booking ID:</span>
            <span className={styles.bookingIdValue}>
              {bookingConfirmation.confirmationNumber}
            </span>
          </div>
        </div>

        {/* If no booking details from items, display from fullBookingData */}
        {allBookingDetails.length === 0 && bookingConfirmation?.fullBookingData && (
          <>
            {console.log("Rendering from fullBookingData:", {
              ferries: bookingConfirmation.fullBookingData.bookedFerries,
              activities: bookingConfirmation.fullBookingData.bookedActivities,
              boats: bookingConfirmation.fullBookingData.bookedBoats,
            })}
            {/* Ferry Bookings */}
            {bookingConfirmation.fullBookingData.bookedFerries?.map((ferry: any, index: number) => (
              <div key={`ferry-${index}`} className={styles.bookingDetailsCard}>
                <div className={styles.serviceInfo}>
                  <div className={styles.serviceDetails}>
                    <h4 className={styles.serviceName}>
                      {ferry.ferryName}
                      <span className={styles.activityNumber}>Ferry #{index + 1}</span>
                    </h4>
                    <div className={styles.tripDetailsGrid}>
                      <div className={styles.tripDetail}>
                        <span className={styles.detailLabel}>Route</span>
                        <span className={styles.detailValue}>
                          {ferry.route?.from} → {ferry.route?.to}
                        </span>
                      </div>
                      <div className={styles.tripDetail}>
                        <span className={styles.detailLabel}>Date</span>
                        <span className={styles.detailValue}>
                          {new Date(ferry.schedule?.travelDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.tripDetail}>
                        <span className={styles.detailLabel}>Departure</span>
                        <span className={styles.detailValue}>
                          {ferry.schedule?.departureTime}
                        </span>
                      </div>
                      <div className={styles.tripDetail}>
                        <span className={styles.detailLabel}>Duration</span>
                        <span className={styles.detailValue}>
                          {ferry.schedule?.duration}
                        </span>
                      </div>
                      <div className={styles.tripDetail}>
                        <span className={styles.detailLabel}>Class</span>
                        <span className={styles.detailValue}>
                          {ferry.selectedClass?.className}
                        </span>
                      </div>
                      <div className={styles.tripDetail}>
                        <span className={styles.detailLabel}>Passengers</span>
                        <span className={styles.detailValue}>
                          {ferry.passengers?.adults || 0} Adult{(ferry.passengers?.adults || 0) !== 1 ? 's' : ''}
                          {ferry.passengers?.children > 0 && `, ${ferry.passengers.children} Child${ferry.passengers.children !== 1 ? 'ren' : ''}`}
                        </span>
                      </div>
                      {ferry.providerBooking?.pnr && (
                        <div className={styles.tripDetail}>
                          <span className={styles.detailLabel}>PNR</span>
                          <span className={styles.detailValue}>
                            <strong>{ferry.providerBooking.pnr}</strong>
                          </span>
                        </div>
                      )}
                      {ferry.selectedSeats && ferry.selectedSeats.length > 0 && (
                        <div className={styles.tripDetail}>
                          <span className={styles.detailLabel}>Seats</span>
                          <span className={styles.detailValue}>
                            {ferry.selectedSeats.map((s: any) => s.seatNumber).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Activity Bookings */}
            {bookingConfirmation.fullBookingData.bookedActivities?.map((activity: any, index: number) => (
              <div key={`activity-${index}`} className={styles.bookingDetailsCard}>
                <div className={styles.serviceInfo}>
                  <div className={styles.serviceDetails}>
                    <h4 className={styles.serviceName}>
                      {activity.activity?.title || 'Activity'}
                      <span className={styles.activityNumber}>#{index + 1}</span>
                    </h4>
                    <div className={styles.tripDetailsGrid}>
                      <div className={styles.tripDetail}>
                        <span className={styles.detailLabel}>Location</span>
                        <span className={styles.detailValue}>
                          {activity.activity?.coreInfo?.location?.[0]?.name || 'N/A'}
                        </span>
                      </div>
                      <div className={styles.tripDetail}>
                        <span className={styles.detailLabel}>Time</span>
                        <span className={styles.detailValue}>
                          {activity.scheduledTime ? formatTime(activity.scheduledTime) : 'N/A'}
                        </span>
                      </div>
                      <div className={styles.tripDetail}>
                        <span className={styles.detailLabel}>Duration</span>
                        <span className={styles.detailValue}>
                          {activity.activity?.coreInfo?.duration || 'N/A'}
                        </span>
                      </div>
                      <div className={styles.tripDetail}>
                        <span className={styles.detailLabel}>Passengers</span>
                        <span className={styles.detailValue}>
                          {activity.passengers?.adults || 0} Adult{(activity.passengers?.adults || 0) !== 1 ? 's' : ''}
                          {activity.passengers?.children > 0 && `, ${activity.passengers.children} Child${activity.passengers.children !== 1 ? 'ren' : ''}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Boat Bookings */}
            {bookingConfirmation.fullBookingData.bookedBoats?.map((boat: any, index: number) => (
              <div key={`boat-${index}`} className={styles.bookingDetailsCard}>
                <div className={styles.serviceInfo}>
                  <div className={styles.serviceDetails}>
                    <h4 className={styles.serviceName}>
                      {boat.boatName}
                      <span className={styles.activityNumber}>Boat #{index + 1}</span>
                    </h4>
                    <div className={styles.tripDetailsGrid}>
                      <div className={styles.tripDetail}>
                        <span className={styles.detailLabel}>Route</span>
                        <span className={styles.detailValue}>
                          {boat.route?.from} → {boat.route?.to}
                        </span>
                      </div>
                      <div className={styles.tripDetail}>
                        <span className={styles.detailLabel}>Departure</span>
                        <span className={styles.detailValue}>
                          {boat.schedule?.departureTime}
                        </span>
                      </div>
                      <div className={styles.tripDetail}>
                        <span className={styles.detailLabel}>Passengers</span>
                        <span className={styles.detailValue}>
                          {boat.passengers?.adults || 0} Adult{(boat.passengers?.adults || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

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
            Guests Information ({
              bookingConfirmation?.fullBookingData?.passengers?.length || 
              formData?.members?.length || 
              0
            })
          </h3>
        </div>

        <div className={styles.guestCards}>
          {/* After payment, use passengers from fullBookingData */}
          {bookingConfirmation?.fullBookingData?.passengers ? (
            bookingConfirmation.fullBookingData.passengers.map((passenger: any, index: number) => (
              <div key={passenger.id || index} className={styles.guestCard}>
                <div className={styles.guestHeader}>
                  <h4 className={styles.guestName}>
                    {passenger.fullName}
                    {passenger.isPrimary && <span className={styles.primaryBadge}> (Primary)</span>}
                  </h4>
                  <div className={styles.guestMeta}>
                    <span className={styles.ageGender}>
                      {passenger.age} years • {passenger.gender}
                    </span>
                  </div>
                </div>

                <div className={styles.guestDetailsGrid}>
                  <div className={styles.guestDetail}>
                    <span className={styles.detailLabel}>Contact Number</span>
                    <span className={styles.detailValue}>
                      {passenger.whatsappNumber || "NA"}
                    </span>
                  </div>
                  <div className={styles.guestDetail}>
                    <span className={styles.detailLabel}>Mail ID</span>
                    <span className={styles.detailValue}>
                      {passenger.email || "NA"}
                    </span>
                  </div>
                  <div className={styles.guestDetail}>
                    <span className={styles.detailLabel}>Nationality</span>
                    <span className={styles.detailValue}>
                      {passenger.nationality || "Indian"}
                    </span>
                  </div>
                  {passenger.nationality !== "Indian" && passenger.passportNumber && (
                    <>
                      <div className={styles.guestDetail}>
                        <span className={styles.detailLabel}>Passport Number</span>
                        <span className={styles.detailValue}>
                          {passenger.passportNumber}
                        </span>
                      </div>
                      {passenger.passportExpiry && (
                        <div className={styles.guestDetail}>
                          <span className={styles.detailLabel}>Passport Expiry</span>
                          <span className={styles.detailValue}>
                            {new Date(passenger.passportExpiry).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            /* During checkout flow, use formData */
            (formData?.members || []).map((member) => (
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
                      {member.nationality !== "Indian"
                        ? member.fpassport || "Not provided"
                        : member.passportNumber || "Not required"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Download Actions */}
      <div className={styles.actionsCard}>
        {statusConfig.showDownload && (
          <Button
            variant="primary"
            size="large"
            onClick={handleDownloadPDF}
            icon={<Download size={20} />}
            className={styles.downloadButton}
          >
            Download PDF
          </Button>
        )}

        <Button
          variant="secondary"
          size="large"
          onClick={() => {
            const firstItemType = bookingData?.items?.[0]?.type;
            const targetPath =
              firstItemType === "ferry"
                ? "/ferry"
                : firstItemType === "boat"
                ? "/boat"
                : "/activities";
            handleNavigation(targetPath);
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

      {/* Before Unload Modal */}
      <BeforeUnloadModal
        isVisible={showBeforeUnloadModal}
        onStay={handleStayOnPage}
        onLeave={handleLeavePage}
      />
    </div>
  );
};
