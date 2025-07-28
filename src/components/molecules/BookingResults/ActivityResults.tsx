// src/components/molecules/BookingResults/ActivityResults.tsx
import React, { memo, useMemo, useCallback } from "react";
import { Button } from "@/components/atoms";
import { Column } from "@/components/layout";
import { Activity, ActivitySearchParams } from "@/store/ActivityStore";
import { useActivity } from "@/store/ActivityStore";
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
    const { addToCart, saveEditedItem, state, cancelEditing, getCartItemById } =
      useActivity();

    // Create stable option ID generator
    const getStableOptionId = useCallback(
      (activityId: string, index: number) => {
        return `${activityId}-option-${index}`;
      },
      []
    );

    // Optimized activity selection handler - handles both add and replace operations
    const handleActivitySelection = useCallback(
      (activityId: string, optionId: string) => {
        // Find the selected activity
        const selectedActivity = activities.find(
          (activity) => activity.id === activityId
        );

        if (selectedActivity) {
          // Check if we're in edit mode
          if (state.editingItemId) {
            // Save the edited item with the new activity
            saveEditedItem(state.editingItemId, selectedActivity, optionId);
          } else {
            // Add new activity to cart with current search params
            addToCart(selectedActivity, 1, optionId, searchParams);
          }
        }
      },
      [activities, state.editingItemId, saveEditedItem, addToCart, searchParams]
    );

    // Memoized price calculation helper
    const calculateTotalPrice = useCallback(
      (basePrice: number) => {
        return basePrice * (searchParams.adults + searchParams.children * 0.5);
      },
      [searchParams.adults, searchParams.children]
    );

    // Filter activities by time if timeFilter is provided
    const filteredActivities = useMemo(() => {
      if (!timeFilter) return activities;

      return activities.filter((activity) => {
        // Add your time filtering logic here
        // This is a placeholder - adjust based on your time filtering requirements
        return true;
      });
    }, [activities, timeFilter]);

    // Transform API activities to match the ActivityCard component props
    const activityCards = useMemo(() => {
      if (loading || !filteredActivities || filteredActivities.length === 0) {
        return [];
      }

      return filteredActivities.map((activity) => {
        // Get the current editing item if in edit mode
        const editingItem = state.editingItemId
          ? getCartItemById(state.editingItemId)
          : null;

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
            href={`/activities/${activity.slug}`}
            activityOptions={options}
            onSelectActivity={handleActivitySelection}
            selectedOptionId={
              state.editingItemId && editingItem?.activity.id === activity.id
                ? editingItem.activityOptionId
                : undefined
            }
          />
        );
      });
    }, [
      filteredActivities,
      searchParams,
      handleActivitySelection,
      getStableOptionId,
      loading,
      calculateTotalPrice,
      state.editingItemId,
      getCartItemById,
    ]);

    // Render loading state
    if (loading) {
      return <LoadingState />;
    }

    // Render no results state
    if (!filteredActivities.length) {
      return <NoResultsState />;
    }

    return (
      <div id="search-results" className={className}>
        <Column gap="var(--space-4)">{activityCards}</Column>
      </div>
    );
  }
);

ActivityResults.displayName = "ActivityResults";
