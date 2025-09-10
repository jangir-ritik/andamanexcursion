// pages/ferry/results/page.tsx
"use client";
import React, { Suspense } from "react";
import { Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { FerryResults } from "./components/FerryResults";
import { SearchSummary } from "./components/SearchSummary";
import { TimeFilters } from "./components/TimeFilters";
import { ServiceStatusDisplay } from "./components/ServiceStatusDisplay";
import { SmartResultsSection } from "./components/SmartResultsSection";
import { UnifiedSearchingForm } from "@/components/organisms";
import { useFerryFlow } from "@/hooks/queries/useFerryStore";
import { useSearchParamsSync } from "@/hooks/ferrySearch/useSearchParamsSync";
import { useSmartFiltering } from "@/hooks/ferrySearch/useSmartFiltering";
import { useTimeFiltering } from "@/hooks/ferrySearch/useTimeFiltering";
import { useErrorHandling } from "@/hooks/ferrySearch/useErrorHandling";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import LoadingCard from "@/components/molecules/Cards/ComponentStateCards/LoadingCard";
import { useFerryStore } from "@/store";

const FerryResultsContent = () => {
  const router = useRouter();
  const { userPreferredTime } = useSearchParamsSync();

  // remove searchParams from useSearchParamsSync and use stored search params from ferryStore for reactive updates
  const storeSearchParams = useFerryStore((state) => state.searchParams);

  const {
    ferries: searchResults,
    searchErrors,
    isSearching: isLoading,
    searchError: error,
    refetchSearch,
    isPartialFailure,
    hasSearchParamsChanged, // NEW: Track if search is updating
  } = useFerryFlow({
    enableReactiveSearch: true, // Enable reactive search on results page
    debounceMs: 1500,
  });

  const smartFilteredResults = useSmartFiltering(
    searchResults,
    userPreferredTime
  );
  const { timeFilter, setTimeFilter, filteredResults } =
    useTimeFiltering(searchResults);
  const { enhancedError, handleRetry } = useErrorHandling(
    error,
    searchErrors,
    searchResults || [],
    isPartialFailure || false,
    refetchSearch
  );

  const handleNewSearch = () => {
    router.push("/ferry");
  };

  return (
    <div className={styles.pageContainer}>
      {/* Modify Search Section - Now reactive */}
      <div className={styles.modifySearchSection}>
        <SectionTitle text="Modify Search" specialWord="Search" />
        <UnifiedSearchingForm
          variant="embedded"
          className={styles.bookingForm}
          enableReactiveSearch={true} // Enable reactive search
        />
        {/* Show updating indicator */}
        {hasSearchParamsChanged && (
          <div className={styles.searchingIndicator}>Updating results...</div>
        )}
      </div>

      {/* Search Summary */}
      <div className={styles.searchSummaryWrapper}>
        <SearchSummary
          loading={isLoading}
          ferryCount={filteredResults.length}
          searchParams={storeSearchParams}
        />
      </div>

      {/* Centralized Service Status - handles all error states */}
      <ServiceStatusDisplay
        searchErrors={searchErrors}
        isPartialFailure={isPartialFailure || false}
        isLoading={isLoading}
        searchResultsCount={searchResults?.length || 0}
        onRetry={handleRetry}
        onNewSearch={handleNewSearch}
      />

      {/* Time Filters - only show if we have results */}
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

      {/* Smart Results Section - simplified, no error handling */}
      <SmartResultsSection
        userPreferredTime={userPreferredTime}
        timeFilter={timeFilter}
        smartFilteredResults={smartFilteredResults}
      />

      {/* Regular results - simplified, no error handling */}
      {(!userPreferredTime || timeFilter) && (
        <FerryResults loading={isLoading} results={filteredResults} />
      )}
    </div>
  );
};

const FerryResultsLoader = () => (
  <div className={styles.pageLoader}>
    <LoadingCard />
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
