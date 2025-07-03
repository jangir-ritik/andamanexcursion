"use client";
import React, { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import styles from "./BookingForm.module.css";
import { TAB_CONFIG } from "./config/formConfig";

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

export function BookingForm({ className }: BookingFormProps) {
  const [selectedTab, setSelectedTab] = useState<string>("ferry");
  const [formState, setFormState] = React.useState<FormState>({
    fromLocation: "port-blair",
    toLocation: "havelock",
    selectedActivity: "scuba-diving",
    selectedDate: new Date(),
    selectedSlot: "11-00",
    passengers: {
      adults: 1,
      infants: 0,
    },
  });

  const currentTabConfig = TAB_CONFIG.find((tab) => tab.id === selectedTab);

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

  const handlePassengerChange = (type: keyof PassengerCount, value: number) => {
    setFormState((prev) => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(0, type === "adults" ? 1 : 0, value),
      },
    }));
  };

  const handleFormChange = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    // Reset slot when changing tabs
    setFormState((prev) => ({
      ...prev,
      selectedSlot: "",
    }));
  };

  return (
    <div className={`${styles.bookingForm} ${className || ""}`}>
      <Tabs.Root
        className={styles.tabsRoot}
        value={selectedTab}
        onValueChange={handleTabChange}
      >
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
              >
                View Details
              </Button>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
