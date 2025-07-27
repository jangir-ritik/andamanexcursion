// src/components/molecules/BookingResults/ActivityResults.tsx
import React, { memo, useMemo, useCallback } from "react";
import { Button } from "@/components/atoms";
import { Column } from "@/components/layout";
import { ActivityCard } from "@/components/molecules/Cards";
import { Activity, ActivitySearchParams } from "@/context/ActivityContext";
import styles from "./BookingResults.module.css";

interface ActivityResultsProps {
  loading: boolean;
  activities: Activity[];
  searchParams: ActivitySearchParams;
  timeFilter?: string | null;
  className?: string;
  onSelectActivity?: (activityId: string) => void;
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

export const ActivityResults = memo<ActivityResultsProps>(
  ({
    loading,
    activities,
    searchParams,
    timeFilter,
    className,
    onSelectActivity,
  }) => {
    // Show loading state if loading
    if (loading) {
      return <LoadingState />;
    }
    // Show no results state if no activities found
    if (!activities || activities.length === 0) {
      return <NoResultsState />;
    }

    // Handle activity selection
    const handleActivitySelection = useCallback(
      (activityId: string) => {
        if (onSelectActivity) {
          onSelectActivity(activityId);
        }
      },
      [onSelectActivity]
    );

    // Transform API activities to match the ActivityCard component props
    const activityCards = useMemo(() => {
      return activities.map((activity) => {
        // Extract the first image or use a placeholder
        const featuredImage = activity.media?.featuredImage;
        const imageUrl = featuredImage
          ? `/api/media/${featuredImage.id}`
          : "/images/placeholder.png";

        // Map activity options to the format expected by ActivityCard
        const options =
          activity.activityOptions?.map((option) => ({
            id:
              option.id || `option-${Math.random().toString(36).substring(7)}`,
            type: option.optionTitle || "Standard",
            price: option.price || activity.coreInfo.basePrice,
            totalPrice:
              (option.price || activity.coreInfo.basePrice) *
              (searchParams.adults + searchParams.children * 0.5),
            description: option.optionDescription || "",
            seatsLeft:
              option.maxCapacity || activity.coreInfo.maxCapacity || 10,
          })) || [];

        return (
          <ActivityCard
            key={activity.id}
            id={activity.id}
            title={activity.title}
            description={
              activity.coreInfo?.shortDescription ||
              activity.coreInfo?.description ||
              ""
            }
            images={[
              {
                src: imageUrl,
                alt: activity.title,
              },
            ]}
            price={activity.coreInfo?.basePrice || 0}
            totalPrice={
              activity.coreInfo?.basePrice *
                (searchParams.adults + searchParams.children * 0.5) || 0
            }
            type={
              Array.isArray(activity.coreInfo?.category)
                ? activity.coreInfo.category[0]?.name || "Activity"
                : "Activity"
            }
            duration={activity.coreInfo?.duration || ""}
            href={`/activities/${activity.slug}`}
            activityOptions={options}
            onSelectActivity={handleActivitySelection}
          />
        );
      });
    }, [activities, searchParams, handleActivitySelection]);

    return (
      <div className={className}>
        {activityCards.length > 0 ? (
          <Column gap="var(--space-4)" fullWidth>
            {activityCards}
          </Column>
        ) : (
          <NoResultsState />
        )}
      </div>
    );
  }
);

ActivityResults.displayName = "ActivityResults";
