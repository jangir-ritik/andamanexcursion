// pages/ferry/results/page.tsx - SIMPLIFIED
"use client";
import React, { Suspense } from "react";
import { Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { FerryResults } from "./components/FerryResults";
import { SearchSummary } from "./components/SearchSummary";
import { ServiceStatusDisplay } from "./components/ServiceStatusDisplay";
import { UnifiedSearchingForm } from "@/components/organisms";
import { useFerryFlow } from "@/hooks/queries/useFerryStore";
// import { useSearchParamsSync } from "@/hooks/ferrySearch/useSearchParamsSync";
import { useTimeFiltering } from "@/hooks/ferrySearch/useTimeFiltering";
import { useErrorHandling } from "@/hooks/ferrySearch/useErrorHandling";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import LoadingCard from "@/components/molecules/Cards/ComponentStateCards/LoadingCard";
import { useFerryStore } from "@/store";

const FerryResultsContent = () => {
  const router = useRouter();

  // Get search params from store instead of URL for reactive updates
  const storeSearchParams = useFerryStore((state) => state.searchParams);
  const preferredTime = useFerryStore((state) => state.preferredTime);

  const {
    ferries: searchResults,
    searchErrors,
    isSearching: isLoading,
    searchError: error,
    refetchSearch,
    isPartialFailure,
    hasSearchParamsChanged,
  } = useFerryFlow({
    enableReactiveSearch: true,
    debounceMs: 1500,
  });

  // Apply timing preference filtering (no manual filters needed)
  const { filteredResults } = useTimeFiltering(searchResults || []);

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

  // Show preferred time info
  const getTimingDisplay = () => {
    if (!preferredTime) return "Any Time";

    switch (preferredTime) {
      case "0600-1200":
        return "Morning";
      case "1200-1800":
        return "Afternoon";
      case "1800-2359":
        return "Evening";
      default:
        return "Any Time";
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Modify Search Section */}
      <div className={styles.modifySearchSection}>
        <SectionTitle text="Modify Search" specialWord="Search" />
        <UnifiedSearchingForm
          variant="embedded"
          className={styles.bookingForm}
          enableReactiveSearch={true}
          showManualSearch={false}
        />
        {hasSearchParamsChanged && (
          <div className={styles.searchingIndicator}>Updating results...</div>
        )}
      </div>

      {/* Search Summary with timing preference */}
      <div className={styles.searchSummaryWrapper}>
        <SearchSummary
          loading={isLoading}
          ferryCount={filteredResults.length}
          searchParams={storeSearchParams}
        />
        {preferredTime && (
          <div className={styles.filterSummary}>
            Showing {getTimingDisplay()} departures • {filteredResults.length}{" "}
            ferries found
          </div>
        )}
      </div>

      {/* Service Status */}
      <ServiceStatusDisplay
        searchErrors={searchErrors}
        isPartialFailure={isPartialFailure || false}
        isLoading={isLoading}
        searchResultsCount={searchResults?.length || 0}
        onRetry={handleRetry}
        onNewSearch={handleNewSearch}
      />

      {/* Results - now shows filtered results based on form preference */}
      <FerryResults
        loading={isLoading}
        results={filteredResults}
        // showTimingInfo={!!preferredTime}
      />
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
