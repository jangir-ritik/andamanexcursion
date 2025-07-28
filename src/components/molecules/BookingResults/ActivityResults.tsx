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
  ({ loading, activities, searchParams, className }) => {
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

    // Transform API activities to match the ActivityCard component props
    const activityCards = useMemo(() => {
      if (loading || !activities || activities.length === 0) {
        return [];
      }

      return activities.map((activity) => {
        const basePrice = activity.coreInfo?.basePrice || 0;
        const totalPrice = calculateTotalPrice(basePrice);

        // Transform activity options for ActivityCard
        const transformedOptions = (activity.activityOptions || []).map(
          (option, index) => ({
            id: option.id || getStableOptionId(activity.id, index),
            type: option.optionTitle || "Standard Option",
            description: option.optionDescription || "",
            price: option.price || basePrice,
            totalPrice: calculateTotalPrice(option.price || basePrice),
            seatsLeft:
              option.maxCapacity || activity.coreInfo?.maxCapacity || 10,
            amenities: [],
          })
        );

        // Transform images
        const images = [
          {
            src:
              activity.media?.featuredImage?.url || "/images/placeholder.png",
            alt: activity.title || "Activity image",
          },
          ...(activity.media?.gallery || []).map((img) => ({
            src: img.image?.url || "/images/placeholder.png",
            alt: img.alt || "Activity gallery image",
          })),
        ];

        return {
          id: activity.id,
          title: activity.title,
          description:
            activity.coreInfo?.description ||
            activity.coreInfo?.shortDescription ||
            "Experience this amazing activity in Andaman!",
          images,
          price: basePrice,
          totalPrice,
          type: activity.coreInfo?.category[0]?.name || "Activity",
          duration: activity.coreInfo?.duration || "2 hours",
          href: `/activities/${activity.slug}`,
          activityOptions: transformedOptions,
          onSelectActivity: handleActivitySelection,
        };
      });
    }, [
      activities,
      loading,
      calculateTotalPrice,
      getStableOptionId,
      handleActivitySelection,
    ]);

    // Render states
    if (loading) {
      return <LoadingState />;
    }

    if (!activities || activities.length === 0) {
      return <NoResultsState />;
    }

    return (
      <Column gap="var(--space-6)" className={className}>
        {activityCards.map((activityCard) => (
          <ActivityCard key={activityCard.id} {...activityCard} />
        ))}
      </Column>
    );
  }
);

ActivityResults.displayName = "ActivityResults";
