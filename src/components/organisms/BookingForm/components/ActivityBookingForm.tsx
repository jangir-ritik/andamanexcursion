"use client";
import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "../BookingForm.module.css";
import { useBooking } from "@/context/BookingContext";
import { formatTimeForDisplay, timeStringToSlotId } from "@/utils/timeUtils";

import {
  ActivitySelect,
  DateSelect,
  PassengerCount,
  PassengerCounter,
  SlotSelect,
  Button,
} from "@/components/atoms";

import { ACTIVITIES } from "@/data/activities";
import { TIME_SLOTS } from "../BookingForm.types";

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

interface ActivityFormState {
  selectedActivity: string;
  selectedDate: Date;
  selectedSlot: string;
  passengers: PassengerCount;
}

export function ActivityBookingForm({
  className,
  variant = "default",
}: ActivityBookingFormProps) {
  const router = useRouter();
  const { bookingState, updateBookingState } = useBooking();

  const [formState, setFormState] = useState<ActivityFormState>(() => ({
    selectedActivity: "scuba-diving",
    selectedDate: new Date(bookingState.date),
    selectedSlot:
      timeStringToSlotId(bookingState.time) || ACTIVITY_TIME_SLOTS[0]?.id || "",
    passengers: {
      adults: bookingState.adults,
      infants: bookingState.infants,
      children: bookingState.children || 0,
    },
  }));

  const handlePassengerChange = useCallback(
    (type: keyof PassengerCount, value: number) => {
      setFormState((prev) => ({
        ...prev,
        passengers: {
          ...prev.passengers,
          [type]: Math.max(0, type === "adults" ? 1 : 0, value),
        },
      }));
    },
    []
  );

  const handleFormChange = useCallback(
    <K extends keyof ActivityFormState>(
      field: K,
      value: ActivityFormState[K]
    ) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const activityName = ACTIVITIES.find(
      (act) => act.id === formState.selectedActivity
    )?.name;

    const timeSlot =
      ACTIVITY_TIME_SLOTS.find((slot) => slot.id === formState.selectedSlot)
        ?.time || "11:00 AM";

    // Standardize the time format
    const standardizedTime = formatTimeForDisplay(timeSlot);

    updateBookingState({
      from: bookingState.from,
      to: bookingState.to,
      date: formState.selectedDate.toISOString().split("T")[0],
      time: standardizedTime,
      adults: formState.passengers.adults,
      children: formState.passengers.children,
      infants: formState.passengers.infants,
    });

    router.push(
      `/activities/booking?activity=${formState.selectedActivity}&date=${
        formState.selectedDate.toISOString().split("T")[0]
      }&time=${encodeURIComponent(standardizedTime)}&passengers=${
        formState.passengers.adults +
        formState.passengers.children +
        formState.passengers.infants
      }`
    );
  }, [
    formState,
    router,
    updateBookingState,
    bookingState.from,
    bookingState.to,
  ]);

  // Create button text based on variant
  const buttonText = useMemo(() => {
    if (variant === "compact") return "Search";
    return "View Details";
  }, [variant]);

  return (
    <div className={`${styles.formGrid} ${className || ""}`}>
      <div className={styles.activityContainer}>
        <ActivitySelect
          value={formState.selectedActivity}
          onChange={(value) => handleFormChange("selectedActivity", value)}
          options={ACTIVITIES || []}
        />
      </div>

      <div className={styles.dateTimeSection}>
        <DateSelect
          selected={formState.selectedDate}
          onChange={(date) => date && handleFormChange("selectedDate", date)}
        />

        <SlotSelect
          value={formState.selectedSlot}
          onChange={(value) => handleFormChange("selectedSlot", value)}
          options={ACTIVITY_TIME_SLOTS || []}
        />
      </div>

      <div className={styles.passengerButtonSection}>
        <PassengerCounter
          value={formState.passengers}
          onChange={handlePassengerChange}
        />
        <Button
          variant="primary"
          className={styles.viewDetailsButton}
          showArrow
          onClick={handleSubmit}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
