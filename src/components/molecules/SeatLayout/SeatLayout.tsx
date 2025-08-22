import React, { useState, useEffect, Fragment } from "react";
import {
  Armchair,
  CheckCircle,
  X,
  Eye,
  Users,
  Ship,
  MapPin,
  Clock,
  AlertCircle,
  RefreshCw,
  Zap,
  Star,
} from "lucide-react";
import styles from "./SeatLayout.module.css";

// Types based on Green Ocean API and your existing structure
interface Seat {
  id: string;
  number: string;
  seat_numbering: string; // From Green Ocean API
  status:
    | "available"
    | "booked"
    | "blocked"
    | "selected"
    | "temporarily_blocked";
  type: "window" | "aisle" | "middle";
  position: { row: number; column: number };
  price?: number;
  isAccessible?: boolean;
  isPremium?: boolean;
}

interface LayoutConfig {
  rows: number;
  seatsPerRow: number;
  aislePositions: number[];
  emergency_exits: number[];
}

interface SeatLayout {
  seats: Seat[];
  layout_config?: LayoutConfig; // Make optional to handle both cases
}

interface EnhancedSeatLayoutProps {
  seatLayout: SeatLayout;
  layout_config?: LayoutConfig; // Also make this optional and allow override
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  maxSeats: number;
  className?: string;
  ferryInfo?: {
    name: string;
    route: string;
    departureTime: string;
    estimatedDuration: string;
  };
  onRefreshLayout?: () => void;
  isLoading?: boolean;
  blockExpiry?: Date;
}

