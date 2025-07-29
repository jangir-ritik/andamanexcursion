"use client";
import React, { useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActivity } from "@/store/ActivityStore";
import { useRouter } from "next/navigation";
import styles from "../BookingForm.module.css";
import { cn } from "@/utils/cn";

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
    infants: z.number().min(0).max(5, "Maximum 5 infants"),
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
    timeSlots: timeSlotOptions,
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
        infants: currentSearchParams.infants || 0,
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
  } = useForm<ActivitySearchFormData>({
    resolver: zodResolver(activitySearchSchema),
    defaultValues,
    mode: "onSubmit",
  });

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
        infants: data.passengers.infants,
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
          infants: searchParams.infants.toString(),
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
        return "Search Activities";
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
      className={cn(styles.formGrid, className)}
    >
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
