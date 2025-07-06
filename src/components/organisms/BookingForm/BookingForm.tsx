"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useRouter } from "next/navigation";
import styles from "./BookingForm.module.css";
import { TAB_CONFIG } from "./config/formConfig";
import { useBooking } from "@/context/BookingContext";
import { formatTimeForDisplay, timeStringToSlotId } from "@/utils/timeUtils";

import type { BookingFormProps, FormState } from "./BookingForm.types";

import {
  ActivitySelect,
  Button,
  DateSelect,
  LocationSelect,
  PassengerCount,
  PassengerCounter,
  SlotSelect,
} from "@/components/atoms";

export function BookingForm({
  className,
  variant = "default",
  initialTab = "ferry",
}: BookingFormProps) {
  const router = useRouter();
  const { bookingState, updateBookingState } = useBooking();
  const [selectedTab, setSelectedTab] = useState<string>(initialTab);

  // Get the tab config for the initial tab
  const initialTabConfig = useMemo(
    () => TAB_CONFIG.find((tab) => tab.id === initialTab) || TAB_CONFIG[0],
    [initialTab]
  );

  const [formState, setFormState] = useState<FormState>(() => ({
    fromLocation:
      bookingState.from === "Port Blair"
        ? "port-blair"
        : bookingState.from.toLowerCase().replace(/\s+/g, "-"),
    toLocation:
      bookingState.to === "Havelock"
        ? "havelock"
        : bookingState.to.toLowerCase().replace(/\s+/g, "-"),
    // Ensure we have a valid initial activity
    selectedActivity: initialTab === "activities" ? "scuba-diving" : "",
    selectedDate: new Date(bookingState.date),
    // Use the first time slot from the initial tab if the current one isn't valid
    selectedSlot: initialTabConfig?.timeSlots.some(
      (slot) => slot.id === timeStringToSlotId(bookingState.time)
    )
      ? timeStringToSlotId(bookingState.time)
      : initialTabConfig?.timeSlots[0]?.id || "",
    passengers: {
      adults: bookingState.adults,
      infants: bookingState.infants,
      children: bookingState.children || 0,
    },
  }));

  const currentTabConfig = useMemo(
    () => TAB_CONFIG.find((tab) => tab.id === selectedTab),
    [selectedTab]
  );

  // Update slot when tab changes to ensure a valid slot is selected
  useEffect(() => {
    if (currentTabConfig && currentTabConfig.timeSlots.length > 0) {
      // Check if current slot exists in new tab's time slots
      const slotExists = currentTabConfig.timeSlots.some(
        (slot) => slot.id === formState.selectedSlot
      );

      // If not, set to first available slot
      if (!slotExists) {
        setFormState((prev) => ({
          ...prev,
          selectedSlot: currentTabConfig.timeSlots[0].id,
        }));
      }
    }
  }, [selectedTab, currentTabConfig, formState.selectedSlot]);

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
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleTabChange = useCallback((value: string) => {
    setSelectedTab(value);
    // Reset slot when changing tabs
    setFormState((prev) => ({
      ...prev,
      selectedSlot: "",
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    // Convert form state to booking state
    const fromLocationName =
      currentTabConfig?.locations?.find(
        (loc) => loc.id === formState.fromLocation
      )?.name || "Port Blair";

    const toLocationName =
      currentTabConfig?.locations?.find(
        (loc) => loc.id === formState.toLocation
      )?.name || "Havelock";

    const timeSlot =
      currentTabConfig?.timeSlots?.find(
        (slot) => slot.id === formState.selectedSlot
      )?.time || "11:00 AM";

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
    if (selectedTab === "ferry") {
      router.push(
        `/ferry/booking?from=${fromLocationName}&to=${toLocationName}&date=${
          formState.selectedDate.toISOString().split("T")[0]
        }&time=${encodeURIComponent(standardizedTime)}&passengers=${
          formState.passengers.adults +
          formState.passengers.children +
          formState.passengers.infants
        }`
      );
    } else if (selectedTab === "boat") {
      router.push(
        `/boat/booking?from=${fromLocationName}&to=${toLocationName}&date=${
          formState.selectedDate.toISOString().split("T")[0]
        }&time=${encodeURIComponent(standardizedTime)}&passengers=${
          formState.passengers.adults +
          formState.passengers.children +
          formState.passengers.infants
        }`
      );
    } else {
      // Handle activities
      const activityName = currentTabConfig?.activities?.find(
        (act) => act.id === formState.selectedActivity
      )?.name;
      router.push(
        `/activities/booking?activity=${formState.selectedActivity}&date=${
          formState.selectedDate.toISOString().split("T")[0]
        }&time=${encodeURIComponent(standardizedTime)}&passengers=${
          formState.passengers.adults +
          formState.passengers.children +
          formState.passengers.infants
        }`
      );
    }
  }, [currentTabConfig, formState, router, selectedTab, updateBookingState]);

  // Create button text based on variant
  const buttonText = useMemo(() => {
    if (variant === "compact") return "Search";
    return "View Details";
  }, [variant]);

  // For embedded variant, render just the form content
  if (variant === "embedded") {
    return (
      <div
        className={`${styles.bookingForm} ${styles[variant]} ${
          className || ""
        }`}
      >
        <div className={styles.formGrid}>
          {currentTabConfig?.type === "transport" ? (
            <div className={styles.locationSelectors}>
              <LocationSelect
                value={formState.fromLocation}
                onChange={(value) => handleFormChange("fromLocation", value)}
                label="From"
                options={currentTabConfig.locations || []}
              />
              <LocationSelect
                value={formState.toLocation}
                onChange={(value) => handleFormChange("toLocation", value)}
                label="To"
                options={currentTabConfig.locations || []}
              />
            </div>
          ) : (
            <div className={styles.activityContainer}>
              <ActivitySelect
                value={formState.selectedActivity}
                onChange={(value) =>
                  handleFormChange("selectedActivity", value)
                }
                options={currentTabConfig?.activities || []}
              />
            </div>
          )}

          <div className={styles.dateTimeSection}>
            <DateSelect
              selected={formState.selectedDate}
              onChange={(date) =>
                date && handleFormChange("selectedDate", date)
              }
            />

            <SlotSelect
              value={formState.selectedSlot}
              onChange={(value) => handleFormChange("selectedSlot", value)}
              options={currentTabConfig?.timeSlots || []}
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
      </div>
    );
  }

  return (
    <div
      className={`${styles.bookingForm} ${styles[variant]} ${className || ""}`}
    >
      <Tabs.Root
        className={styles.tabsRoot}
        value={selectedTab}
        onValueChange={handleTabChange}
      >
        {variant === "default" && (
          <Tabs.List className={styles.tabsList} aria-label="Book your travel">
            {TAB_CONFIG.map((tab) => (
              <Tabs.Trigger
                key={tab.id}
                className={styles.tabsTrigger}
                value={tab.id}
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        )}

        <Tabs.Content className={styles.tabsContent} value={selectedTab}>
          <div className={styles.formGrid}>
            {currentTabConfig?.type === "transport" ? (
              <div className={styles.locationSelectors}>
                <LocationSelect
                  value={formState.fromLocation}
                  onChange={(value) => handleFormChange("fromLocation", value)}
                  label="From"
                  options={currentTabConfig.locations || []}
                />
                <LocationSelect
                  value={formState.toLocation}
                  onChange={(value) => handleFormChange("toLocation", value)}
                  label="To"
                  options={currentTabConfig.locations || []}
                />
              </div>
            ) : (
              <div className={styles.activityContainer}>
                <ActivitySelect
                  value={formState.selectedActivity}
                  onChange={(value) =>
                    handleFormChange("selectedActivity", value)
                  }
                  options={currentTabConfig?.activities || []}
                />
              </div>
            )}

            <div className={styles.dateTimeSection}>
              <DateSelect
                selected={formState.selectedDate}
                onChange={(date) =>
                  date && handleFormChange("selectedDate", date)
                }
              />

              <SlotSelect
                value={formState.selectedSlot}
                onChange={(value) => handleFormChange("selectedSlot", value)}
                options={currentTabConfig?.timeSlots || []}
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
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
