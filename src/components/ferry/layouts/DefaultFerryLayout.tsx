import React from "react";
import { Seat, FerryVesselLayoutProps } from "@/types/SeatSelection.types";
import { Armchair, CheckCircle, Users, Star, LockKeyhole } from "lucide-react";
import styles from "./FerryLayout.module.css";

/**
 * Default Ferry Layout
 *
 * Fallback layout for operators/classes that don't have specific visual layouts
 * Uses a simple grid arrangement with proper seat styling
 */
export function DefaultFerryLayout({
  seats,
  selectedSeats,
  onSeatSelect,
  maxSeats,
  isLoading = false,
}: Omit<FerryVesselLayoutProps, "operator" | "vesselClass">) {
  // Enhance seats with visual layout-specific seat types
  const enhancedSeats = seats.map((seat) => ({
    ...seat,
    // type: determineSeatTypeFromPosition(seat.number, seat.tier),
  }));

  // function determineSeatTypeFromPosition(
  //   seatNumber: string,
  //   tier?: string
  // ): "window" | "aisle" | "middle" {
  //   // This is where we can implement REAL ferry layout logic
  //   // For now, use seat number patterns but this should be replaced
  //   // with actual deck plan data for each ferry/class combination

  //   const lastChar = seatNumber.charAt(seatNumber.length - 1).toUpperCase();

  //   // Basic pattern - can be enhanced with real ferry data
  //   if (lastChar === "A" || lastChar === "F") return "window";
  //   if (lastChar === "C" || lastChar === "D") return "aisle";

  //   return "middle";
  // }
  const getSeatIcon = (seat: Seat) => {
    if (seat.status === "booked") return LockKeyhole;
    if (seat.status === "selected") return CheckCircle;
    if (seat.isPremium) return Star;
    if (seat.isAccessible) return Users;
    return Armchair;
  };

  const getSeatClassName = (seat: Seat) => {
    const classes = [styles.seat];

    if (seat.status) classes.push(styles[seat.status]);
    if (seat.isPremium) classes.push(styles.premium);
    if (seat.isAccessible) classes.push(styles.accessible);
    if (seat.tier) classes.push(styles[`tier${seat.tier}`]);

    return classes.filter(Boolean).join(" ");
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "booked" || seat.status === "blocked") return;
    onSeatSelect(seat.id);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading seat layout...</p>
      </div>
    );
  }

  return (
    <div className={styles.defaultLayout}>
      <div className={styles.ferryOutline}>
        <div className={styles.ferryHeader}>
          <div className={styles.ferryBow}></div>
        </div>

        <div className={styles.seatGrid}>
          {enhancedSeats.map((seat) => {
            const IconComponent = getSeatIcon(seat);
            const isDisabled =
              seat.status === "booked" || seat.status === "blocked";

            return (
              <button
                key={seat.id}
                className={getSeatClassName(seat)}
                onClick={() => handleSeatClick(seat)}
                disabled={isDisabled}
                title={`Seat ${seat.displayNumber} - ${seat.status}${
                  seat.price ? ` - ₹${seat.price}` : ""
                }${seat.tier ? ` - ${seat.tier} Class` : ""}`}
              >
                <div className={styles.seatIcon}>
                  <IconComponent size={14} />
                </div>
                <span className={styles.seatNumber}>{seat.displayNumber}</span>

                {seat.isPremium && (
                  <Star size={8} className={styles.premiumIndicator} />
                )}
                {seat.isAccessible && (
                  <Users size={8} className={styles.accessibleIndicator} />
                )}
              </button>
            );
          })}
        </div>

        <div className={styles.ferryFooter}>
          <div className={styles.ferryStern}></div>
        </div>
      </div>
    </div>
  );
}
