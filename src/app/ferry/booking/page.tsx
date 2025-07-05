"use client";
import React, { Suspense } from "react";
import { Section, Column, Row } from "@/components/layout";
import styles from "./page.module.css";
import { SectionTitle } from "@/components/atoms";
import { Partners } from "@/components/sectionBlocks/common";
import { BookingForm } from "@/components/organisms";
import useFerryBooking from "@/hooks/useFerryBooking";
import { SearchSummary, TimeFilters, FerryResults } from "./components";

// Component that uses useSearchParams - this needs to be wrapped in Suspense
const FerryBookingContent = () => {
  const [state, actions] = useFerryBooking();

  const {
    mainTimeGroup,
    otherTimeGroups,
    loading,
    from,
    to,
    date,
    time,
    timeFilter,
    filteredFerries,
    passengers,
  } = state;

  const { handleChooseSeats, setTimeFilter } = actions;

  return (
    <>
      <SearchSummary
        loading={loading}
        ferryCount={mainTimeGroup.length}
        from={from}
        to={to}
        date={date}
        time={time}
        timeFilter={timeFilter}
        passengers={passengers}
      />

      {!loading && (
        <TimeFilters timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
      )}

      <FerryResults
        loading={loading}
        mainTimeGroup={mainTimeGroup}
        otherTimeGroups={otherTimeGroups}
        filteredFerries={filteredFerries}
        handleChooseSeats={handleChooseSeats}
      />
    </>
  );
};

// Loading component for Suspense fallback
const FerryBookingLoader = () => (
  <div className={styles.loader}>
    <div className={styles.spinner} />
    <p>Loading ferry options...</p>
  </div>
);

export default function FerryBookingPage() {
  return (
    <main className={styles.main}>
      <Section
        ariaLabelledby="booking-form-title"
        id="booking-form-section"
        className={styles.bookingHeader}
      >
        <h1 className={styles.pageTitle}>Ferry Booking</h1>
        <BookingForm
          variant="compact"
          initialTab="ferry"
          className={styles.bookingForm}
        />
      </Section>

      <Section
        id="available-ferries"
        aria-labelledby="available-ferries-title"
        className={styles.availableFerries}
      >
        <Column gap="var(--space-10)" fullWidth>
          <Row
            justifyContent="between"
            alignItems="center"
            gap="var(--space-4)"
            fullWidth
          >
            <SectionTitle
              specialWord="ferry!"
              text="Choose your ferry!"
              id="available-ferries-title"
            />
          </Row>

          {/* Suspense is needed because FerryBookingContent uses useSearchParams */}
          <Suspense fallback={<FerryBookingLoader />}>
            <FerryBookingContent />
          </Suspense>
        </Column>
      </Section>

      <Partners />
    </main>
  );
}