export function SeatLayoutComponent({
  seatLayout,
  layout_config,
  selectedSeats,
  onSeatSelect,
  maxSeats,
  className,
  ferryInfo,
  onRefreshLayout,
  isLoading = false,
  blockExpiry,
}: EnhancedSeatLayoutProps) {
  const [countdown, setCountdown] = useState<number>(0);
  const [showPricing, setShowPricing] = useState(false);
  const [viewMode, setViewMode] = useState<"deck" | "list">("deck");

  // Use layout_config from props, fallback to seatLayout.layout_config, or generate default
  const effectiveLayoutConfig: LayoutConfig =
    layout_config ||
    seatLayout.layout_config ||
    generateLayoutConfigFromSeats(seatLayout.seats);

  // Generate layout config from seats if not provided
  function generateLayoutConfigFromSeats(seats: Seat[]): LayoutConfig {
    const maxRow = Math.max(...seats.map((seat) => seat.position.row));
    const maxColumn = Math.max(...seats.map((seat) => seat.position.column));

    // Simple heuristic for aisle positions (assume middle of seat row)
    const seatsPerRow = maxColumn + 1;
    const aislePositions = seatsPerRow > 4 ? [Math.floor(seatsPerRow / 2)] : [];

    return {
      rows: maxRow + 1,
      seatsPerRow: seatsPerRow,
      aislePositions: aislePositions,
      emergency_exits: [], // Would need to be provided by API
    };
  }

  // Countdown timer for seat blocking expiry
  useEffect(() => {
    if (!blockExpiry) return;

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((blockExpiry.getTime() - Date.now()) / 1000)
      );
      setCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [blockExpiry]);

  const getSeatIcon = (seat: Seat) => {
    if (seat.status === "booked") return X;
    if (selectedSeats.includes(seat.id)) return CheckCircle;
    if (seat.isPremium) return Star;
    if (seat.isAccessible) return Users;
    if (seat.type === "window") return Eye;
    if (seat.type === "aisle") return MapPin;
    return Armchair;
  };

  const getSeatClassName = (seat: Seat) => {
    const baseClass = styles.seat;
    const statusClass = styles[seat.status] || "";
    const typeClass = styles[seat.type] || "";
    const selectedClass = selectedSeats.includes(seat.id)
      ? styles.selected
      : "";
    const premiumClass = seat.isPremium ? styles.premium : "";
    const accessibleClass = seat.isAccessible ? styles.accessible : "";

    return [
      baseClass,
      statusClass,
      typeClass,
      selectedClass,
      premiumClass,
      accessibleClass,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "booked" || seat.status === "blocked") return;

    if (selectedSeats.includes(seat.id)) {
      onSeatSelect(seat.id);
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect(seat.id);
    }
  };

  // Group seats by row for deck view
  const seatsByRow = seatLayout.seats.reduce((acc, seat) => {
    const row = seat.position.row;
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedSeatsData = seatLayout.seats.filter((seat) =>
    selectedSeats.includes(seat.id)
  );
  const totalPrice = selectedSeatsData.reduce(
    (sum, seat) => sum + (seat.price || 0),
    0
  );

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {/* Ferry Info Header */}
      {ferryInfo && (
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.ferryInfo}>
              <Ship size={24} />
              <div className={styles.ferryDetails}>
                <h3 className={styles.ferryName}>{ferryInfo.name}</h3>
                <p className={styles.ferryRoute}>{ferryInfo.route}</p>
              </div>
            </div>
            <div className={styles.scheduleInfo}>
              <div className={styles.timeInfo}>
                <Clock size={16} />
                <span className={styles.departureTime}>
                  {ferryInfo.departureTime}
                </span>
              </div>
              <p className={styles.duration}>{ferryInfo.estimatedDuration}</p>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className={styles.controlBar}>
        <div className={styles.controls}>
          <div className={styles.viewToggle}>
            <button
              onClick={() => setViewMode("deck")}
              className={`${styles.toggleButton} ${
                viewMode === "deck" ? styles.active : ""
              }`}
            >
              Deck View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`${styles.toggleButton} ${
                viewMode === "list" ? styles.active : ""
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => setShowPricing(!showPricing)}
            className={styles.controlButton}
          >
            <Zap size={16} />
            <span>Show Pricing</span>
          </button>

          {onRefreshLayout && (
            <button
              onClick={onRefreshLayout}
              disabled={isLoading}
              className={`${styles.controlButton} ${
                isLoading ? styles.loading : ""
              }`}
            >
              <RefreshCw
                size={16}
                className={isLoading ? styles.spinning : ""}
              />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {/* Seat Block Timer */}
        {countdown > 0 && (
          <div className={styles.countdownTimer}>
            <AlertCircle size={16} />
            <span>Seats blocked for: {formatCountdown(countdown)}</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendGrid}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendIcon} ${styles.available}`}></div>
            <span>Available</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendIcon} ${styles.selected}`}></div>
            <span>Selected</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendIcon} ${styles.booked}`}></div>
            <span>Booked</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendIcon} ${styles.window}`}></div>
            <span>Window</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendIcon} ${styles.aisle}`}></div>
            <span>Aisle</span>
          </div>
        </div>
      </div>

      {/* Seat Layout */}
      <div
        className={`${styles.layoutContainer} ${
          isLoading ? styles.loadingState : ""
        }`}
      >
        {viewMode === "deck" ? (
          <div className={styles.deckView}>
            {/* Ferry Bow */}
            <div className={styles.ferryBow}>
              <Ship size={20} />
              <span>Ferry Front</span>
            </div>

            {/* Seat Grid */}
            <div className={styles.seatGrid}>
              {Object.keys(seatsByRow)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((rowNum) => {
                  const row = parseInt(rowNum);
                  const seats = seatsByRow[row].sort(
                    (a, b) => a.position.column - b.position.column
                  );

                  const isEmergencyRow =
                    effectiveLayoutConfig.emergency_exits.includes(row);

                  return (
                    <div key={row} className={styles.seatRow}>
                      {/* Row Number */}
                      <div
                        className={`${styles.rowNumber} ${
                          isEmergencyRow ? styles.emergencyRow : ""
                        }`}
                      >
                        {row}
                      </div>

                      {/* Seats */}
                      <div className={styles.seatsInRow}>
                        {seats.map((seat, index) => {
                          const IconComponent = getSeatIcon(seat);
                          const isAisle =
                            effectiveLayoutConfig.aislePositions.includes(
                              index
                            );

                          return (
                            <Fragment key={seat.id}>
                              <button
                                className={getSeatClassName(seat)}
                                onClick={() => handleSeatClick(seat)}
                                disabled={
                                  seat.status === "booked" ||
                                  seat.status === "blocked"
                                }
                                title={`Seat ${seat.seat_numbering} - ${
                                  seat.type
                                } - ${seat.status}${
                                  seat.price ? ` - ₹${seat.price}` : ""
                                }`}
                              >
                                <div className={styles.seatIcon}>
                                  <IconComponent size={14} />
                                </div>
                                <span className={styles.seatNumber}>
                                  {seat.seat_numbering}
                                </span>
                                {showPricing && seat.price && (
                                  <span className={styles.priceTag}>
                                    ₹{seat.price}
                                  </span>
                                )}

                                {/* Special indicators */}
                                {seat.isPremium && (
                                  <Star
                                    size={8}
                                    className={styles.premiumIndicator}
                                  />
                                )}
                                {seat.isAccessible && (
                                  <Users
                                    size={8}
                                    className={styles.accessibleIndicator}
                                  />
                                )}
                              </button>

                              {/* Aisle Gap */}
                              {isAisle && index < seats.length - 1 && (
                                <div className={styles.aisleGap}>
                                  <div className={styles.aisleLine}>
                                    <span className={styles.aisleLabel}>
                                      AISLE
                                    </span>
                                  </div>
                                </div>
                              )}
                            </Fragment>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Ferry Stern */}
            <div className={styles.ferryStern}>
              <span>Ferry Back</span>
            </div>
          </div>
        ) : (
          /* List View */
          <div className={styles.listView}>
            <div className={styles.listGrid}>
              {seatLayout.seats
                .sort((a, b) =>
                  a.seat_numbering.localeCompare(b.seat_numbering)
                )
                .map((seat) => {
                  const IconComponent = getSeatIcon(seat);
                  return (
                    <button
                      key={seat.id}
                      className={getSeatClassName(seat)}
                      onClick={() => handleSeatClick(seat)}
                      disabled={
                        seat.status === "booked" || seat.status === "blocked"
                      }
                    >
                      <div className={styles.seatIcon}>
                        <IconComponent size={16} />
                      </div>
                      <span className={styles.seatNumber}>
                        {seat.seat_numbering}
                      </span>
                      {showPricing && seat.price && (
                        <span className={styles.listPriceTag}>
                          ₹{seat.price}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Selection Summary */}
      <div className={styles.selectionSummary}>
        <div className={styles.summaryHeader}>
          <h4 className={styles.summaryTitle}>Seat Selection</h4>
          <div className={styles.selectionCounter}>
            <span className={styles.counterText}>
              {selectedSeats.length}/{maxSeats} selected
            </span>
            <div className={styles.counterBadge}>{selectedSeats.length}</div>
          </div>
        </div>

        {selectedSeats.length > 0 ? (
          <div className={styles.selectedSeatsContainer}>
            <div className={styles.selectedSeatsList}>
              {selectedSeatsData.map((seat) => (
                <div key={seat.id} className={styles.selectedSeatTag}>
                  <span className={styles.seatTagNumber}>
                    {seat.seat_numbering}
                  </span>
                  <span className={styles.seatTagType}>({seat.type})</span>
                  {seat.price && (
                    <span className={styles.seatTagPrice}>₹{seat.price}</span>
                  )}
                  <button
                    onClick={() => onSeatSelect(seat.id)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {totalPrice > 0 && (
              <div className={styles.totalPrice}>
                <span className={styles.totalLabel}>Total:</span>
                <span className={styles.totalAmount}>₹{totalPrice}</span>
              </div>
            )}
          </div>
        ) : (
          <p className={styles.noSelectionText}>
            Select up to {maxSeats} seat{maxSeats > 1 ? "s" : ""} to continue
          </p>
        )}
      </div>
    </div>
  );
}
