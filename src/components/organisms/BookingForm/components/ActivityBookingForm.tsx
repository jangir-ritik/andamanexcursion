"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import styles from "../BookingForm.module.css";
import { useBooking } from "@/context/BookingContext";
import { formatTimeForDisplay } from "@/utils/timeUtils";
import { buildBookingUrlParams } from "@/utils/urlUtils";

import {
  Button,
  DateSelect,
  ActivitySelect,
  PassengerCounter,
  SlotSelect,
  LocationSelect,
} from "@/components/atoms";

import { useBookingData } from "@/hooks/useBookingData";
import {
  transformLocationsForSelect,
  transformTimeSlotsForSelect,
  transformActivitiesForSelect,
} from "@/utils/dataTransforms";

import {
  activityFormSchema,
  ActivityFormValues,
  getActivityNameById,
} from "../schemas/formSchemas";
import { useBookingForm } from "../hooks/useBookingForm";
import { cn } from "@/utils/cn";

interface ActivityBookingFormProps {
  className?: string;
  variant?: "default" | "compact" | "embedded";
}

export function ActivityBookingForm({
  className,
  variant = "default",
}: ActivityBookingFormProps) {
  const router = useRouter();
  const { bookingState, updateBookingState } = useBooking();
  const {
    locations: prefetchedLocations,
    activityTimeSlots: prefetchedTimeSlots,
    activities: prefetchedActivities,
  } = useBookingData();

  // transform data for form usage
  const locations = React.useMemo(() => {
    return prefetchedLocations
      ? transformLocationsForSelect(prefetchedLocations)
      : [];
  }, [prefetchedLocations]);

  const timeSlots = React.useMemo(() => {
    return prefetchedTimeSlots
      ? transformTimeSlotsForSelect(prefetchedTimeSlots)
      : [];
  }, [prefetchedTimeSlots]);

  const activities = React.useMemo(() => {
    return prefetchedActivities
      ? transformActivitiesForSelect(prefetchedActivities)
      : [];
  }, [prefetchedActivities]);

  // Initialize form with our custom hook
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useBookingForm<typeof activityFormSchema>(activityFormSchema, {
    selectedActivity: activities.length > 0 ? activities[0].id : "scuba-diving",
    activityLocation: locations[0]?.id || "",
    selectedSlot: timeSlots[0]?.id || "",
    selectedDate: new Date(bookingState.date),
    passengers: {
      adults: bookingState.adults,
      infants: bookingState.infants,
      children: bookingState.children || 0,
    },
  });

  //Helper function to get location name by id
  const getLocationNameById = (id: string) => {
    return locations.find((loc) => loc.id === id)?.name || "";
  };

  const onSubmit = (data: ActivityFormValues) => {
    const activityName = getActivityNameById(data.selectedActivity);
    const locationName = getLocationNameById(data.activityLocation);

    // Find the selected time slot
    const selectedTimeSlot = timeSlots.find(
      (slot) => slot.id === data.selectedSlot
    );
    const timeSlot = selectedTimeSlot?.time || "11:00 AM";

    // Standardize the time format
    const standardizedTime = formatTimeForDisplay(timeSlot);

    updateBookingState({
      from: bookingState.from,
      to: bookingState.to,
      date: data.selectedDate.toISOString().split("T")[0],
      time: standardizedTime,
      adults: data.passengers.adults,
      children: data.passengers.children,
      infants: data.passengers.infants,
    });

    // Build URL parameters
    const urlParams = buildBookingUrlParams({
      activity: data.selectedActivity,
      location: data.activityLocation,
      date: data.selectedDate.toISOString().split("T")[0],
      time: standardizedTime,
      passengers:
        data.passengers.adults +
        data.passengers.children +
        data.passengers.infants,
      type: "activity",
    });

    router.push(`/activities/booking?${urlParams}`);
  };

  // Create button text based on variant
  const buttonText = variant === "compact" ? "Search" : "View Details";

  // Loading state for edge cases
  if (
    !prefetchedLocations.length ||
    !prefetchedTimeSlots.length ||
    !prefetchedActivities.length
  ) {
    return <div className={styles.formGrid}>Loading booking options...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-label="Activity Booking Form"
      role="form"
      aria-describedby="activity-booking-form-description"
      aria-required="true"
      aria-invalid={errors.selectedActivity ? "true" : "false"}
      aria-busy={isSubmitting ? "true" : "false"}
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
                options={activities}
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
                options={locations || []}
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
                options={timeSlots || []}
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
                onChange={(type, value) => {
                  field.onChange({
                    ...field.value,
                    [type]: value,
                  });
                }}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? "Loading..." : buttonText}
        </Button>
      </div>
    </form>
  );
}
