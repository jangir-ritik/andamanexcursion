// src/components/molecules/BookingResults/ActivityResults.tsx
import React, { memo, useMemo, useCallback } from "react";
import { Button } from "@/components/atoms";
import { Column } from "@/components/layout";
import { Activity, ActivitySearchParams } from "@/context/ActivityContext";
import { useActivity } from "@/context/ActivityContext";
import styles from "./BookingResults.module.css";
import ActivityCard from "../Cards/ActivityCard/ActivityCard";

interface ActivityResultsProps {
  loading: boolean;
  activities: Activity[];
  searchParams: ActivitySearchParams;
  timeFilter?: string | null;
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

export const ActivityResults = memo<ActivityResultsProps>(
  ({ loading, activities, searchParams, timeFilter, className }) => {
    // ALWAYS define hooks at the top level
    const { addToCart } = useActivity();

    // Create stable option ID generator
    const getStableOptionId = useCallback(
      (activityId: string, index: number) => {
        return `${activityId}-option-${index}`;
      },
      []
    );

    // Optimized activity selection handler - only adds to cart, no navigation
    const handleActivitySelection = useCallback(
      (activityId: string, optionId: string) => {
        // Find the selected activity
        const selectedActivity = activities.find(
          (activity) => activity.id === activityId
        );

        if (selectedActivity) {
          // Add activity to cart with quantity 1
          addToCart(selectedActivity, 1, optionId);

        }
      },
      [activities, addToCart]
    );

    // Memoized price calculation helper
    const calculateTotalPrice = useCallback(
      (basePrice: number) => {
        return basePrice * (searchParams.adults + searchParams.children * 0.5);
      },
      [searchParams.adults, searchParams.children]
    );

    // Transform API activities to match the ActivityCard component props
    const activityCards = useMemo(() => {
      if (loading || !activities || activities.length === 0) {
        return [];
      }

      return activities.map((activity) => {
        // Extract the first image or use a placeholder
        const featuredImage = activity.media?.featuredImage;
        const imageUrl = featuredImage
          ? `/api/media/${featuredImage.id}`
          : "/images/placeholder.png";

        // Get base price with fallback
        const basePrice = activity.coreInfo?.basePrice || 0;

        // Map activity options to the format expected by ActivityCard
        const options =
          activity.activityOptions?.map((option, index) => {
            const optionPrice = option.price || basePrice;
            return {
              id: option.id || getStableOptionId(activity.id, index),
              type: option.optionTitle || "Standard",
              price: optionPrice,
              totalPrice: calculateTotalPrice(optionPrice),
              description: option.optionDescription || "",
              seatsLeft:
                option.maxCapacity || activity.coreInfo.maxCapacity || 10,
            };
          }) || [];

        // Get activity category name
        const categoryName = Array.isArray(activity.coreInfo?.category)
          ? activity.coreInfo.category[0]?.name || "Activity"
          : "Activity";

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
            price={basePrice}
            totalPrice={calculateTotalPrice(basePrice)}
            type={categoryName}
            duration={activity.coreInfo?.duration || ""}
            href={`/activities/${activity.slug}`} // Keep for potential future use
            activityOptions={options}
            onSelectActivity={handleActivitySelection}
          />
        );
      });
    }, [
      activities,
      searchParams,
      handleActivitySelection,
      getStableOptionId,
      loading,
      calculateTotalPrice,
    ]);

    // Handle conditional rendering after all hooks are defined
    if (loading) {
      return <LoadingState />;
    }

    if (!activities || activities.length === 0) {
      return <NoResultsState />;
    }

    return (
      <div className={className}>
        <Column gap="var(--space-4)" fullWidth>
          {activityCards}
        </Column>
      </div>
    );
  }
);

ActivityResults.displayName = "ActivityResults";
