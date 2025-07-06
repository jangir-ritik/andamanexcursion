"use client";
import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "../BookingForm.module.css";
import { useBooking } from "@/context/BookingContext";
import { formatTimeForDisplay, timeStringToSlotId } from "@/utils/timeUtils";

import {
  DateSelect,
  LocationSelect,
  PassengerCount,
  PassengerCounter,
  SlotSelect,
  Button,
} from "@/components/atoms";

import { BOAT_LOCATIONS } from "@/data/boats";
import { TIME_SLOTS } from "../BookingForm.types";

// Filter time slots for local boats
const LOCAL_BOAT_TIME_SLOTS = TIME_SLOTS.filter((slot) =>
  [
    "08-00",
    "08-30",
    "09-00",
    "09-30",
    "10-00",
    "10-30",
    "11-00",
    "11-30",
    "12-00",
    "12-30",
  ].includes(slot.id)
);

interface BoatBookingFormProps {
  className?: string;
  variant?: "default" | "compact" | "embedded";
}

interface BoatFormState {
  fromLocation: string;
  toLocation: string;
  selectedDate: Date;
  selectedSlot: string;
  passengers: PassengerCount;
}

export function BoatBookingForm({
  className,
  variant = "default",
}: BoatBookingFormProps) {
  const router = useRouter();
  const { bookingState, updateBookingState } = useBooking();

  const [formState, setFormState] = useState<BoatFormState>(() => ({
    fromLocation:
      bookingState.from === "Port Blair"
        ? "port-blair"
        : bookingState.from.toLowerCase().replace(/\s+/g, "-"),
    toLocation:
      bookingState.to === "Havelock"
        ? "havelock"
        : bookingState.to.toLowerCase().replace(/\s+/g, "-"),
    selectedDate: new Date(bookingState.date),
    selectedSlot:
      timeStringToSlotId(bookingState.time) ||
      LOCAL_BOAT_TIME_SLOTS[0]?.id ||
      "",
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
    <K extends keyof BoatFormState>(field: K, value: BoatFormState[K]) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(() => {
    // Convert form state to booking state
    const fromLocationName =
      BOAT_LOCATIONS.find((loc) => loc.id === formState.fromLocation)?.name ||
      "Port Blair";

    const toLocationName =
      BOAT_LOCATIONS.find((loc) => loc.id === formState.toLocation)?.name ||
      "Havelock";

    const timeSlot =
      LOCAL_BOAT_TIME_SLOTS.find((slot) => slot.id === formState.selectedSlot)
        ?.time || "11:00 AM";

    // Standardize the time format
    const standardizedTime = formatTimeForDisplay(timeSlot);

    updateBookingState({
      from: fromLocationName,
      to: toLocationName,
      date: formState.selectedDate.toISOString().split("T")[0],
      time: standardizedTime,
      adults: formState.passengers.adults,
      children: formState.passengers.children,
      infants: formState.passengers.infants,
    });

    // Navigate to booking page with search params
    router.push(
      `/boat/booking?from=${fromLocationName}&to=${toLocationName}&date=${
        formState.selectedDate.toISOString().split("T")[0]
      }&time=${encodeURIComponent(standardizedTime)}&passengers=${
        formState.passengers.adults +
        formState.passengers.children +
        formState.passengers.infants
      }`
    );
  }, [formState, router, updateBookingState]);

  // Create button text based on variant
  const buttonText = useMemo(() => {
    if (variant === "compact") return "Search";
    return "View Details";
  }, [variant]);

  return (
    <div className={`${styles.formGrid} ${className || ""}`}>
      <div className={styles.locationSelectors}>
        <LocationSelect
          value={formState.fromLocation}
          onChange={(value) => handleFormChange("fromLocation", value)}
          label="From"
          options={BOAT_LOCATIONS || []}
        />
        <LocationSelect
          value={formState.toLocation}
          onChange={(value) => handleFormChange("toLocation", value)}
          label="To"
          options={BOAT_LOCATIONS || []}
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
          options={LOCAL_BOAT_TIME_SLOTS || []}
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
