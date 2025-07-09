"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import styles from "../BookingForm.module.css";
import { useBooking } from "@/context/BookingContext";
import { formatTimeForDisplay } from "@/utils/timeUtils";

import {
  Button,
  DateSelect,
  ActivitySelect,
  PassengerCounter,
  SlotSelect,
} from "@/components/atoms";

import { ACTIVITIES } from "@/data/activities";
import { TIME_SLOTS } from "../BookingForm.types";
import {
  activityFormSchema,
  ActivityFormValues,
  getActivityNameById,
} from "../schemas/formSchemas";
import { useBookingForm } from "../hooks/useBookingForm";

// Filter time slots for activities
const ACTIVITY_TIME_SLOTS = TIME_SLOTS.filter((slot) =>
  [
    "07-00",
    "07-30",
    "08-00",
    "08-30",
    "09-00",
    "09-30",
    "10-00",
    "10-30",
    "11-00",
    "11-30",
    "14-00",
    "14-30",
  ].includes(slot.id)
);

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

  // Initialize form with our custom hook
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useBookingForm<typeof activityFormSchema>(activityFormSchema, {
    selectedActivity: "scuba-diving",
    selectedDate: new Date(bookingState.date),
    selectedSlot: ACTIVITY_TIME_SLOTS[0]?.id || "",
    passengers: {
      adults: bookingState.adults,
      infants: bookingState.infants,
      children: bookingState.children || 0,
    },
  });

  const onSubmit = (data: ActivityFormValues) => {
    const activityName = getActivityNameById(data.selectedActivity);

    const timeSlot =
      ACTIVITY_TIME_SLOTS.find((slot) => slot.id === data.selectedSlot)?.time ||
      "11:00 AM";

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

    router.push(
      `/activities/booking?activity=${data.selectedActivity}&date=${
        data.selectedDate.toISOString().split("T")[0]
      }&time=${encodeURIComponent(standardizedTime)}&passengers=${
        data.passengers.adults +
        data.passengers.children +
        data.passengers.infants
      }`
    );
  };

  // Create button text based on variant
  const buttonText = variant === "compact" ? "Search" : "View Details";

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
      className={`${styles.formGrid} ${className || ""}`}
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
                options={ACTIVITIES || []}
              />
            )}
          />
          {errors.selectedActivity && (
            <div className={styles.errorMessage}>
              {errors.selectedActivity.message}
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
                options={ACTIVITY_TIME_SLOTS || []}
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
        <div className={styles.formFieldContainer}>
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
