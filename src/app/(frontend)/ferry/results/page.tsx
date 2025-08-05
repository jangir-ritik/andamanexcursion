"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { useFerryStore } from "@/store/FerryStore";
import { BookingForm } from "@/components/organisms";
import { FerryResults } from "./components/FerryResults";
import { SearchSummary } from "./components/SearchSummary";
import { TimeFilters } from "./components/TimeFilters";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import styles from "./page.module.css";

interface SmartFilteredResults {
  preferredTime: UnifiedFerryResult[];
  otherTimes: UnifiedFerryResult[];
}

const FerryResultsContent = () => {
  const searchParams = useSearchParams();
  const [filteredResults, setFilteredResults] = useState<UnifiedFerryResult[]>(
    []
  );
  const [smartFilteredResults, setSmartFilteredResults] =
    useState<SmartFilteredResults>({
      preferredTime: [],
      otherTimes: [],
    });
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [userPreferredTime, setUserPreferredTime] = useState<string | null>(
    null
  );

  const {
    searchResults,
    isLoading,
    error,
    setSearchParams,
    searchFerries,
    clearError,
  } = useFerryStore();

  // Extract search parameters from URL
  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");
    const adults = parseInt(searchParams.get("adults") || "2");
    const children = parseInt(searchParams.get("children") || "0");
    const infants = parseInt(searchParams.get("infants") || "0");
    const preferredTime = searchParams.get("preferredTime");

    if (from && to && date) {
      const params = {
        from,
        to,
        date,
        adults,
        children,
        infants,
      };

      setSearchParams(params);
      setUserPreferredTime(preferredTime);
      searchFerries();
    }
  }, [searchParams, setSearchParams, searchFerries]);

  // Smart time filtering based on user's preferred time
  useEffect(() => {
    if (!searchResults || searchResults.length === 0) {
      setSmartFilteredResults({ preferredTime: [], otherTimes: [] });
      setFilteredResults([]);
      return;
    }

    // If user has a preferred time, create smart sections
    if (userPreferredTime) {
      const preferredHour = parseInt(userPreferredTime.split(":")[0]);
      const timeWindow = 2; // 2-hour window around preferred time

      const preferred = searchResults.filter((ferry) => {
        const departureHour = parseInt(
          ferry.schedule.departureTime.split(":")[0]
        );
        return Math.abs(departureHour - preferredHour) <= timeWindow;
      });

      const others = searchResults.filter((ferry) => {
        const departureHour = parseInt(
          ferry.schedule.departureTime.split(":")[0]
        );
        return Math.abs(departureHour - preferredHour) > timeWindow;
      });

      setSmartFilteredResults({
        preferredTime: preferred.sort((a, b) =>
          a.schedule.departureTime.localeCompare(b.schedule.departureTime)
        ),
        otherTimes: others.sort((a, b) =>
          a.schedule.departureTime.localeCompare(b.schedule.departureTime)
        ),
      });

      // Set filteredResults to all for backwards compatibility
      setFilteredResults(searchResults);
    } else {
      // No preferred time, show all results normally
      setSmartFilteredResults({ preferredTime: [], otherTimes: searchResults });
      setFilteredResults(searchResults);
    }
  }, [searchResults, userPreferredTime]);

  // Filter results based on time filter
  useEffect(() => {
    if (!timeFilter || !searchResults) {
      // Don't override smart filtering when no time filter is active
      return;
    }

    const [startHour, endHour] = timeFilter.split("-").map((time) => {
      const hour = parseInt(time.substring(0, 2));
      return hour;
    });

    const filtered = searchResults.filter((ferry) => {
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

    setFilteredResults(filtered);
    // Reset smart filtering when manual time filter is applied
    setSmartFilteredResults({ preferredTime: [], otherTimes: filtered });
  }, [searchResults, timeFilter]);

  const hasPreferredTimeResults = smartFilteredResults.preferredTime.length > 0;
  const hasOtherTimeResults = smartFilteredResults.otherTimes.length > 0;

  return (
    <div className={styles.pageContainer}>
      {/* Modify Search Section - Always on top */}
      <div className={styles.modifySearchSection}>
        <SectionTitle text="Modify Search" specialWord="Search" />
        <BookingForm variant="embedded" className={styles.bookingForm} />
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

      {/* Time Filters */}
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
                🎯 Perfect match for your preferred time ({userPreferredTime})
              </h3>
              <FerryResults
                loading={false}
                results={smartFilteredResults.preferredTime}
                error={null}
                onRetry={searchFerries}
                onClearError={clearError}
              />
            </div>
          )}

          {hasOtherTimeResults && (
            <div className={styles.smartSection}>
              <h3 className={styles.smartSectionTitle}>
                {hasPreferredTimeResults
                  ? "⏰ Other available ferries for the same day"
                  : "Available ferries for your selected date"}
              </h3>
              <FerryResults
                loading={false}
                results={smartFilteredResults.otherTimes}
                error={null}
                onRetry={searchFerries}
                onClearError={clearError}
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
          error={error}
          onRetry={searchFerries}
          onClearError={clearError}
        />
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
    <Section backgroundColor="light" className={styles.ferryResultsPage}>
      <Suspense fallback={<FerryResultsLoader />}>
        <FerryResultsContent />
      </Suspense>
    </Section>
  );
}
