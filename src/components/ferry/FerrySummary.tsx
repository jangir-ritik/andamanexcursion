import React from "react";
import { Button } from "@/components/atoms";
import {
  UnifiedFerryResult,
  FerryClass,
} from "@/types/FerryBookingSession.types";
import { ArrowLeft, AlertCircle, CheckCircle, Ship, Clock } from "lucide-react";
import styles from "./FerrySummary.module.css";

interface FerrySearchParams {
  adults: number;
  children: number;
  infants: number;
}

interface FerrySummaryProps {
  ferry: UnifiedFerryResult;
  selectedClass: FerryClass | null;
  selectedSeats: string[];
  searchParams: FerrySearchParams;
  onBack: () => void;
  onCheckout: () => void;
}

export const FerrySummary: React.FC<FerrySummaryProps> = ({
  ferry,
  selectedClass,
  selectedSeats,
  searchParams,
  onBack,
  onCheckout,
}) => {
  const totalPassengers = searchParams.adults + searchParams.children;
  const baseFare = selectedClass ? selectedClass.price * totalPassengers : 0;
  const portFee = ferry.pricing.portFee
    ? ferry.pricing.portFee * totalPassengers
    : 0;
  const taxes = ferry.pricing.taxes ? ferry.pricing.taxes * totalPassengers : 0;
  const totalCost = baseFare + portFee + taxes;

  const formatPassengers = () => {
    const parts = [];
    if (searchParams.adults > 0)
      parts.push(
        `${searchParams.adults} Adult${searchParams.adults > 1 ? "s" : ""}`
      );
    if (searchParams.children > 0)
      parts.push(
        `${searchParams.children} Child${
          searchParams.children > 1 ? "ren" : ""
        }`
      );
    if (searchParams.infants > 0)
      parts.push(
        `${searchParams.infants} Infant${searchParams.infants > 1 ? "s" : ""}`
      );
    return parts.join(", ");
  };

  const getSeatDisplay = () => {
    if (selectedSeats.length > 0) return selectedSeats.join(", ");
    return ferry.operator === "sealink"
      ? "Manual selection required"
      : "Auto-assigned";
  };

  return (
    <div className={styles.summarySticky}>
      {/* Ferry Header Section */}
      <section className={styles.ferrySection}>
        <Button
          variant="secondary"
          onClick={onBack}
          className={styles.backButton}
        >
          <ArrowLeft size={16} />
          Back to Results
        </Button>

        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.ferryInfo}>
              <Ship color="var(--color-text-primary)" size={20} />
              <div className={styles.ferryDetails}>
                <h3>{ferry.ferryName}</h3>
                <p>{ferry.operator}</p>
              </div>
            </div>

            <div className={styles.scheduleInfo}>
              <div className={styles.timeInfo}>
                <span className={styles.departureTime}>
                  {ferry.schedule.departureTime}
                </span>
                <span>-</span>
                <span>{ferry.schedule.arrivalTime}</span>
              </div>
              <p className={styles.duration}>
                {ferry.route.from.name} → {ferry.route.to.name}
              </p>
              <p className={styles.travelDate}>{ferry.schedule.date}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Summary Section */}
      <section className={styles.bookingSection}>
        <h3 className={styles.sectionTitle}>Booking Summary</h3>

        <div className={styles.summaryContent}>
          {selectedClass && (
            <>
              <div className={styles.row}>
                <span>Class</span>
                <span>{selectedClass.name}</span>
              </div>
              <div className={styles.row}>
                <span>Passengers</span>
                <span>{formatPassengers()}</span>
              </div>
              <div className={styles.row}>
                <span>Seats</span>
                <span>{getSeatDisplay()}</span>
              </div>

              <div className={styles.divider} />

              {/* Price Breakdown */}
              <div className={styles.priceBreakdown}>
                <div className={styles.row}>
                  <span>Base Fare ({totalPassengers} pax)</span>
                  <span>₹{baseFare.toLocaleString()}</span>
                </div>

                {portFee > 0 && (
                  <div className={styles.row}>
                    <span>Port Fee</span>
                    <span>₹{portFee.toLocaleString()}</span>
                  </div>
                )}

                {taxes > 0 && (
                  <div className={styles.row}>
                    <span>Taxes & Fees</span>
                    <span>₹{taxes.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className={styles.total}>
                <span>Total Amount</span>
                <span>₹{totalCost.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* Action Button */}
        {selectedClass ? (
          <Button
            variant="primary"
            size="large"
            onClick={onCheckout}
            className={styles.checkoutBtn}
          >
            Proceed to Checkout
          </Button>
        ) : (
          <div className={styles.prompt}>
            <AlertCircle size={16} />
            <span>Select a class to continue</span>
          </div>
        )}
      </section>

      {/* Trust Indicators */}
      <section className={styles.trustSection}>
        {[
          { icon: CheckCircle, text: "Instant Confirmation" },
          { icon: CheckCircle, text: "Secure Payment" },
          { icon: CheckCircle, text: "24/7 Support" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className={styles.trustItem}>
            <Icon size={12} />
            <span>{text}</span>
          </div>
        ))}
      </section>
    </div>
  );
};

export default FerrySummary;
