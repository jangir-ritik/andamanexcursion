// src/app/activities/search/page.tsx
"use client";
import React, { Suspense, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Section, Column, Row } from "@/components/layout";
import styles from "../page.module.css";
import { SectionTitle, Button } from "@/components/atoms";
import { BookingForm } from "@/components/organisms";
import { useActivity } from "@/context/ActivityContext";
import {
  SearchSummary,
  TimeFilters,
  ActivityResults,
  CartSummary,
} from "@/components/molecules/BookingResults";

// Component that handles search params and displays results
const ActivitySearchContent = () => {
  const searchParams = useSearchParams();
  const { state, updateSearchParams, searchActivities } = useActivity();
  const [timeFilter, setTimeFilter] = React.useState<string | null>(null);
  const initializedRef = React.useRef(false);

  // Memoize search params extraction to avoid re-computation
  const urlSearchParams = useMemo(() => {
    const activityType = searchParams.get("activityType");
    const location = searchParams.get("location");
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const adults = parseInt(searchParams.get("adults") || "2", 10);
    const children = parseInt(searchParams.get("children") || "0", 10);
    const infants = parseInt(searchParams.get("infants") || "0", 10);

    return {
      activityType,
      location,
      date: date || new Date().toISOString().split("T")[0],
      time: time || "",
      adults,
      children,
      infants,
    };
  }, [searchParams]);

  // Load search params from URL on mount only once
  useEffect(() => {
    if (initializedRef.current) return;

    const { activityType, location, ...restParams } = urlSearchParams;

    if (activityType && location) {
      const params = {
        activityType,
        location,
        ...restParams,
      };

      // Update params and trigger search
      updateSearchParams(params);

      // Use setTimeout to ensure state update happens first
      setTimeout(() => {
        searchActivities(params);
      }, 0);

      initializedRef.current = true;
    }
  }, [urlSearchParams, updateSearchParams, searchActivities]);

  const { searchParams: currentParams, activities, isLoading, error } = state;

  // Memoize display names to prevent unnecessary re-computations
  const displayNames = useMemo(() => {
    const selectedActivity = state.formOptions.activityTypes.find(
      (activity) => activity.value === currentParams.activityType
    );
    const selectedLocation = state.formOptions.locations.find(
      (location) => location.value === currentParams.location
    );

    return {
      activityName: selectedActivity?.label,
      locationName: selectedLocation?.label,
    };
  }, [state.formOptions, currentParams.activityType, currentParams.location]);

  // Memoize total passengers calculation
  const totalPassengers = useMemo(
    () => currentParams.adults + currentParams.children + currentParams.infants,
    [currentParams.adults, currentParams.children, currentParams.infants]
  );

  // Optimized scroll handler with useCallback
  const handleAddMore = useCallback(() => {
    const formElement = document.getElementById("booking-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Optimized retry handler
  const handleRetry = useCallback(() => {
    searchActivities(currentParams);
  }, [searchActivities, currentParams]);

  return (
    <>
      {/* Cart Summary */}
      <CartSummary onAddMore={handleAddMore} />

      {/* Search Summary */}
      <SearchSummary
        loading={isLoading}
        resultCount={activities.length}
        activity={currentParams.activityType}
        activityName={displayNames.activityName}
        location={currentParams.location}
        locationName={displayNames.locationName}
        date={currentParams.date}
        time={currentParams.time}
        timeFilter={timeFilter}
        passengers={totalPassengers}
        type="activity"
      />

      {/* Time Filters */}
      {!isLoading && activities.length > 0 && (
        <TimeFilters timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
      )}

      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>{error}</div>
          <Button variant="secondary" onClick={handleRetry}>
            Try Again
          </Button>
        </div>
      )}

      {/* Activity Results - No onSelectActivity prop needed since we're not navigating */}
      <ActivityResults
        loading={isLoading}
        activities={activities}
        searchParams={currentParams}
        timeFilter={timeFilter}
      />
    </>
  );
};

// Memoized component for the page title
const ActivityPageTitle = React.memo(() => {
  const { state } = useActivity();
  const { searchParams, formOptions } = state;

  // Memoize the title computation
  const titleData = useMemo(() => {
    const selectedActivity = formOptions.activityTypes.find(
      (activity) => activity.value === searchParams.activityType
    );

    const activityName = selectedActivity?.label || "Activities";
    const titleText = `${activityName} in Andaman`;

    return { activityName, titleText };
  }, [formOptions.activityTypes, searchParams.activityType]);

  return (
    <SectionTitle
      specialWord={titleData.activityName}
      text={titleData.titleText}
      id="available-activities-title"
    />
  );
});

ActivityPageTitle.displayName = "ActivityPageTitle";

// Main page component
export default function ActivitiesSearchPage() {
  return (
    <main className={styles.main}>
      {/* Booking Form Section */}
      <Section
        ariaLabelledby="booking-form-title"
        id="booking-form-section"
        className={styles.bookingHeader}
      >
        <h1 className={styles.pageTitle}>Your Activity</h1>
        <BookingForm
          variant="embedded"
          initialTab="activities"
          className={styles.bookingForm}
        />
      </Section>

      {/* Search Results Section */}
      <Section
        id="search-results"
        aria-labelledby="available-activities-title"
        className={styles.searchResults}
      >
        <Column
          gap="var(--space-6)"
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
            <Suspense fallback={<div>Loading...</div>}>
              <ActivityPageTitle />
            </Suspense>
          </Row>

          <Suspense fallback={<div>Loading search results...</div>}>
            <ActivitySearchContent />
          </Suspense>
        </Column>
      </Section>
    </main>
  );
}
