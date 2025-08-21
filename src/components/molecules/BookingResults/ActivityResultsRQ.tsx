// src/components/molecules/BookingResults/ActivityResultsRQ.tsx
import React, { memo, useMemo, useCallback } from "react";
import { Button } from "@/components/atoms";
import { Column } from "@/components/layout";
import type { ActivitySearchParams } from "@/store/ActivityStore";
import { useActivityRQ } from "@/store/ActivityStoreRQ";
import { useActivitiesSearch } from "@/hooks/queries/useActivitiesSearch";
import { transformActivitiesToCards } from "@/utils/activityTransformers";
import styles from "./BookingResults.module.css";
import ActivityCard from "../Cards/ActivityCard/ActivityCard";

interface ActivityResultsRQProps {
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

// Memoized error state component
const ErrorState = memo(
  ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <div className={styles.errorContainer}>
      <p>Error loading activities: {error.message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  )
);
ErrorState.displayName = "ErrorState";

export const ActivityResultsRQ = memo<ActivityResultsRQProps>(
  ({ searchParams, className }) => {
    // Use React Query for data fetching
    const {
      data: activities = [],
      isLoading,
      error,
      refetch,
      isFetching,
      dataUpdatedAt,
      isSuccess,
      isError,
      status,
    } = useActivitiesSearch(searchParams, !!searchParams.activityType);

    // Debug logging
    console.log("🔎 ActivityResultsRQ - Render state:", {
      searchParams,
      enabled: !!searchParams.activityType,
      isLoading,
      isFetching,
      error: error?.message,
      activitiesCount: activities?.length || 0,
      activities: activities?.map((a) => ({ id: a.id, title: a.title })) || [],
      dataUpdatedAt,
      isSuccess,
      isError,
      status,
    });

    // Use the modernized Zustand store for cart operations
    const { addToCart, saveEditedItem, editingItemId, getCartItemById } =
      useActivityRQ();

    // Optimized activity selection handler
    const handleActivitySelection = useCallback(
      (activityId: string, optionId: string) => {
        // Find the selected activity
        const selectedActivity = activities.find(
          (activity) => activity.id === activityId
        );

        if (selectedActivity) {
          // Check if we're in edit mode
          if (editingItemId) {
            // Get the current cart item being edited
            const currentItem = getCartItemById(editingItemId);

            // Check if user is selecting the same activity with the same option
            const isSameActivity =
              currentItem &&
              currentItem.activity.id === activityId &&
              currentItem.activityOptionId === optionId;

            if (isSameActivity) {
              // User is confirming the edit with the same activity - just save the search param changes
              saveEditedItem(
                editingItemId,
                currentItem.activity,
                currentItem.activityOptionId
              );
            } else {
              // User is changing to a different activity or option - save with new activity
              saveEditedItem(editingItemId, selectedActivity, optionId);
            }
          } else {
            // Add new activity to cart with current search params
            addToCart(selectedActivity, 1, optionId, searchParams);
          }
        }
      },
      [
        activities,
        editingItemId,
        saveEditedItem,
        addToCart,
        searchParams,
        getCartItemById,
      ]
    );

    // Transform activities using optimized pure functions (memoized)
    const activityCards = useMemo(() => {
      if (isLoading || !activities || activities.length === 0) {
        return [];
      }

      return transformActivitiesToCards(
        activities,
        searchParams,
        handleActivitySelection
      );
    }, [activities, searchParams, handleActivitySelection, isLoading]);

    // Handle retry for errors
    const handleRetry = useCallback(() => {
      refetch();
    }, [refetch]);

    // Render states
    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error as Error} onRetry={handleRetry} />;
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

ActivityResultsRQ.displayName = "ActivityResultsRQ";
