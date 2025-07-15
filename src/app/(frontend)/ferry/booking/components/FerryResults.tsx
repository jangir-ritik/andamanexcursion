import React, { memo, useMemo, useCallback } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/atoms";
import { Column } from "@/components/layout";
import { FerryCard } from "@/components/molecules/Cards";
import { FerryCardProps } from "@/components/molecules/Cards/FerryCard/FerryCard.types";
import styles from "../page.module.css";

interface FerryResultsProps {
  loading: boolean;
  mainTimeGroup: FerryCardProps[];
  otherTimeGroups: FerryCardProps[];
  filteredFerries: FerryCardProps[];
  handleChooseSeats: (classType: string, ferryIndex: number) => void;
}

// Memoized loading component
const LoadingState = memo(() => (
  <div className={styles.loadingContainer}>
    <p>Loading available ferries...</p>
  </div>
));
LoadingState.displayName = "LoadingState";

// Memoized no results component
const NoResultsState = memo(() => (
  <div className={styles.noResultsContainer}>
    <p>
      No ferries found for your search. Please try different dates or
      destinations.
    </p>
    <Button href="/ferry" variant="primary">
      Back to Search
    </Button>
  </div>
));
NoResultsState.displayName = "NoResultsState";

// Memoized other options header
const OtherOptionsHeader = memo(() => (
  <div className={styles.otherOptionsHeader}>
    <h2>Other Ferry Options</h2>
    <div className={styles.ferryCount}>
      <Info size={16} />
      <span>Ferry Options for other time slots</span>
    </div>
  </div>
));
OtherOptionsHeader.displayName = "OtherOptionsHeader";

// Memoized ferry card wrapper component to prevent unnecessary re-renders
const FerryCardWrapper = memo<{
  ferry: FerryCardProps;
  onChooseSeats: (classType: string) => void;
  ferryIndex: number;
}>(({ ferry, onChooseSeats, ferryIndex }) => {
  return (
    <FerryCard
      ferryName={ferry.ferryName}
      rating={ferry.rating}
      departureTime={ferry.departureTime}
      departureLocation={ferry.departureLocation}
      arrivalTime={ferry.arrivalTime}
      arrivalLocation={ferry.arrivalLocation}
      price={ferry.price}
      totalPrice={ferry.totalPrice}
      seatsLeft={ferry.seatsLeft}
      ferryClasses={ferry.ferryClasses}
      onChooseSeats={onChooseSeats}
      ferryIndex={ferryIndex}
      detailsUrl={`/ferry/booking/${ferryIndex}`}
    />
  );
});
FerryCardWrapper.displayName = "FerryCardWrapper";

export const FerryResults = memo<FerryResultsProps>(
  ({
    loading,
    mainTimeGroup,
    otherTimeGroups,
    filteredFerries,
    handleChooseSeats,
  }) => {
    // Always call all Hooks at the top level in the same order
    // Memoized computed values - call these first, before any conditional returns
    const hasNoResults = useMemo(
      () => filteredFerries.length === 0,
      [filteredFerries.length]
    );

    const hasMainTimeGroup = useMemo(
      () => mainTimeGroup.length > 0,
      [mainTimeGroup.length]
    );

    const hasOtherTimeGroups = useMemo(
      () => otherTimeGroups.length > 0,
      [otherTimeGroups.length]
    );

    // Create a callback factory function instead of individual callbacks
    const createSeatSelectionHandler = useCallback(
      (ferryIndex: number) => (classType: string) => {
        handleChooseSeats(classType, ferryIndex);
      },
      [handleChooseSeats]
    );

    // Early returns for different states - after all Hooks have been called
    if (loading) {
      return <LoadingState />;
    }

    if (hasNoResults) {
      return <NoResultsState />;
    }

    // Render the main time group ferries
    const mainTimeGroupCards = mainTimeGroup.map((ferry, index) => (
      <FerryCardWrapper
        key={`main-${ferry.ferryName}-${ferry.departureTime}-${index}`}
        ferry={ferry}
        onChooseSeats={createSeatSelectionHandler(index)}
        ferryIndex={index}
      />
    ));

    // Render the other time group ferries
    const otherTimeGroupCards = otherTimeGroups.map((ferry, index) => {
      const adjustedIndex = mainTimeGroup.length + index;
      return (
        <FerryCardWrapper
          key={`other-${ferry.ferryName}-${ferry.departureTime}-${index}`}
          ferry={ferry}
          onChooseSeats={createSeatSelectionHandler(adjustedIndex)}
          ferryIndex={adjustedIndex}
        />
      );
    });

    return (
      <>
        {hasMainTimeGroup && (
          <Column gap={4} fullWidth>
            {mainTimeGroupCards}
          </Column>
        )}

        {hasOtherTimeGroups && (
          <>
            <OtherOptionsHeader />
            <Column gap="var(--space-4)" fullWidth>
              {otherTimeGroupCards}
            </Column>
          </>
        )}
      </>
    );
  }
);

FerryResults.displayName = "FerryResults";
