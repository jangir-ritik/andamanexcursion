"use client";
import React, { Suspense } from "react";
import { Section, Column, Row } from "@/components/layout";
import styles from "./page.module.css";
import { SectionTitle } from "@/components/atoms";
import { Partners } from "@/components/sectionBlocks/common";
import { BookingForm } from "@/components/organisms";
import useActivityBooking from "@/hooks/useActivityBooking";
import { useActivityBookingContext } from "@/context/ActivityBookingContext";
import {
  SearchSummary,
  TimeFilters,
  ActivityResults,
} from "@/components/molecules/BookingResults";

// Component that uses useSearchParams - this needs to be wrapped in Suspense
const ActivitiesBookingContent = () => {
  // Get basic booking parameters from useActivityBooking hook
  const [bookingParams, bookingActions] = useActivityBooking();

  // Get activity-specific state from context
  const { activityState, setTimeFilter: setActivityTimeFilter } =
    useActivityBookingContext();

  const {
    mainTimeGroup,
    otherTimeGroups,
    loading,
    filteredActivities,
    timeFilter,
  } = activityState;

  const { activity, date, time, passengers } = bookingParams;

  const { handleSelectActivity } = bookingActions;

  return (
    <>
      <SearchSummary
        loading={loading}
        resultCount={mainTimeGroup.length}
        activity={activity}
        date={date}
        time={time}
        timeFilter={timeFilter}
        passengers={passengers}
        type="activity"
      />

      {!loading && (
        <TimeFilters
          timeFilter={timeFilter}
          setTimeFilter={setActivityTimeFilter}
        />
      )}

      <ActivityResults
        loading={loading}
        mainTimeGroup={mainTimeGroup}
        otherTimeGroups={otherTimeGroups}
        filteredActivities={filteredActivities}
        handleSelectActivity={handleSelectActivity}
      />
    </>
  );
};

// Loading component for Suspense fallback
const ActivitiesBookingLoader = () => (
  <div className={styles.loader}>
    <div className={styles.spinner} />
    <p>Loading activity options...</p>
  </div>
);

export default function ActivitiesBookingPage() {
  return (
    <main className={styles.main}>
      <Section
        ariaLabelledby="booking-form-title"
        id="booking-form-section"
        className={styles.bookingHeader}
      >
        <h1 className={styles.pageTitle}>Activities Booking</h1>
        <BookingForm
          variant="compact"
          initialTab="activities"
          className={styles.bookingForm}
          hideTabs={true}
        />
      </Section>

      <Section
        id="available-activities"
        aria-labelledby="available-activities-title"
        className={styles.availableActivities}
      >
        <Column gap="var(--space-10)" fullWidth>
          <Row
            justifyContent="between"
            alignItems="center"
            gap="var(--space-4)"
            fullWidth
          >
            <SectionTitle
              specialWord="activities!"
              text="Choose your activities!"
              id="available-activities-title"
            />
          </Row>

          {/* Suspense is needed because ActivitiesBookingContent uses useSearchParams */}
          <Suspense fallback={<ActivitiesBookingLoader />}>
            <ActivitiesBookingContent />
          </Suspense>
        </Column>
      </Section>

      <Partners />
    </main>
  );
}
