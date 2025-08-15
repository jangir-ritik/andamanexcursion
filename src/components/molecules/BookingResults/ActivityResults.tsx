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
            // Get the current cart item being edited
            const currentItem = getCartItemById(state.editingItemId);

            // Check if user is selecting the same activity with the same option
            const isSameActivity =
              currentItem &&
              currentItem.activity.id === activityId &&
              currentItem.activityOptionId === optionId;

            if (isSameActivity) {
              // User is confirming the edit with the same activity - just save the search param changes
              saveEditedItem(
                state.editingItemId,
                currentItem.activity,
                currentItem.activityOptionId
              );
            } else {
              // User is changing to a different activity or option - save with new activity
              saveEditedItem(state.editingItemId, selectedActivity, optionId);
            }
          } else {
            // Add new activity to cart with current search params
            addToCart(selectedActivity, 1, optionId, searchParams);
          }
        }
      },
      [
        activities,
        state.editingItemId,
        saveEditedItem,
        addToCart,
        searchParams,
        getCartItemById,
      ]
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
        const discountedPrice = activity.coreInfo?.discountedPrice;
        const currentPrice = discountedPrice || basePrice;

        const totalPrice = calculateTotalPrice(currentPrice);
        const originalTotalPrice = discountedPrice
          ? calculateTotalPrice(basePrice)
          : undefined;

        // Transform activity options for ActivityCard
        const transformedOptions = (activity.activityOptions || []).map(
          (option, index) => {
            const optionCurrentPrice = option.discountedPrice || option.price;
            const optionOriginalPrice = option.discountedPrice
              ? option.price
              : undefined;

            return {
              id: option.id || getStableOptionId(activity.id, index),
              type: option.optionTitle || "Standard Option",
              description: option.optionDescription || "",
              price: optionCurrentPrice,
              totalPrice: calculateTotalPrice(optionCurrentPrice),
              originalPrice: optionOriginalPrice,
              originalTotalPrice: optionOriginalPrice
                ? calculateTotalPrice(optionOriginalPrice)
                : undefined,
              seatsLeft:
                option.maxCapacity || activity.coreInfo?.maxCapacity || 10,
              amenities: [],
            };
          }
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

        // Get proper time slots for this activity
        // First check if activity has direct time slots, otherwise use utility function
        const getTimeSlots = () => {
          if (activity.availableTimeSlots?.length) {
            return activity.availableTimeSlots;
          }

          // Use the synchronous version for immediate display
          try {
            const {
              getActivityDisplayTimeSlots,
            } = require("@/utils/activityTimeSlots");
            const slots = getActivityDisplayTimeSlots(activity);

            // If no slots found, create duration-appropriate slots based on activity duration
            if (slots.length === 0) {
              return createDurationBasedTimeSlots(activity);
            }

            return slots;
          } catch (error) {
            console.error("Error getting activity time slots:", error);
            return createDurationBasedTimeSlots(activity);
          }
        };

        // Helper function to create time slots based on activity duration
        const createDurationBasedTimeSlots = (activity: any) => {
          const duration = activity.coreInfo?.duration || "2 hours";
          const durationHours = parseDuration(duration);

          const isWaterActivity =
            activity.title?.toLowerCase().includes("scuba") ||
            activity.title?.toLowerCase().includes("snorkel") ||
            activity.title?.toLowerCase().includes("diving") ||
            activity.title?.toLowerCase().includes("kayak");

          if (isWaterActivity) {
            return [
              {
                id: "morning",
                startTime: "09:00",
                endTime: addHours("09:00", durationHours),
                displayTime: `09:00 - ${addHours("09:00", durationHours)} hrs`,
                isAvailable: true,
              },
              {
                id: "afternoon",
                startTime: "14:00",
                endTime: addHours("14:00", durationHours),
                displayTime: `14:00 - ${addHours("14:00", durationHours)} hrs`,
                isAvailable: true,
              },
            ];
          } else {
            return [
              {
                id: "morning",
                startTime: "10:00",
                endTime: addHours("10:00", durationHours),
                displayTime: `10:00 - ${addHours("10:00", durationHours)} hrs`,
                isAvailable: true,
              },
              {
                id: "afternoon",
                startTime: "15:00",
                endTime: addHours("15:00", durationHours),
                displayTime: `15:00 - ${addHours("15:00", durationHours)} hrs`,
                isAvailable: true,
              },
            ];
          }
        };

        // Helper to parse duration string like "2 hours" -> 2
        const parseDuration = (duration: string): number => {
          const match = duration.match(/(\d+(?:\.\d+)?)/);
          return match ? parseFloat(match[1]) : 2; // default to 2 hours
        };

        // Helper to add hours to time string
        const addHours = (timeStr: string, hours: number): string => {
          const [hour, minute] = timeStr.split(":").map(Number);
          const totalMinutes = hour * 60 + minute + hours * 60;
          const newHour = Math.floor(totalMinutes / 60) % 24;
          const newMinute = totalMinutes % 60;
          return `${newHour.toString().padStart(2, "0")}:${newMinute
            .toString()
            .padStart(2, "0")}`;
        };

        const availableTimeSlots = getTimeSlots();

        return {
          id: activity.id,
          title: activity.title,
          description:
            activity.coreInfo?.description ||
            activity.coreInfo?.shortDescription ||
            "Experience this amazing activity in Andaman!",
          images,
          price: currentPrice,
          totalPrice,
          originalPrice: discountedPrice ? basePrice : undefined,
          originalTotalPrice,
          type: activity.coreInfo?.category[0]?.name || "Activity",
          duration: activity.coreInfo?.duration || "2 hours",
          href: `/activities/${activity.slug}`,
          activityOptions: transformedOptions,
          availableTimeSlots,
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
