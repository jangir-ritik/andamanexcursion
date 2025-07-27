// src/app/activities/search/page.tsx
"use client";
import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Section, Column, Row } from "@/components/layout";
import styles from "../page.module.css";
import { SectionTitle, Button } from "@/components/atoms";
import { BookingForm } from "@/components/organisms";
import { useActivity } from "@/context/ActivityContext";
import { ActivityCard } from "@/components/molecules/Cards";
import {
  SearchSummary,
  TimeFilters,
  ActivityResults,
} from "@/components/molecules/BookingResults";

// Component that handles search params and displays results
const ActivitySearchContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, updateSearchParams, searchActivities } = useActivity();
  const [timeFilter, setTimeFilter] = React.useState<string | null>(null);
  const initializedRef = React.useRef(false);

  // Load search params from URL on mount only once
  useEffect(() => {
    if (initializedRef.current) return;

    const activityType = searchParams.get("activityType");
    const location = searchParams.get("location");

    if (activityType && location) {
      const date = searchParams.get("date");
      const time = searchParams.get("time");
      const adults = parseInt(searchParams.get("adults") || "2", 10);
      const children = parseInt(searchParams.get("children") || "0", 10);
      const infants = parseInt(searchParams.get("infants") || "0", 10);

      const params = {
        activityType,
        location,
        date: date || new Date().toISOString().split("T")[0],
        time: time || "",
        adults,
        children,
        infants,
      };

      // Update params and trigger search
      updateSearchParams(params);

      // Use setTimeout to ensure state update happens first
      setTimeout(() => {
        searchActivities(params);
      }, 0);

      initializedRef.current = true;
    }
  }, []); // Empty dependency array - only run once on mount

  const {
    searchParams: currentParams,
    activities,
    isLoading,
    error,
    cart,
  } = state;

  // Get activity and location names from options for display
  const selectedActivity = state.formOptions.activityTypes.find(
    (activity) => activity.value === currentParams.activityType
  );
  const selectedLocation = state.formOptions.locations.find(
    (location) => location.value === currentParams.location
  );

  const totalPassengers =
    currentParams.adults + currentParams.children + currentParams.infants;

  const handleSelectActivity = (activityId: string) => {
    // Navigate to activity details or booking page
    router.push(`/activities/${activityId}`);
  };

  return (
    <>
      {/* Search Summary */}
      <SearchSummary
        loading={isLoading}
        resultCount={activities.length}
        activity={currentParams.activityType}
        activityName={selectedActivity?.label}
        location={currentParams.location}
        locationName={selectedLocation?.label}
        date={currentParams.date}
        time={currentParams.time}
        timeFilter={timeFilter}
        passengers={totalPassengers}
        type="activity"
      />

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className={styles.cartSummary}>
          <div className={styles.cartInfo}>
            <span className={styles.cartCount}>
              {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
            </span>
            <span className={styles.cartTotal}>
              ₹{state.cart.reduce((total, item) => total + item.totalPrice, 0)}
            </span>
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={() => router.push("/checkout")}
          >
            View Cart
          </Button>
        </div>
      )}

      {/* Time Filters */}
      {!isLoading && activities.length > 0 && (
        <TimeFilters timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
      )}

      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>{error}</div>
          <Button variant="secondary" onClick={() => searchActivities()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Activity Results */}
      <ActivityResults
        loading={isLoading}
        activities={activities}
        searchParams={currentParams}
        timeFilter={timeFilter}
        onSelectActivity={handleSelectActivity}
      />
    </>
  );
};

// Component for the page title
const ActivityPageTitle = () => {
  const { state } = useActivity();
  const { searchParams, formOptions } = state;

  const selectedActivity = formOptions.activityTypes.find(
    (activity) => activity.value === searchParams.activityType
  );

  const activityName = selectedActivity?.label || "Activities";
  const titleText = `${activityName} in Andaman`;

  return (
    <SectionTitle
      specialWord={activityName}
      text={titleText}
      id="available-activities-title"
    />
  );
};

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
