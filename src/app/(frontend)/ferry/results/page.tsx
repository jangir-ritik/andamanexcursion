"use client";
import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Section, Column, Row } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { useFerryStore } from "@/store/FerryStore";
import { BookingForm } from "@/components/organisms";
import { FerryResults } from "./components/FerryResults";
import { SearchSummary } from "./components/SearchSummary";
import { TimeFilters } from "./components/TimeFilters";
import styles from "./page.module.css";

// Component that uses useSearchParams - wrapped in Suspense
const FerryResultsContent = () => {
  const searchParams = useSearchParams();
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
      searchFerries();
    }
  }, [searchParams, setSearchParams, searchFerries]);

  return (
    <>
      <SearchSummary
        loading={isLoading}
        ferryCount={searchResults.length}
        searchParams={{
          from: searchParams.get("from") || "",
          to: searchParams.get("to") || "",
          date: searchParams.get("date") || "",
          adults: parseInt(searchParams.get("adults") || "2"),
          children: parseInt(searchParams.get("children") || "0"),
          infants: parseInt(searchParams.get("infants") || "0"),
        }}
      />

      {!isLoading && searchResults.length > 0 && (
        <TimeFilters results={searchResults} />
      )}

      <FerryResults
        loading={isLoading}
        results={searchResults}
        error={error}
        onRetry={() => searchFerries()}
        onClearError={clearError}
      />
    </>
  );
};

// Loading component for Suspense fallback
const FerryResultsLoader = () => (
  <div className={styles.loader}>
    <div className={styles.spinner} />
    <p>Loading ferry options...</p>
  </div>
);

export default function FerryResultsPage() {
  return (
    <main className={styles.main}>
      <Section
        ariaLabelledby="booking-form-title"
        id="booking-form-section"
        className={styles.bookingHeader}
      >
        <h1 className={styles.pageTitle}>Ferry Search Results</h1>
        <BookingForm
          variant="compact"
          initialTab="ferry"
          className={styles.bookingForm}
          hideTabs={true}
        />
      </Section>

      <Section
        id="ferry-results"
        aria-labelledby="ferry-results-title"
        className={styles.ferryResults}
      >
        <Column
          gap="var(--space-10)"
          fullWidth
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          <Row
            justifyContent="between"
            alignItems="center"
            gap="var(--space-4)"
            fullWidth
          >
            <SectionTitle
              specialWord="ferry!"
              text="Choose your ferry!"
              id="ferry-results-title"
            />
          </Row>

          <Suspense fallback={<FerryResultsLoader />}>
            <FerryResultsContent />
          </Suspense>
        </Column>
      </Section>
    </main>
  );
}
