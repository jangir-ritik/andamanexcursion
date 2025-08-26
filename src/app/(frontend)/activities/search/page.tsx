// src/app/activities/search/page-rq.tsx
"use client";
import React, { Suspense, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Section, Column, Row } from "@/components/layout";
import styles from "./page.module.css";
import { SectionTitle } from "@/components/atoms";
import { UnifiedSearchingForm } from "@/components/organisms";
import { useActivityRQ } from "@/store";

import {
  ActivityResultsRQ,
  CartSummaryRQ,
  SearchSummary,
} from "@/components/molecules/BookingResults";
import { useActivitiesSearch, useFormOptions } from "@/hooks/queries";

// Main page component with React Query integration
export default function ActivitiesSearchPageRQ() {
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
            <UnifiedSearchingForm
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

// Component for cart content with empty state
const ActivityCartContent = () => {
  const { cart } = useActivityRQ();

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
    <CartSummaryRQ onAddMore={handleAddMore} className={styles.cartContent} />
  );
};

// Component that handles search params and displays results
const ActivitySearchContent = () => {
  const searchParams = useSearchParams();
  const { searchParams: currentParams, updateSearchParams } = useActivityRQ();
  const initializedRef = React.useRef(false);

  // Use React Query for form options to get display names
  const { categories, locations } = useFormOptions();

  // Memoize search params extraction to avoid re-computation
  const urlSearchParams = useMemo(() => {
    const activityType = searchParams.get("activityType");
    const location = searchParams.get("location");
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const adults = parseInt(searchParams.get("adults") || "2", 10);
    const children = parseInt(searchParams.get("children") || "0", 10);

    return {
      activityType,
      location,
      date: date || new Date().toISOString().split("T")[0],
      time: time || "",
      adults,
      children,
    };
  }, [searchParams]);

  // Load search params from URL on mount only once
  useEffect(() => {
    if (initializedRef.current) return;

    const { activityType, location, ...restParams } = urlSearchParams;

    // Trigger search if we have activityType (for category browsing)
    if (activityType) {
      const params = {
        activityType,
        location: location || "", // Optional location
        ...restParams,
      };

      // Update params (React Query will automatically trigger search)
      updateSearchParams(params);
      initializedRef.current = true;
    }
  }, [urlSearchParams, updateSearchParams]);

  // Memoize display names to prevent unnecessary re-computations
  const displayNames = useMemo(() => {
    const selectedActivity = (categories.data || []).find(
      (activity) => activity.slug === currentParams.activityType
    );
    const selectedLocation = (locations.data || []).find(
      (location) => location.slug === currentParams.location
    );

    return {
      activityName: selectedActivity?.name,
      locationName: selectedLocation?.name,
    };
  }, [
    categories.data,
    locations.data,
    currentParams.activityType,
    currentParams.location,
  ]);

  // Memoize total passengers calculation
  const totalPassengers = useMemo(
    () => currentParams.adults + currentParams.children,
    [currentParams.adults, currentParams.children]
  );

  // Get search results to show accurate count in SearchSummary
  const { data: activities = [], isLoading: isLoadingActivities } =
    useActivitiesSearch(currentParams, !!currentParams.activityType);

  // Optimized scroll handler with useCallback
  const handleAddMore = useCallback(() => {
    const formElement = document.getElementById("booking-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Retry handler will be handled by ActivityResultsRQ component

  return (
    <Column gap="var(--space-6)" fullWidth>
      {/* Search Summary & Results Container */}
      <Section className={styles.resultsSection}>
        <Column gap="var(--space-4)" fullWidth>
          {/* Search Summary - Now shows dynamic result count */}
          {currentParams.activityType && (
            <SearchSummary
              loading={isLoadingActivities}
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
          )}

          {/* Activity Results - using React Query version */}
          <ActivityResultsRQ searchParams={currentParams} />
        </Column>
      </Section>
    </Column>
  );
};

// Memoized component for the page title
const ActivityPageTitle = React.memo(() => {
  const { searchParams } = useActivityRQ();
  const { categories } = useFormOptions();

  // Memoize the title computation
  const titleData = useMemo(() => {
    const selectedActivity = (categories.data || []).find(
      (activity) => activity.slug === searchParams.activityType
    );

    const activityName = selectedActivity?.name || "Activities";
    const titleText = `${activityName} in Andaman`;

    return { activityName, titleText };
  }, [categories.data, searchParams.activityType]);

  return (
    <SectionTitle
      specialWord={titleData.activityName}
      text={titleData.titleText}
      id="available-activities-title"
    />
  );
});

ActivityPageTitle.displayName = "ActivityPageTitle";
