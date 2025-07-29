// src/app/activities/search/page.tsx
"use client";
import React, { Suspense, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Section, Column, Row } from "@/components/layout";
import styles from "./page.module.css";
import { SectionTitle, Button } from "@/components/atoms";
import { BookingForm } from "@/components/organisms";
import { useActivity } from "@/store/ActivityStore";
import {
  SearchSummary,
  TimeFilters,
  ActivityResults,
  CartSummary,
} from "@/components/molecules/BookingResults";

// Component for cart content with empty state
const ActivityCartContent = () => {
  const { state } = useActivity();
  const { cart } = state;

  // Optimized scroll handler
  const handleAddMore = useCallback(() => {
    const formElement = document.getElementById("booking-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <p className={styles.emptyCartText}>No activities selected yet</p>
        <p className={styles.emptyCartSubtext}>
          Use the form to search and add activities
        </p>
      </div>
    );
  }

  return (
    <CartSummary onAddMore={handleAddMore} className={styles.cartContent} />
  );
};

// Component that handles search params and displays results
const ActivitySearchContent = () => {
  const searchParams = useSearchParams();
  const { state, updateSearchParams, searchActivities } = useActivity();
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

    // Trigger search if we have activityType (for category browsing)
    // or both activityType and location (for full search)
    if (activityType) {
      const params = {
        activityType,
        location: location || "", // Optional location
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
    <Column gap="var(--space-6)" fullWidth>
      {/* Search Summary & Results Container */}
      <Section className={styles.resultsSection}>
        <Column gap="var(--space-4)" fullWidth>
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
            passengers={totalPassengers}
            type="activity"
          />

          {/* Error State */}
          {error && (
            <div className={styles.errorContainer}>
              <div className={styles.errorMessage}>{error}</div>
              <Button variant="secondary" onClick={handleRetry}>
                Try Again
              </Button>
            </div>
          )}

          {/* Activity Results */}
          <ActivityResults
            loading={isLoading}
            activities={activities}
            searchParams={currentParams}
          />
        </Column>
      </Section>
    </Column>
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

// Main page component with unified management section
export default function ActivitiesSearchPage() {
  return (
    <main className={styles.main}>
      {/* Management Section - Cart + Booking Form */}
      <Section
        ariaLabelledby="management-section"
        id="booking-form-section"
        className={styles.managementSection}
      >
        <Column gap="var(--space-6)" fullWidth alignItems="start">
          {/* Top - Booking Form */}
          <h1 className={styles.sectionHeading}>Your Activities</h1>
          <Row gap="var(--space-3)" className={styles.formColumn}>
            <BookingForm
              variant="embedded"
              initialTab="activities"
              className={styles.bookingForm}
            />
          </Row>
          {/* Bottom - Your Activities Cart */}
          <Row gap="var(--space-3)" fullWidth className={styles.cartColumn}>
            <Suspense
              fallback={
                <div className={styles.cartLoading}>Loading cart...</div>
              }
            >
              <ActivityCartContent />
            </Suspense>
          </Row>
        </Column>
      </Section>

      {/* Search Results Section */}
      <Section
        id="search-results"
        aria-labelledby="search-results-content"
        className={styles.contentArea}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <ActivityPageTitle />
        </Suspense>
        <Suspense
          fallback={
            <div className={styles.loadingFallback}>
              <div className={styles.spinner} />
              <p>Loading your activity search...</p>
            </div>
          }
        >
          <ActivitySearchContent />
        </Suspense>
      </Section>
    </main>
  );
}
