import React from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import { FerryCard } from "@/components/molecules/Cards/FerryCard";
import type { FerryCardProps } from "@/components/molecules/Cards/FerryCard/FerryCard.types";
import { Button } from "@/components/atoms";
import { useFerryStore } from "@/store/FerryStore";
import { useRouter } from "next/navigation";
import { getAmenityIcon } from "@/utils/amenityIconMapping";
import { Info, Calendar, MapPin } from "lucide-react";
import styles from "./FerryResults.module.css";

interface FerryResultsProps {
  loading: boolean;
  results: UnifiedFerryResult[];
  error: string | null;
  onRetry: () => void;
  onClearError: () => void;
  searchParams?: {
    from?: string;
    to?: string;
    date?: string;
  };
}

export function FerryResults({
  loading,
  results,
  error,
  onRetry,
  onClearError,
  searchParams,
}: FerryResultsProps) {
  const { selectFerry } = useFerryStore();
  const router = useRouter();

  const transformToFerryCardProps = (
    ferry: UnifiedFerryResult,
    index: number
  ): FerryCardProps => {
    const validClasses = ferry.classes.filter((cls) => cls.availableSeats > 0);
    const minPrice = Math.min(...validClasses.map((cls) => cls.price));
    const totalSeats = validClasses.reduce(
      (sum, cls) => sum + cls.availableSeats,
      0
    );

    return {
      ferryName: ferry.ferryName,
      rating: 4.5, // Default rating since it's not in the API response
      departureTime: ferry.schedule.departureTime,
      departureLocation: ferry.route.from.name,
      arrivalTime: ferry.schedule.arrivalTime,
      arrivalLocation: ferry.route.to.name,
      price: minPrice,
      totalPrice: ferry.pricing.total,
      seatsLeft:
        totalSeats > 0 ? totalSeats : ferry.availability.availableSeats,
      ferryClasses: validClasses.map((cls) => ({
        type: cls.name,
        price: cls.price,
        totalPrice:
          cls.price + (ferry.pricing.portFee || 0) + (ferry.pricing.taxes || 0),
        seatsLeft: cls.availableSeats,
        amenities: (cls.amenities || []).map((amenity: string) => {
          const amenityMapping = getAmenityIcon(amenity);
          const IconComponent = amenityMapping.icon;
          return {
            icon: React.createElement(IconComponent, {
              size: 16,
              className: `${amenityMapping.color}`,
            }),
            label: amenity,
          };
        }),
      })),
      operator: ferry.operator,
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
      detailsUrl: `/ferry/booking/${ferry.id}`,
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.ferryResultsContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <h2>Searching for ferries...</h2>
          <p>We're checking all available ferry operators for your route.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.ferryResultsContainer}>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>Something went wrong</p>
          <p className={styles.errorSubtext}>{error}</p>
          <div className={styles.errorActions}>
            <Button variant="primary" onClick={onRetry}>
              Try Again
            </Button>
            <Button variant="secondary" onClick={onClearError}>
              Clear Error
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No results state
  if (results.length === 0) {
    return (
      <div className={styles.ferryResultsContainer}>
        <div className={styles.noResultsContainer}>
          <div className={styles.noResultsIcon}>🚢</div>
          <h2>No ferries found</h2>
          <p>
            No ferry services are available for your selected route and date.
            Try different dates or contact us for assistance.
          </p>
          <div className={styles.noResultsActions}>
            <Button variant="primary" onClick={onRetry}>
              Try Different Dates
            </Button>
            <Button variant="secondary" onClick={() => router.push("/ferry")}>
              New Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state with results
  return (
    <div className={styles.ferryResultsContainer}>
      {/* Ferry Results List */}
      <div className={styles.ferryList}>
        {results.map((ferry, index) => (
          <FerryCard
            key={`${ferry.operator}-${ferry.id}-${index}`}
            {...transformToFerryCardProps(ferry, index)}
          />
        ))}
      </div>

      {/* Results Footer */}
      <div className={styles.resultsFooter}>
        <p className={styles.resultsNote}>
          Prices include all taxes and fees. Final booking confirmation will be
          sent to your email.
        </p>
      </div>
    </div>
  );
}
