"use client";
import React, { useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActivity, Activity } from "@/store/ActivityStore";
import { useRouter } from "next/navigation";
import styles from "../BookingForm.module.css";
import { cn } from "@/utils/cn";
import { getActivityTimeSlots } from "@/utils/activityTimeSlots";

import {
  Button,
  DateSelect,
  ActivitySelect,
  PassengerCounter,
  SlotSelect,
  LocationSelect,
} from "@/components/atoms";

// Move the schema outside component to prevent recreation on each render
const activitySearchSchema = z.object({
  selectedActivity: z.string().min(1, "Please select an activity type"),
  activityLocation: z.string().min(1, "Please select a location"),
  selectedDate: z.date({ required_error: "Please select a date" }),
  selectedSlot: z.string().min(1, "Please select a time"),
  passengers: z.object({
    adults: z
      .number()
      .min(1, "At least 1 adult required")
      .max(10, "Maximum 10 adults"),
    children: z.number().min(0).max(10, "Maximum 10 children"),
  }),
});

type ActivitySearchFormData = z.infer<typeof activitySearchSchema>;

interface ActivitySearchFormProps {
  className?: string;
  variant?: "default" | "compact" | "embedded";
}

export function ActivitySearchForm({
  className,
  variant = "default",
}: ActivitySearchFormProps) {
  const router = useRouter();
  const {
    state,
    updateSearchParams,
    searchActivities,
    loadFormOptions,
    cancelEditing,
    saveEditedItem,
  } = useActivity();

  // Get form options from Zustand store
  const {
    activityTypes: activityOptions,
    locations: locationOptions,
    timeSlots: allTimeSlots,
    isLoading: isLoadingOptions,
    error: loadError,
  } = state.formOptions;

  // Check if we're in edit mode using Zustand store
  const isEditMode = !!state.editingItemId;

  // Use editing search params when in edit mode, otherwise use regular search params
  const currentSearchParams =
    isEditMode && state.editingSearchParams
      ? state.editingSearchParams
      : state.searchParams;

  // Get the currently selected activity to filter time slots
  const selectedActivityType = currentSearchParams.activityType;

  // Get the selected activity category for time slot filtering
  const selectedActivityCategory = React.useMemo(() => {
    if (!selectedActivityType) return null;

    return activityOptions.find((opt) => opt.value === selectedActivityType);
  }, [selectedActivityType, activityOptions]);

  // State for filtered time slots
  const [timeSlotOptions, setTimeSlotOptions] = React.useState(
    () => allTimeSlots || []
  );
  const [isFilteringTimeSlots, setIsFilteringTimeSlots] = React.useState(false);

  // Filter time slots based on selected activity category (async)
  React.useEffect(() => {
    const filterTimeSlots = async () => {
      // Always return all time slots initially or when no activity type is selected
      if (!selectedActivityType || selectedActivityType === "") {
        setTimeSlotOptions(allTimeSlots || []);
        return;
      }

      // Apply filtering when an activity category is selected
      if (selectedActivityCategory && allTimeSlots) {
        setIsFilteringTimeSlots(true);

        try {
          // Create a minimal activity object for filtering
          const categoryForFiltering = {
            id: "temp-category",
            title: selectedActivityCategory.label,
            slug: selectedActivityCategory.slug,
            coreInfo: {
              description: "",
              category: [
                {
                  id: selectedActivityCategory.id,
                  name: selectedActivityCategory.name,
                  slug: selectedActivityCategory.slug,
                },
              ],
              location: [],
              basePrice: 0,
              duration: "2 hours", // Default duration
              maxCapacity: 10,
            },
            media: {
              featuredImage: undefined,
              gallery: [],
            },
            activityOptions: [],
            status: {
              isActive: true,
              isFeatured: false,
              priority: 0,
            },
          } as Activity;

          // First try to get filtered slots from the database
          let filteredSlots = await getActivityTimeSlots(
            categoryForFiltering,
            allTimeSlots
          );

          // If no database slots or very few slots, supplement with duration-based slots
          if (filteredSlots.length === 0) {
            const { createDurationBasedTimeSlots } = await import(
              "@/utils/activityTimeSlots"
            );
            filteredSlots = createDurationBasedTimeSlots(
              null,
              selectedActivityCategory.slug
            );
          } else if (filteredSlots.length < 3) {
            const { createDurationBasedTimeSlots } = await import(
              "@/utils/activityTimeSlots"
            );
            const durationSlots = createDurationBasedTimeSlots(
              null,
              selectedActivityCategory.slug
            );

            // Combine database slots with duration-based slots, avoiding duplicates
            const existingTimes = new Set(
              filteredSlots.map((slot) => slot.value)
            );
            const supplementarySlots = durationSlots.filter(
              (slot) => !existingTimes.has(slot.value)
            );
            filteredSlots = [...filteredSlots, ...supplementarySlots];
          }

          // Update with filtered slots
          setTimeSlotOptions(
            filteredSlots.length > 0 ? filteredSlots : allTimeSlots
          );
        } catch (error) {
          setTimeSlotOptions(allTimeSlots); // Fallback
        } finally {
          setIsFilteringTimeSlots(false);
        }
      } else {
        // Fallback to all time slots
        setTimeSlotOptions(allTimeSlots || []);
      }
    };

    filterTimeSlots();
  }, [selectedActivityCategory, allTimeSlots, selectedActivityType]);

  // Memoize default values to prevent recreating on each render
  const defaultValues = useMemo(
    () => ({
      selectedActivity: currentSearchParams.activityType || "",
      activityLocation: currentSearchParams.location || "",
      selectedDate: currentSearchParams.date
        ? new Date(currentSearchParams.date)
        : new Date(),
      selectedSlot: currentSearchParams.time || "",
      passengers: {
        adults: currentSearchParams.adults || 2,
        children: currentSearchParams.children || 0,
      },
    }),
    [currentSearchParams]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch,
  } = useForm<ActivitySearchFormData>({
    resolver: zodResolver(activitySearchSchema),
    defaultValues,
    mode: "onSubmit",
  });

  // Watch form values to update search params in real time
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      // Update search params when time slot changes
      if (name === "selectedSlot" && value.selectedSlot !== undefined) {
        updateSearchParams({ time: value.selectedSlot });
      }

      // Also update other search params for consistency
      if (name === "selectedActivity" && value.selectedActivity !== undefined) {
        updateSearchParams({ activityType: value.selectedActivity });
      }

      if (name === "activityLocation" && value.activityLocation !== undefined) {
        updateSearchParams({ location: value.activityLocation });
      }

      if (name === "selectedDate" && value.selectedDate !== undefined) {
        updateSearchParams({
          date: value.selectedDate.toISOString().split("T")[0],
        });
      }

      if (name === "passengers" && value.passengers !== undefined) {
        updateSearchParams({
          adults: value.passengers.adults,
          children: value.passengers.children,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, updateSearchParams]);

  // Reset form values when edit mode is triggered
  React.useEffect(() => {
    if (isEditMode && state.editingItemId) {
      reset(defaultValues);
    }
  }, [isEditMode, state.editingItemId, reset, defaultValues]);

  // Memoize the submit handler to prevent recreation on each render
  const onSubmit = useCallback(
    async (data: ActivitySearchFormData) => {
      // Additional validation check
      if (!data.selectedActivity) {
        setError("selectedActivity", {
          type: "manual",
          message: "Please select an activity type",
        });
        return;
      }

      // Additional validation for adults
      if (data.passengers.adults === 0) {
        setError("passengers.adults", {
          type: "manual",
          message: "At least 1 adult is required",
        });
        return;
      }

      // Location is optional - users can browse all activities in a category
      // Only show location error if user is trying to do a specific search
      // For now, we'll allow empty location for category browsing

      // Convert form data to search params format
      const searchParams = {
        activityType: data.selectedActivity,
        location: data.activityLocation || "", // Allow empty location
        date: data.selectedDate.toISOString().split("T")[0],
        time: data.selectedSlot,
        adults: data.passengers.adults,
        children: data.passengers.children,
      };

      // Update search params (this will update editingSearchParams in edit mode)
      updateSearchParams(searchParams);

      // Search for activities with new params
      await searchActivities(searchParams);

      // Note: We don't call saveEditedItem here because that should only happen
      // when the user actually selects an activity in the results.
      // The form submission just updates the search criteria.

      // If in edit mode, just scroll to results instead of navigating away
      if (isEditMode) {
        // Scroll to search results to show the updated options
        const resultsElement = document.getElementById("search-results");
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Only navigate for new searches (not in edit mode)
        // Navigate to search results page with URL parameters
        const urlParams = new URLSearchParams({
          activityType: searchParams.activityType,
          location: searchParams.location,
          date: searchParams.date,
          time: searchParams.time,
          adults: searchParams.adults.toString(),
          children: searchParams.children.toString(),
        });

        router.push(`/activities/search?${urlParams.toString()}`);
      }
    },
    [
      updateSearchParams,
      searchActivities,
      setError,
      router,
      isEditMode,
      state.editingItemId,
    ]
  );

  // Memoize button text based on variant and edit mode
  const buttonText = useMemo(() => {
    if (isEditMode) {
      return "Update Search";
    }
    switch (variant) {
      case "compact":
        return "Search";
      case "embedded":
        return "Find Activities";
      default:
        return "Search";
    }
  }, [variant, isEditMode]);

  // Add cancel edit handler
  const handleCancelEdit = useCallback(() => {
    cancelEditing();
  }, [cancelEditing]);

  // Add save changes handler for edit mode
  const handleSaveChanges = useCallback(() => {
    if (isEditMode && state.editingItemId) {
      // Get the current cart item to preserve the same activity and option
      const currentItem = state.cart.find(
        (item) => item.id === state.editingItemId
      );
      if (currentItem) {
        saveEditedItem(
          state.editingItemId,
          currentItem.activity,
          currentItem.activityOptionId
        );
      }
    }
  }, [isEditMode, state.editingItemId, state.cart, saveEditedItem]);

  // Memoize passenger handler to prevent recreation on each render
  const handlePassengerChange = useCallback(
    (field: any) => (type: string, value: number) => {
      field.onChange({
        ...field.value,
        [type]: value,
      });
    },
    []
  );

  // Auto-search when time slot changes if a search has already been performed
  React.useEffect(() => {
    const currentTime = currentSearchParams.time;

    // Only auto-search if:
    // 1. We have activities (meaning a search was already performed)
    // 2. We have required search params (activityType)
    // 3. We're not in edit mode (to avoid unwanted searches during editing)
    if (
      state.activities.length > 0 &&
      currentSearchParams.activityType &&
      !isEditMode &&
      currentTime
    ) {
      // Debounce the search to avoid too many requests
      const timeoutId = setTimeout(() => {
        searchActivities(currentSearchParams);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [
    currentSearchParams.time,
    state.activities.length,
    currentSearchParams.activityType,
    isEditMode,
    searchActivities,
    currentSearchParams,
  ]);

  // Loading state while fetching form options
  if (isLoadingOptions) {
    return <div className={styles.formGrid}>Loading booking options...</div>;
  }

  // Error state if data fetching failed
  if (loadError) {
    return (
      <div className={`${styles.formGrid} ${styles.errorContainer}`}>
        <div className={styles.errorMessage}>{loadError}</div>
        <Button
          variant="secondary"
          onClick={() => loadFormOptions()}
          className={styles.retryButton}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-label="Activity Search Form"
      role="form"
      aria-describedby="activity-search-form-description"
      aria-required="true"
      aria-invalid={Object.keys(errors).length > 0 ? "true" : "false"}
      aria-busy={isSubmitting || state.isLoading ? "true" : "false"}
      aria-live="polite"
      className={cn(
        styles.formGrid,
        variant === "compact" && styles.formCompact,
        variant === "embedded" && styles.formEmbedded,
        className
      )}
    >
      {/* Add user feedback for time slot filtering */}
      {selectedActivityType && (
        <div className={styles.filterFeedback}>
          {isFilteringTimeSlots ? (
            <div className={styles.loadingFeedback}>
              <div className={styles.spinner} />
              Filtering available time slots...
            </div>
          ) : timeSlotOptions.length < (allTimeSlots?.length || 0) ? (
            <div className={styles.infoFeedback}>
              Showing {timeSlotOptions.length} available time slots for{" "}
              {selectedActivityCategory?.label}
              {timeSlotOptions.length > 0 && (
                <span className={styles.infoHint}>
                  Time slots are matched to activity duration. Selecting a time
                  will show only activities available at that time.
                </span>
              )}
            </div>
          ) : (
            timeSlotOptions.length > 0 && (
              <div className={styles.infoFeedback}>
                <span className={styles.infoHint}>
                  ⏰ Time slots shown match the typical duration for{" "}
                  {selectedActivityCategory?.label} activities
                </span>
              </div>
            )
          )}
        </div>
      )}
      <div className={styles.formContent}>
        {/* Activity Type */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="selectedActivity"
            render={({ field }) => (
              <ActivitySelect
                value={field.value}
                onChange={field.onChange}
                options={activityOptions}
                placeholder="Select Type"
                hasError={!!errors.selectedActivity}
              />
            )}
          />
          {errors.selectedActivity && (
            <div className={styles.errorMessage}>
              {errors.selectedActivity.message}
            </div>
          )}
        </div>

        {/* Location */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="activityLocation"
            render={({ field }) => (
              <LocationSelect
                label="Location"
                value={field.value}
                onChange={field.onChange}
                options={locationOptions}
                placeholder="Select Location"
                hasError={!!errors.activityLocation}
              />
            )}
          />
          {errors.activityLocation && (
            <div className={styles.errorMessage}>
              {errors.activityLocation.message}
            </div>
          )}
        </div>

        {/* Date */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="selectedDate"
            render={({ field }) => (
              <DateSelect
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                hasError={!!errors.selectedDate}
              />
            )}
          />
          {errors.selectedDate && (
            <div className={styles.errorMessage}>
              {errors.selectedDate.message}
            </div>
          )}
        </div>

        {/* Time Slot */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="selectedSlot"
            render={({ field }) => (
              <SlotSelect
                value={field.value}
                onChange={field.onChange}
                options={timeSlotOptions}
                placeholder="Select Time"
                hasError={!!errors.selectedSlot}
                isLoading={isFilteringTimeSlots}
              />
            )}
          />
          {errors.selectedSlot && (
            <div className={styles.errorMessage}>
              {errors.selectedSlot.message}
            </div>
          )}
        </div>

        {/* Passengers */}
        <div className={styles.formField}>
          <Controller
            control={control}
            name="passengers"
            render={({ field }) => (
              <PassengerCounter
                value={field.value}
                onChange={handlePassengerChange(field)}
                hasError={!!errors.passengers}
              />
            )}
          />
          {errors.passengers && (
            <div className={styles.errorMessage}>
              {errors.passengers.message}
            </div>
          )}
        </div>

        {/* Search Button */}
        <div className={styles.buttonContainer}>
          <Button
            variant="primary"
            className={styles.searchButton}
            showArrow
            type="submit"
            disabled={isSubmitting || state.isLoading}
          >
            {isSubmitting || state.isLoading ? "Searching..." : buttonText}
          </Button>

          {/* Save Changes button for edit mode */}
          {isEditMode && (
            <Button
              variant="secondary"
              className={styles.saveButton}
              onClick={handleSaveChanges}
              type="button"
              disabled={isSubmitting || state.isLoading}
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {state.error && <div className={styles.errorMessage}>{state.error}</div>}
    </form>
  );
}
