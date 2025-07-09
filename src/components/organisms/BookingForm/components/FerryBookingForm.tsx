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
  LocationSelect,
  PassengerCounter,
  SlotSelect,
} from "@/components/atoms";

import { FERRY_LOCATIONS } from "@/data/ferries";
import { TIME_SLOTS } from "../BookingForm.types";
import {
  ferryFormSchema,
  FerryFormValues,
  getLocationNameById,
} from "../schemas/formSchemas";
import { useBookingForm } from "../hooks/useBookingForm";

interface FerryBookingFormProps {
  className?: string;
  variant?: "default" | "compact" | "embedded";
}

export function FerryBookingForm({
  className,
  variant = "default",
}: FerryBookingFormProps) {
  const router = useRouter();
  const { bookingState, updateBookingState } = useBooking();

  // Initialize form with our custom hook
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useBookingForm<typeof ferryFormSchema>(ferryFormSchema, {
    fromLocation:
      bookingState.from === "Port Blair"
        ? "port-blair"
        : bookingState.from.toLowerCase().replace(/\s+/g, "-"),
    toLocation:
      bookingState.to === "Havelock"
        ? "havelock"
        : bookingState.to.toLowerCase().replace(/\s+/g, "-"),
    selectedDate: new Date(bookingState.date),
    selectedSlot: TIME_SLOTS[0]?.id || "",
    passengers: {
      adults: bookingState.adults,
      infants: bookingState.infants,
      children: bookingState.children || 0,
    },
  });

  const onSubmit = (data: FerryFormValues) => {
    // Convert form state to booking state
    const fromLocationName = getLocationNameById(data.fromLocation, "ferry");
    const toLocationName = getLocationNameById(data.toLocation, "ferry");

    const timeSlot =
      TIME_SLOTS.find((slot) => slot.id === data.selectedSlot)?.time ||
      "11:00 AM";

    // Standardize the time format
    const standardizedTime = formatTimeForDisplay(timeSlot);

    updateBookingState({
      from: fromLocationName,
      to: toLocationName,
      date: data.selectedDate.toISOString().split("T")[0],
      time: standardizedTime,
      adults: data.passengers.adults,
      children: data.passengers.children,
      infants: data.passengers.infants,
    });

    // Navigate to booking page with search params
    router.push(
      `/ferry/booking?from=${fromLocationName}&to=${toLocationName}&date=${
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
      aria-label="Ferry Booking Form"
      role="form"
      aria-describedby="ferry-booking-form-description"
      aria-required="true"
      aria-invalid={errors.fromLocation ? "true" : "false"}
      aria-busy={isSubmitting ? "true" : "false"}
      aria-live="polite"
      className={`${styles.formGrid} ${className || ""}`}
    >
      <div className={styles.locationSelectors}>
        <div className={styles.formFieldContainer}>
          <Controller
            control={control}
            name="fromLocation"
            render={({ field }) => (
              <LocationSelect
                value={field.value}
                onChange={field.onChange}
                label="From"
                options={FERRY_LOCATIONS || []}
              />
            )}
          />
          {errors.fromLocation && (
            <div className={styles.errorMessage}>
              {errors.fromLocation.message}
            </div>
          )}
        </div>

        <div className={styles.formFieldContainer}>
          <Controller
            control={control}
            name="toLocation"
            render={({ field }) => (
              <LocationSelect
                value={field.value}
                onChange={field.onChange}
                label="To"
                options={FERRY_LOCATIONS || []}
              />
            )}
          />
          {errors.toLocation && (
            <div className={styles.errorMessage}>
              {errors.toLocation.message}
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
                options={TIME_SLOTS || []}
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
