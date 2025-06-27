"use client";
import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { MoveRight } from "lucide-react";
import styles from "./BookingForm.module.css";
import { LocationSelect } from "./components/LocationSelect";
import { DateSelect } from "./components/DateSelect";
import { SlotSelect } from "./components/SlotSelect";
import {
  PassengerCounter,
  PassengerCount,
} from "./components/PassengerCounter";
import { ActivitySelect } from "./components/ActivitySelect";
import { TAB_CONFIG } from "./config/formConfig";
import { Button } from "../Button/Button";

type BookingFormProps = {
  className?: string;
};

type FormState = {
  fromLocation: string;
  toLocation: string;
  selectedActivity: string;
  selectedDate: Date;
  selectedSlot: string;
  passengers: PassengerCount;
};

export function BookingForm({ className }: BookingFormProps) {
  const [selectedTab, setSelectedTab] = React.useState(TAB_CONFIG[0].id);
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

  return (
    <div className={`${styles.bookingForm} ${className || ""}`}>
      <Tabs.Root
        className={styles.tabsRoot}
        value={selectedTab}
        onValueChange={setSelectedTab}
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
              <ActivitySelect
                value={formState.selectedActivity}
                onChange={(value) =>
                  handleFormChange("selectedActivity", value)
                }
                options={currentTabConfig?.activities || []}
              />
            )}

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

            <PassengerCounter
              value={formState.passengers}
              onChange={handlePassengerChange}
            />
            <Button>
              View Details <MoveRight size={18} />
            </Button>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
