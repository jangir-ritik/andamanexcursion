"use client";
import React, { useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActivity } from "@/context/ActivityContext";
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
  const { state, updateSearchParams, searchActivities, loadFormOptions } =
    useActivity();

  // Get form options from context
  const {
    activityTypes: activityOptions,
    locations: locationOptions,
    timeSlots: timeSlotOptions,
    isLoading: isLoadingOptions,
    error: loadError,
  } = state.formOptions;

  // Memoize default values to prevent recreating on each render
  const defaultValues = useMemo(
    () => ({
      selectedActivity: state.searchParams.activityType || "",
      activityLocation: state.searchParams.location || "",
      selectedDate: state.searchParams.date
        ? new Date(state.searchParams.date)
        : new Date(),
      selectedSlot: state.searchParams.time || "",
      passengers: {
        adults: state.searchParams.adults || 2,
        children: state.searchParams.children || 0,
        infants: state.searchParams.infants || 0,
      },
    }),
    [state.searchParams]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ActivitySearchFormData>({
    resolver: zodResolver(activitySearchSchema),
    defaultValues,
    mode: "onSubmit",
  });

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

      if (!data.activityLocation) {
        setError("activityLocation", {
          type: "manual",
          message: "Please select a location",
        });
        return;
      }

      // Create search params with slugs
      const searchParams = {
        activityType: data.selectedActivity,
        location: data.activityLocation,
        date: data.selectedDate.toISOString().split("T")[0],
        time: data.selectedSlot,
        adults: data.passengers.adults,
        children: data.passengers.children,
        infants: data.passengers.infants,
      };

      // Update search params in context
      updateSearchParams(searchParams);

      // Trigger search with the search params
      await searchActivities(searchParams);
    },
    [updateSearchParams, searchActivities, setError]
  );

  // Memoize button text based on variant
  const buttonText = useMemo(
    () => (variant === "compact" ? "Search" : "View Details"),
    [variant]
  );

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
      <div className={styles.activityContainer}>
        <div className={styles.formFieldContainer}>
          <Controller
            control={control}
            name="selectedActivity"
            render={({ field }) => (
              <ActivitySelect
                value={field.value}
                onChange={field.onChange}
                options={activityOptions}
                placeholder="Select Activity"
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

        <div className={styles.formFieldContainer}>
          <Controller
            control={control}
            name="activityLocation"
            render={({ field }) => (
              <LocationSelect
                value={field.value}
                onChange={field.onChange}
                options={locationOptions}
                placeholder="Select Location"
                label="Location"
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
      </div>

      <div className={styles.dateTimeSection}>
        <div className={styles.formFieldContainer}>
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

        <div className={styles.formFieldContainer}>
          <Controller
            control={control}
            name="selectedSlot"
            render={({ field }) => (
              <SlotSelect
                value={field.value}
                onChange={field.onChange}
                options={timeSlotOptions}
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
      </div>

      <div className={styles.passengerButtonSection}>
        <div
          className={cn(
            styles.formFieldContainer,
            styles.passengerCounterContainer
          )}
        >
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

        <Button
          variant="primary"
          className={styles.viewDetailsButton}
          showArrow
          type="submit"
          disabled={isSubmitting || state.isLoading}
        >
          {isSubmitting || state.isLoading ? "Loading..." : buttonText}
        </Button>
      </div>

      {/* Error Display */}
      {state.error && <div className={styles.errorMessage}>{state.error}</div>}
    </form>
  );
}
