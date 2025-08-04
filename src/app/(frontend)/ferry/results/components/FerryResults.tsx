import React from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import { FerryCard } from "@/components/molecules/Cards/FerryCard";
import type { FerryCardProps } from "@/components/molecules/Cards/FerryCard/FerryCard.types";
import { Button } from "@/components/atoms";
import { useFerryStore } from "@/store/FerryStore";
import { useRouter } from "next/navigation";
import styles from "./FerryResults.module.css";

interface FerryResultsProps {
  loading: boolean;
  results: UnifiedFerryResult[];
  error: string | null;
  onRetry: () => void;
  onClearError: () => void;
}

export function FerryResults({
  loading,
  results,
  error,
  onRetry,
  onClearError,
}: FerryResultsProps) {
  const { selectFerry } = useFerryStore();
  const router = useRouter();

  // Transform UnifiedFerryResult to FerryCardProps
  const transformToFerryCardProps = (
    ferry: UnifiedFerryResult,
    index: number
  ): FerryCardProps => {
    return {
      ferryName: ferry.ferryName,
      rating: 4.5, // Default rating since it's not in the API response
      departureTime: ferry.schedule.departureTime,
      departureLocation: ferry.route.from.name,
      arrivalTime: ferry.schedule.arrivalTime,
      arrivalLocation: ferry.route.to.name,
      price: ferry.classes[0]?.price || 0,
      totalPrice: ferry.pricing.total,
      seatsLeft: ferry.availability.availableSeats,
      ferryClasses: ferry.classes.map((cls) => ({
        type: cls.name,
        price: cls.price,
        totalPrice: cls.price,
        seatsLeft: cls.availableSeats,
        amenities: (cls.amenities || []).map((amenity) => ({
          icon: "/icons/amenity-default.svg", // Default icon for all amenities
          label: amenity.toString(),
        })),
      })),
      ferryImages: [], // Add default ferry images later
      onChooseSeats: (classType: string) => {
        // Find the selected class
        const selectedClass = ferry.classes.find(
          (cls) => cls.name === classType
        );
        if (selectedClass) {
          selectFerry(ferry);
          // Navigate to ferry details/booking page
          router.push(`/ferry/booking/${ferry.id}?class=${selectedClass.id}`);
        }
      },
      ferryIndex: index,
      detailsUrl: `/ferry/${ferry.id}`,
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <h2>Searching for ferries...</h2>
        <p>We're checking all available ferry operators for your route.</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Search Failed</h2>
        <p>{error}</p>
        <div className={styles.errorActions}>
          <Button variant="primary" onClick={onRetry}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={onClearError}>
            Clear Error
          </Button>
        </div>
      </div>
    );
  }

  // No results state
  if (results.length === 0) {
    return (
      <div className={styles.noResultsContainer}>
        <div className={styles.noResultsIcon}>🚢</div>
        <h2>No ferries found</h2>
        <p>
          No ferry services are available for your selected route and date. Try
          different dates or contact us for assistance.
        </p>
        <div className={styles.noResultsActions}>
          <Button variant="primary" onClick={() => window.history.back()}>
            Modify Search
          </Button>
          <Button variant="secondary" onClick={onRetry}>
            Search Again
          </Button>
        </div>
      </div>
    );
  }

  // Results found state
  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsGrid}>
        {results.map((ferry, index) => (
          <FerryCard
            key={ferry.id || `ferry-${index}`}
            {...transformToFerryCardProps(ferry, index)}
          />
        ))}
      </div>

      {results.length > 0 && (
        <div className={styles.resultsFooter}>
          <p className={styles.resultsNote}>
            Prices are per person and include all taxes and fees. Seat
            availability is subject to real-time updates.
          </p>
        </div>
      )}
    </div>
  );
}
