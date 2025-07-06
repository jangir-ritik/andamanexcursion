import React, { memo, useMemo, useCallback } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/atoms";
import { Column } from "@/components/layout";
import { ActivityCard } from "@/components/molecules/Cards";
import styles from "./BookingResults.module.css";
import type { ActivityCardProps } from "@/components/molecules/Cards/ActivityCard/ActivityCard.types";

interface ActivityResultsProps {
  loading: boolean;
  mainTimeGroup: ActivityCardProps[];
  otherTimeGroups: ActivityCardProps[];
  filteredActivities: ActivityCardProps[];
  className?: string;
  onSelectActivity?: (activityId: string, optionId: string) => void;
}

// Memoized loading component
const LoadingState = memo(() => (
  <div className={styles.loadingContainer}>
    <p>Loading available activities...</p>
  </div>
));
LoadingState.displayName = "LoadingState";

// Memoized no results component
const NoResultsState = memo(() => (
  <div className={styles.noResultsContainer}>
    <p>
      No activities found for your search. Please try different dates or
      activities.
    </p>
    <Button href="/activities" variant="primary">
      Back to Search
    </Button>
  </div>
));
NoResultsState.displayName = "NoResultsState";

// Memoized other options header
const OtherOptionsHeader = memo(() => (
  <div className={styles.otherOptionsHeader}>
    <h2>Other Activity Options</h2>
    <div className={styles.resultCount}>
      <Info size={16} />
      <span>Activity Options for other time slots</span>
    </div>
  </div>
));
OtherOptionsHeader.displayName = "OtherOptionsHeader";

export const ActivityResults = memo<ActivityResultsProps>(
  ({
    loading,
    mainTimeGroup,
    otherTimeGroups,
    filteredActivities,
    className,
    onSelectActivity,
  }) => {
    // Show loading state if loading
    if (loading) {
      return <LoadingState />;
    }

    // Show no results state if no activities found
    if (!filteredActivities.length) {
      return <NoResultsState />;
    }

    // Handle activity selection
    const handleActivitySelection = useCallback(
      (activityId: string, optionId: string) => {
        if (onSelectActivity) {
          onSelectActivity(activityId, optionId);
        }
      },
      [onSelectActivity]
    );

    // Memoize the main time group cards to prevent unnecessary re-renders
    const mainTimeGroupCards = useMemo(() => {
      return mainTimeGroup.map((activity) => (
        <ActivityCard
          key={activity.id}
          id={activity.id}
          title={activity.title}
          description={activity.description}
          images={activity.images}
          price={activity.price}
          totalPrice={activity.totalPrice}
          type={activity.type}
          duration={activity.duration}
          href={`/activities/booking?activity=${activity.id}`}
          activityOptions={activity.activityOptions}
          onSelectActivity={handleActivitySelection}
        />
      ));
    }, [mainTimeGroup, handleActivitySelection]);

    // Memoize the other time groups cards to prevent unnecessary re-renders
    const otherTimeGroupCards = useMemo(() => {
      return otherTimeGroups.map((activity) => (
        <ActivityCard
          key={activity.id}
          id={activity.id}
          title={activity.title}
          description={activity.description}
          images={activity.images}
          price={activity.price}
          totalPrice={activity.totalPrice}
          type={activity.type}
          duration={activity.duration}
          href={`/activities/booking?activity=${activity.id}`}
          activityOptions={activity.activityOptions}
          onSelectActivity={handleActivitySelection}
        />
      ));
    }, [otherTimeGroups, handleActivitySelection]);

    // Check if we have any activities in each group
    const hasMainTimeGroup = mainTimeGroup.length > 0;
    const hasOtherTimeGroups = otherTimeGroups.length > 0;

    return (
      <div className={className}>
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
      </div>
    );
  }
);

ActivityResults.displayName = "ActivityResults";
