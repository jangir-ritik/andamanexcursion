import React, { useState } from "react";
import { SeatLayout, Seat } from "@/types/FerryBookingSession.types";
import { Armchair, CheckCircle, X, Eye, Users, Ship } from "lucide-react";
import styles from "./SeatLayout.module.css";

interface SeatLayoutProps {
  seatLayout: SeatLayout;
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  maxSeats: number;
  className?: string;
}

export function SeatLayoutComponent({
  seatLayout,
  selectedSeats,
  onSeatSelect,
  maxSeats,
  className,
}: SeatLayoutProps) {
  const getSeatIcon = (seat: Seat) => {
    if (seat.status === "booked") return X;
    if (selectedSeats.includes(seat.id)) return CheckCircle;
    if (seat.type === "window") return Eye;
    if (seat.type === "aisle") return Users;
    return Armchair;
  };

  const getSeatClassName = (seat: Seat) => {
    const baseClass = styles.seat;
    const statusClass = styles[seat.status];
    const typeClass = styles[seat.type];
    const selectedClass = selectedSeats.includes(seat.id)
      ? styles.selected
      : "";

    return `${baseClass} ${statusClass} ${typeClass} ${selectedClass}`.trim();
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "booked" || seat.status === "blocked") return;

    if (selectedSeats.includes(seat.id)) {
      // Deselect seat
      onSeatSelect(seat.id);
    } else if (selectedSeats.length < maxSeats) {
      // Select seat if we haven't reached the limit
      onSeatSelect(seat.id);
    }
  };

  // Group seats by row for display
  const seatsByRow = seatLayout.seats.reduce((acc, seat) => {
    const row = seat.position.row;
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  return (
    <div
      aria-label="Seat Layout"
      className={`${styles.seatLayoutContainer} ${className || ""}`}
    >
      <div className={styles.ferryOutline}>
        <div className={styles.ferryBow}>
          <Ship size={20} />
          <span>Ferry Front</span>
        </div>

        <div
          aria-label="Seat Grid"
          className={styles.seatGrid}
        >
          {Object.keys(seatsByRow)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map((rowNum) => {
              const row = parseInt(rowNum);
              const seats = seatsByRow[row].sort(
                (a, b) => a.position.column - b.position.column
              );

              return (
                <div
                  aria-label="Seat Row"
                  key={row}
                  className={styles.seatRow}
                >
                  <div className={styles.rowNumber}>{row}</div>
                  <div className={styles.seatsInRow}>
                    {seats.map((seat, index) => {
                      const IconComponent = getSeatIcon(seat);
                      return (
                        <React.Fragment key={seat.id}>
                          <button
                            className={getSeatClassName(seat)}
                            onClick={() => handleSeatClick(seat)}
                            disabled={
                              seat.status === "booked" ||
                              seat.status === "blocked"
                            }
                            title={`Seat ${seat.number} - ${seat.type} - ${seat.status}`}
                          >
                            <div className={styles.seatIcon}>
                              <IconComponent size={16} />
                            </div>
                            <span className={styles.seatNumber}>
                              {seat.number}
                            </span>
                          </button>

                          {/* Add aisle gap after every 2 seats */}
                          {index === 1 && seats.length > 2 && (
                            <div
                              aria-label="Aisle"
                              className={styles.aisle}
                            >
                              <span className={styles.aisleLabel}>AISLE</span>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        <div className={styles.ferryStern}>
          <span>Ferry Back</span>
        </div>
      </div>

      {/* Seat Legend */}
      <div
        aria-label="Seat Legend"
        className={styles.legend}
      >
        <div className={styles.legendItem}>
          <div className={styles.legendIconWrapper}>
            <Armchair size={16} />
          </div>
          <span>Available</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendIconWrapper}>
            <CheckCircle size={16} />
          </div>
          <span>Selected</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendIconWrapper}>
            <X size={16} />
          </div>
          <span>Booked</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendIconWrapper}>
            <Eye size={16} />
          </div>
          <span>Window</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendIconWrapper}>
            <Users size={16} />
          </div>
          <span>Aisle</span>
        </div>
      </div>

      {/* Selection Status */}
      <div
        aria-label="Selection Status"
        className={styles.selectionStatus}
      >
        <div className={styles.statusHeader}>
          <h4>Seat Selection</h4>
          <span className={styles.seatCounter}>
            {selectedSeats.length}/{maxSeats}
          </span>
        </div>
        {selectedSeats.length > 0 && (
          <div
            aria-label="Selected Seats"
            className={styles.selectedSeats}
          >
            <span className={styles.selectedLabel}>Selected:</span>
            <div className={styles.selectedSeatsList}>
              {selectedSeats.map((seatId, index) => (
                <span key={seatId} className={styles.selectedSeatTag}>
                  {seatId}
                </span>
              ))}
            </div>
          </div>
        )}
        {selectedSeats.length === 0 && (
          <p
            aria-label="No Selection Text"
            className={styles.noSelectionText}
          >
            Select up to {maxSeats} seat{maxSeats > 1 ? "s" : ""} to continue
          </p>
        )}
      </div>
    </div>
  );
}
