import React from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import { FerryCard } from "@/components/molecules/Cards/FerryCard";
import type { FerryCardProps } from "@/components/molecules/Cards/FerryCard/FerryCard.types";
import { Button } from "@/components/atoms";
import { useFerryStore } from "@/store/FerryStore";
import { useRouter } from "next/navigation";
import { getAmenityIcon } from "@/utils/amenityIconMapping";
import {
  Info,
  Calendar,
  MapPin,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from "lucide-react";
import styles from "./FerryResults.module.css";

// Enhanced error type to handle complex error objects
interface EnhancedError {
  message: string;
  operatorErrors?: Array<{
    operator: string;
    error: string;
  }>;
}

interface FerryResultsProps {
  loading: boolean;
  results: UnifiedFerryResult[];
  error: string | EnhancedError | null;
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
      rating: 4.5,
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
        const selectedClass = ferry.classes.find(
          (cls) => cls.name === classType
        );
        if (selectedClass) {
          selectFerry(ferry);
          router.push(`/ferry/booking/${ferry.id}?class=${selectedClass.id}`);
        }
      },
      ferryIndex: index,
      detailsUrl: `/ferry/booking/${ferry.id}`,
    };
  };

  // Enhanced error message parser
  const parseErrorMessage = (
    error: string | EnhancedError | null
  ): {
    mainMessage: string;
    operatorErrors: Array<{ operator: string; error: string }>;
    isPartialFailure: boolean;
  } => {
    if (!error) {
      return { mainMessage: "", operatorErrors: [], isPartialFailure: false };
    }

    if (typeof error === "string") {
      return {
        mainMessage: error,
        operatorErrors: [],
        isPartialFailure: false,
      };
    }

    return {
      mainMessage: error.message,
      operatorErrors: error.operatorErrors || [],
      isPartialFailure: !!(
        error.operatorErrors && error.operatorErrors.length > 0
      ),
    };
  };

  // Loading state with more detailed messaging
  if (loading) {
    return (
      <div className={styles.ferryResultsContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <h2>Searching for ferries...</h2>
          <p>We're checking all available ferry operators for your route.</p>
          <div className={styles.loadingProgress}>
            <div className={styles.operatorStatus}>
              <div className={styles.operatorItem}>
                <div className={`${styles.statusDot} ${styles.checking}`} />
                <span>Sealink</span>
              </div>
              <div className={styles.operatorItem}>
                <div className={`${styles.statusDot} ${styles.checking}`} />
                <span>Makruzz</span>
              </div>
              <div className={styles.operatorItem}>
                <div className={`${styles.statusDot} ${styles.checking}`} />
                <span>Green Ocean</span>
              </div>
            </div>
            <p className={styles.progressNote}>
              This may take up to 30 seconds while we gather the best options
              for you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { mainMessage, operatorErrors, isPartialFailure } =
    parseErrorMessage(error);

  // Enhanced error state with different treatments for partial vs complete failures
  if (error && results.length === 0) {
    // Complete failure - no results available
    return (
      <div className={styles.ferryResultsContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorHeader}>
            <XCircle className={styles.errorIcon} size={48} />
            <h2 className={styles.errorTitle}>
              {isPartialFailure
                ? "Ferry services temporarily unavailable"
                : "Search failed"}
            </h2>
          </div>

          <p className={styles.errorText}>{mainMessage}</p>

          {operatorErrors.length > 0 && (
            <div className={styles.operatorErrorDetails}>
              <h3>Service Status:</h3>
              {operatorErrors.map((opError, index) => (
                <div key={index} className={styles.operatorErrorItem}>
                  <XCircle size={16} className={styles.operatorErrorIcon} />
                  <strong>{opError.operator}:</strong>
                  <span>{opError.error}</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.errorActions}>
            <Button variant="primary" onClick={onRetry}>
              Try Again
            </Button>
            <Button variant="secondary" onClick={() => router.push("/ferry")}>
              New Search
            </Button>
          </div>

          <div className={styles.errorFooter}>
            <p>If this problem persists, please contact our support team.</p>
          </div>
        </div>
      </div>
    );
  }

  // Partial failure warning (when we have some results but some operators failed)
  const PartialFailureWarning = () => {
    if (!isPartialFailure) return null;

    return (
      <div className={styles.partialFailureWarning}>
        <div className={styles.warningHeader}>
          <AlertTriangle className={styles.warningIcon} size={20} />
          <h3>Some ferry services are temporarily unavailable</h3>
        </div>
        <p className={styles.warningText}>
          We found {results.length} available ferry
          {results.length !== 1 ? "s" : ""} from working operators, but some
          services are currently down.
        </p>

        <details className={styles.operatorDetails}>
          <summary>View service status details</summary>
          <div className={styles.operatorStatusList}>
            {operatorErrors.map((opError, index) => (
              <div key={index} className={styles.operatorStatusItem}>
                <XCircle size={14} className={styles.statusError} />
                <span className={styles.operatorName}>{opError.operator}:</span>
                <span className={styles.operatorErrorText}>
                  {opError.error}
                </span>
              </div>
            ))}
            {/* Show working operators */}
            {["sealink", "makruzz", "greenocean"]
              .filter(
                (op) => !operatorErrors.some((err) => err.operator === op)
              )
              .map((op) => (
                <div key={op} className={styles.operatorStatusItem}>
                  <CheckCircle size={14} className={styles.statusSuccess} />
                  <span className={styles.operatorName}>{op}:</span>
                  <span className={styles.operatorSuccessText}>Available</span>
                </div>
              ))}
          </div>
        </details>

        <div className={styles.warningActions}>
          <Button variant="outline" size="small" onClick={onRetry}>
            Retry All Services
          </Button>
        </div>
      </div>
    );
  };

  // No results state (when search worked but no ferries available)
  if (results.length === 0 && !error) {
    return (
      <div className={styles.ferryResultsContainer}>
        <div className={styles.noResultsContainer}>
          <div className={styles.noResultsIcon}>🚢</div>
          <h2>No ferries available</h2>
          <p>
            No ferry services are running on your selected route and date. This
            could be due to weather conditions, maintenance, or limited service.
          </p>
          <div className={styles.suggestions}>
            <h3>Try these alternatives:</h3>
            <ul>
              <li>Select different travel dates</li>
              <li>Check if ferries run on alternate days</li>
              <li>Contact ferry operators directly for special arrangements</li>
            </ul>
          </div>
          <div className={styles.noResultsActions}>
            <Button variant="primary" onClick={onRetry}>
              Search Again
            </Button>
            <Button variant="secondary" onClick={() => router.push("/ferry")}>
              Modify Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state with results (and optional partial failure warning)
  return (
    <div className={styles.ferryResultsContainer}>
      {/* Show partial failure warning if applicable - this is the key fix */}
      {isPartialFailure && <PartialFailureWarning />}

      {/* Ferry Results List */}
      <div className={styles.ferryList}>
        {results.map((ferry, index) => (
          <FerryCard
            key={`${ferry.operator}-${ferry.id}-${index}`}
            {...transformToFerryCardProps(ferry, index)}
          />
        ))}
      </div>

      {/* Enhanced Results Footer */}
      <div className={styles.resultsFooter}>
        <div className={styles.resultsInfo}>
          <Info size={16} className={styles.infoIcon} />
          <p>
            Showing {results.length} available ferry
            {results.length !== 1 ? "s" : ""} from
            {operatorErrors.length > 0
              ? ` ${3 - operatorErrors.length} of 3 operators`
              : " all operators"}
          </p>
        </div>
        <p className={styles.resultsNote}>
          Prices include all taxes and fees. Final booking confirmation will be
          sent to your email.
        </p>
        {isPartialFailure && (
          <p className={styles.serviceNote}>
            Some services are temporarily unavailable. We're working to restore
            full service.
          </p>
        )}
      </div>
    </div>
  );
}
