"use client";
import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { useFerryStore } from "@/store/FerryStore";
import { FerryResults } from "./components/FerryResults";
import { SearchSummary } from "./components/SearchSummary";
import { TimeFilters } from "./components/TimeFilters";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import styles from "./page.module.css";
import { UnifiedSearchingForm } from "@/components/organisms";
import { useFerryFlow } from "@/hooks/queries/useFerryStore";

interface SmartFilteredResults {
  preferredTime: UnifiedFerryResult[];
  otherTimes: UnifiedFerryResult[];
}

const FerryResultsContent = () => {
  const searchParams = useSearchParams();
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [userPreferredTime, setUserPreferredTime] = useState<string | null>(
    null
  );

  // Get Zustand state and actions (client state only)
  const { setSearchParams } = useFerryStore();

  // Get React Query state and actions (server state)
  const {
    ferries: searchResults,
    searchErrors,
    isSearching: isLoading,
    searchError: error,
    refetchSearch,
    // Add these new fields from the enhanced hook
    isPartialFailure,
    availableOperators,
    failedOperators,
  } = useFerryFlow();

  // Extract search parameters from URL and trigger search
  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");
    const adults = parseInt(searchParams.get("adults") || "2");
    const children = parseInt(searchParams.get("children") || "0");
    const infants = parseInt(searchParams.get("infants") || "0");
    const preferredTime = searchParams.get("time");

    if (from && to && date) {
      // Update Zustand store with URL parameters
      setSearchParams({
        from,
        to,
        date,
        adults,
        children,
        infants,
      });

      // Set user's preferred time for smart filtering
      setUserPreferredTime(preferredTime);
    }
  }, [searchParams, setSearchParams]);

  // Memoize smart filtered results to prevent infinite loops
  const smartFilteredResults = useMemo((): SmartFilteredResults => {
    if (!searchResults || searchResults.length === 0) {
      return { preferredTime: [], otherTimes: [] };
    }

    // If user has a preferred time, create smart sections
    if (userPreferredTime) {
      const preferredHour = parseInt(userPreferredTime.split(":")[0]);
      const timeWindow = 2; // 2-hour window around preferred time

      const preferred = searchResults.filter((ferry: UnifiedFerryResult) => {
        const departureHour = parseInt(
          ferry.schedule.departureTime.split(":")[0]
        );
        return Math.abs(departureHour - preferredHour) <= timeWindow;
      });

      const others = searchResults.filter((ferry: UnifiedFerryResult) => {
        const departureHour = parseInt(
          ferry.schedule.departureTime.split(":")[0]
        );
        return Math.abs(departureHour - preferredHour) > timeWindow;
      });

      return {
        preferredTime: preferred.sort(
          (a: UnifiedFerryResult, b: UnifiedFerryResult) =>
            a.schedule.departureTime.localeCompare(b.schedule.departureTime)
        ),
        otherTimes: others.sort(
          (a: UnifiedFerryResult, b: UnifiedFerryResult) =>
            a.schedule.departureTime.localeCompare(b.schedule.departureTime)
        ),
      };
    } else {
      // No preferred time, show all results normally
      return { preferredTime: [], otherTimes: searchResults || [] };
    }
  }, [searchResults, userPreferredTime]);

  // Memoize filtered results based on time filter
  const filteredResults = useMemo(() => {
    if (!searchResults || searchResults.length === 0) {
      return [];
    }

    if (!timeFilter) {
      return searchResults;
    }

    const [startHour, endHour] = timeFilter.split("-").map((time) => {
      const hour = parseInt(time.substring(0, 2));
      return hour;
    });

    return searchResults.filter((ferry: UnifiedFerryResult) => {
      const departureHour = parseInt(
        ferry.schedule.departureTime.split(":")[0]
      );

      if (startHour <= endHour) {
        return departureHour >= startHour && departureHour < endHour;
      } else {
        // Handle overnight times (e.g., 18:00 - 05:59)
        return departureHour >= startHour || departureHour < endHour;
      }
    });
  }, [searchResults, timeFilter]);

  // Error handling improvements
  const handleRetry = () => {
    refetchSearch();
  };

  const handleClearError = () => {
    refetchSearch();
  };

  // Enhanced error object creation for the FerryResults component
  const enhancedError = useMemo(() => {
    if (error) {
      // If there's a React Query error, format it properly
      return {
        message: error.message || "Ferry search failed",
        operatorErrors: searchErrors,
        isPartialFailure: isPartialFailure || false,
      };
    }

    if (searchErrors.length > 0 && searchResults.length === 0) {
      // All operators failed
      return {
        message:
          "All ferry operators are temporarily unavailable. Please try again later.",
        operatorErrors: searchErrors,
        isPartialFailure: false,
      };
    }

    if (isPartialFailure && searchResults.length > 0) {
      // Partial failure - use the isPartialFailure flag properly
      return {
        message: `Some ferry operators are temporarily unavailable, but we found ${searchResults.length} options from available services.`,
        operatorErrors: searchErrors,
        isPartialFailure: true,
      };
    }

    return null;
  }, [error, searchErrors, searchResults.length, isPartialFailure]);

  const hasPreferredTimeResults = smartFilteredResults.preferredTime.length > 0;
  const hasOtherTimeResults = smartFilteredResults.otherTimes.length > 0;

  return (
    <div className={styles.pageContainer}>
      {/* Modify Search Section - Always on top */}
      <div className={styles.modifySearchSection}>
        <SectionTitle text="Modify Search" specialWord="Search" />
        <UnifiedSearchingForm
          variant="embedded"
          className={styles.bookingForm}
        />
      </div>

      {/* Search Summary */}
      <div className={styles.searchSummaryWrapper}>
        <SearchSummary
          loading={isLoading}
          ferryCount={filteredResults.length}
          searchParams={{
            from: searchParams.get("from") || "",
            to: searchParams.get("to") || "",
            date: searchParams.get("date") || "",
            adults: parseInt(searchParams.get("adults") || "2"),
            children: parseInt(searchParams.get("children") || "0"),
            infants: parseInt(searchParams.get("infants") || "0"),
          }}
        />
      </div>

      {/* Enhanced Service Status Display - Shows when there are operator issues */}
      {(searchErrors.length > 0 || isPartialFailure) && !isLoading && (
        <div
          className={`${styles.serviceStatusDisplay} ${
            isPartialFailure ? styles.partialFailure : styles.criticalFailure
          }`}
        >
          <div className={styles.serviceStatusHeader}>
            <span className={styles.serviceStatusIcon}>
              {isPartialFailure ? "⚠️" : "❌"}
            </span>
            <h3 className={styles.serviceStatusTitle}>
              {isPartialFailure
                ? `Service Notice: ${searchErrors.length} of 3 operators temporarily unavailable`
                : "Service Alert: All ferry operators are experiencing issues"}
            </h3>
          </div>

          <div className={styles.serviceStatusDetails}>
            {searchErrors.map(
              (error: { operator: string; error: string }, index: number) => (
                <div key={index} className={styles.serviceStatusItem}>
                  <strong>{error.operator}:</strong> {error.error}
                </div>
              )
            )}
          </div>

          {searchResults.length > 0 && isPartialFailure && (
            <div className={styles.serviceStatusNote}>
              <span className={styles.statusSuccess}>✓</span>
              Don't worry - we're still showing {searchResults.length} available
              ferries from working operators.
            </div>
          )}

          <div className={styles.serviceStatusActions}>
            <button
              onClick={handleRetry}
              className={styles.retryAllButton}
              disabled={isLoading}
            >
              {isLoading ? "Retrying..." : "Retry All Services"}
            </button>
          </div>
        </div>
      )}

      {/* Time Filters - Only show if we have results */}
      {searchResults && searchResults.length > 0 && (
        <div className={styles.filtersSection}>
          <TimeFilters timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
          {timeFilter && (
            <div className={styles.filterSummary}>
              Showing {filteredResults.length} of {searchResults.length} ferries
            </div>
          )}
        </div>
      )}

      {/* Smart filtered results sections */}
      {userPreferredTime && !timeFilter && (
        <>
          {hasPreferredTimeResults && (
            <div className={styles.smartSection}>
              <h3 className={styles.smartSectionTitle}>
                Perfect match for your preferred time ({userPreferredTime})
              </h3>
              <FerryResults
                loading={false}
                results={smartFilteredResults.preferredTime}
                error={enhancedError}
                onRetry={handleRetry}
                onClearError={handleClearError}
              />
            </div>
          )}

          {hasOtherTimeResults && (
            <div className={styles.smartSection}>
              <h3 className={styles.smartSectionTitle}>
                {hasPreferredTimeResults
                  ? "Other available ferries for the same day"
                  : "Available ferries for your selected date"}
              </h3>
              <FerryResults
                loading={false}
                results={smartFilteredResults.otherTimes}
                error={enhancedError}
                onRetry={handleRetry}
                onClearError={handleClearError}
              />
            </div>
          )}
        </>
      )}

      {/* Regular results (when no preferred time or manual filter is active) */}
      {(!userPreferredTime || timeFilter) && (
        <FerryResults
          loading={isLoading}
          results={filteredResults}
          error={enhancedError}
          onRetry={handleRetry}
          onClearError={handleClearError}
        />
      )}

      {/* Empty state with retry option - only when not loading and no error */}
      {!isLoading && searchResults.length === 0 && !enhancedError && (
        <div className={styles.emptyState}>
          <h3>No ferries found</h3>
          <p>Try adjusting your search criteria or check back later.</p>
          <button onClick={handleRetry} className={styles.retryButton}>
            Search Again
          </button>
        </div>
      )}
    </div>
  );
};

// Loading component for Suspense fallback
const FerryResultsLoader = () => (
  <div className={styles.pageLoader}>
    <div className={styles.loadingSpinner} />
    <p>Loading ferry search results...</p>
  </div>
);

export default function FerryResultsPage() {
  return (
    <Section className={styles.ferryResultsPage}>
      <Suspense fallback={<FerryResultsLoader />}>
        <FerryResultsContent />
      </Suspense>
    </Section>
  );
}
