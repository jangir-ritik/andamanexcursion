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

import { FERRY_LOCATIONS } from "@/data/ferries";
import { TIME_SLOTS } from "../BookingForm.types";

interface FerryBookingFormProps {
  className?: string;
  variant?: "default" | "compact" | "embedded";
}

interface FerryFormState {
  fromLocation: string;
  toLocation: string;
  selectedDate: Date;
  selectedSlot: string;
  passengers: PassengerCount;
}

export function FerryBookingForm({
  className,
  variant = "default",
}: FerryBookingFormProps) {
  const router = useRouter();
  const { bookingState, updateBookingState } = useBooking();

  const [formState, setFormState] = useState<FerryFormState>(() => ({
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
      timeStringToSlotId(bookingState.time) || TIME_SLOTS[0]?.id || "",
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
    <K extends keyof FerryFormState>(field: K, value: FerryFormState[K]) => {
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
      FERRY_LOCATIONS.find((loc) => loc.id === formState.fromLocation)?.name ||
      "Port Blair";

    const toLocationName =
      FERRY_LOCATIONS.find((loc) => loc.id === formState.toLocation)?.name ||
      "Havelock";

    const timeSlot =
      TIME_SLOTS.find((slot) => slot.id === formState.selectedSlot)?.time ||
      "11:00 AM";

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
      `/ferry/booking?from=${fromLocationName}&to=${toLocationName}&date=${
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
          options={FERRY_LOCATIONS || []}
        />
        <LocationSelect
          value={formState.toLocation}
          onChange={(value) => handleFormChange("toLocation", value)}
          label="To"
          options={FERRY_LOCATIONS || []}
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
          options={TIME_SLOTS || []}
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
