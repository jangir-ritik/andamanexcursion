"use client";
import React, { useMemo } from "react";
import { Button } from "@/components/atoms";
import { useBoat, type Boat, type BoatSearchParams } from "@/store/BoatStore";
import styles from "./BookingResults.module.css";

interface BoatResultsProps {
  searchParams: BoatSearchParams;
  boats: Boat[];
  loading: boolean;
}

interface BoatCardProps {
  boat: Boat;
  searchParams: BoatSearchParams;
  onAddToCart: (boat: Boat, time: string) => void;
  isInCart: (boatId: string, time: string) => boolean;
}

const BoatCard: React.FC<BoatCardProps> = ({
  boat,
  searchParams,
  onAddToCart,
  isInCart,
}) => {
  const totalPassengers = searchParams.adults + searchParams.children;
  const totalPrice =
    boat.fare * searchParams.adults + boat.fare * searchParams.children * 0.5;

  return (
    <div className={styles.resultCard}>
      <div className={styles.cardContent}>
        {/* Route Header */}
        <div className={styles.cardHeader}>
          <h3 className={styles.routeTitle}>{boat.name}</h3>
          <div className={styles.routeInfo}>
            <span className={styles.routeText}>
              {boat.route.from} → {boat.route.to}
            </span>
          </div>
        </div>

        {/* Description */}
        {boat.description && (
          <p className={styles.description}>{boat.description}</p>
        )}

        {/* Route Details */}
        <div className={styles.routeDetails}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Duration:</span>
            <span className={styles.detailValue}>{boat.minTimeAllowed}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Round Trip:</span>
            <span className={styles.detailValue}>Yes</span>
          </div>
          {boat.capacity && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Capacity:</span>
              <span className={styles.detailValue}>
                {boat.capacity} passengers
              </span>
            </div>
          )}
        </div>

        {/* Available Times */}
        <div className={styles.timingSection}>
          <h4 className={styles.timingTitle}>Available Departure Times:</h4>
          <div className={styles.timeSlots}>
            {boat.timing.map((time) => {
              const isSelected = searchParams.time === time.replace(":", "-");
              const inCart = isInCart(boat.id, time);

              return (
                <div
                  key={time}
                  className={`${styles.timeSlot} ${
                    isSelected ? styles.timeSlotSelected : ""
                  }`}
                >
                  <span className={styles.timeText}>{time}</span>
                  <Button
                    variant={inCart ? "secondary" : "primary"}
                    size="small"
                    disabled={inCart}
                    onClick={() => onAddToCart(boat, time)}
                    className={styles.addButton}
                  >
                    {inCart ? "Added" : "Add"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing */}
        <div className={styles.pricingSection}>
          <div className={styles.priceDetails}>
            <div className={styles.priceItem}>
              <span>Adults ({searchParams.adults})</span>
              <span>₹{boat.fare * searchParams.adults}</span>
            </div>
            {searchParams.children > 0 && (
              <div className={styles.priceItem}>
                <span>Children ({searchParams.children})</span>
                <span>₹{boat.fare * searchParams.children * 0.5}</span>
              </div>
            )}
          </div>
          <div className={styles.totalPrice}>
            <strong>Total: ₹{totalPrice}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BoatResults: React.FC<BoatResultsProps> = ({
  searchParams,
  boats,
  loading,
}) => {
  const { addToCart, isItemInCart } = useBoat();

  const handleAddToCart = (boat: Boat, time: string) => {
    addToCart(boat, 1, time, searchParams);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Searching for boats...</p>
      </div>
    );
  }

  // No results state
  if (!boats || boats.length === 0) {
    return (
      <div className={styles.noResults}>
        <h3>No boats found</h3>
        <p>
          Try adjusting your search criteria or selecting a different route.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsHeader}>
        <h2>Available Boat Trips</h2>
        <p>
          {boats.length} boat{boats.length !== 1 ? "s" : ""} available
        </p>
      </div>

      <div className={styles.resultsList}>
        {boats.map((boat) => (
          <BoatCard
            key={boat.id}
            boat={boat}
            searchParams={searchParams}
            onAddToCart={handleAddToCart}
            isInCart={isItemInCart}
          />
        ))}
      </div>
    </div>
  );
};
