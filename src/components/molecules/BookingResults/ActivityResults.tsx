import React, { memo, useMemo, useCallback } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/atoms";
import { Column } from "@/components/layout";
import { SmallCard } from "@/components/molecules/Cards";
import styles from "./BookingResults.module.css";

// Define the activity card props interface
export interface ActivityCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  price: number;
  totalPrice: number;
  duration: string;
  location: string;
  rating: number;
  availableSlots: number;
}

interface ActivityResultsProps {
  loading: boolean;
  mainTimeGroup: ActivityCardProps[];
  otherTimeGroups: ActivityCardProps[];
  filteredActivities: ActivityCardProps[];
  handleSelectActivity: (activityId: string) => void;
  className?: string;
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

// Memoized activity card wrapper component to prevent unnecessary re-renders
const ActivityCardWrapper = memo<{
  activity: ActivityCardProps;
  onSelectActivity: () => void;
}>(({ activity, onSelectActivity }) => {
  return (
    <SmallCard
      key={activity.id}
      image={activity.image}
      imageAlt={activity.imageAlt}
      title={activity.title}
      description={activity.description}
      price={activity.price}
      href={`/activities/booking?activity=${activity.id}`}
    />
  );
});
ActivityCardWrapper.displayName = "ActivityCardWrapper";

export const ActivityResults = memo<ActivityResultsProps>(
  ({
    loading,
    mainTimeGroup,
    otherTimeGroups,
    filteredActivities,
    handleSelectActivity,
    className,
  }) => {
    // Show loading state if loading
    if (loading) {
      return <LoadingState />;
    }

    // Show no results state if no activities found
    if (!filteredActivities.length) {
      return <NoResultsState />;
    }

    // Create stable callbacks for each activity
    const createSelectHandler = useCallback(
      (activityId: string) => () => {
        handleSelectActivity(activityId);
      },
      [handleSelectActivity]
    );

    // Memoize the main time group cards to prevent unnecessary re-renders
    const mainTimeGroupCards = useMemo(() => {
      return mainTimeGroup.map((activity) => (
        <ActivityCardWrapper
          key={activity.id}
          activity={activity}
          onSelectActivity={createSelectHandler(activity.id)}
        />
      ));
    }, [mainTimeGroup, createSelectHandler]);

    // Memoize the other time groups cards to prevent unnecessary re-renders
    const otherTimeGroupCards = useMemo(() => {
      return otherTimeGroups.map((activity) => (
        <ActivityCardWrapper
          key={activity.id}
          activity={activity}
          onSelectActivity={createSelectHandler(activity.id)}
        />
      ));
    }, [otherTimeGroups, createSelectHandler]);

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
