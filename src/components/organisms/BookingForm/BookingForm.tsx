"use client";
import React, { useState, useMemo } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import styles from "./BookingForm.module.css";
import { TAB_CONFIG } from "./config/formConfig";
import type { BookingFormProps } from "./BookingForm.types";
import { ActivitySearchFormRQ } from "./components/ActivitySearchFormRQ";
import { FerrySearchForm } from "./components/FerrySearchForm";

export function BookingForm({
  className,
  variant = "default",
  initialTab = "ferry",
  hideTabs = false,
}: BookingFormProps) {
  const [selectedTab, setSelectedTab] = useState<string>(initialTab);

  // Get the tab config for the initial tab
  const initialTabConfig = useMemo(
    () => TAB_CONFIG.find((tab) => tab.id === initialTab) || TAB_CONFIG[0],
    [initialTab]
  );

  // For embedded variant or when hideTabs is true, render just the form content based on selected tab
  if (variant === "embedded" || hideTabs) {
    return (
      <div
        className={`${styles.bookingForm} ${styles[variant]} ${
          className || ""
        }`}
      >
        {initialTab === "ferry" && <FerrySearchForm variant={variant} />}
        {/* {selectedTab === "local-boat" && <BoatBookingForm variant={variant} />} */}
        {initialTab === "activities" && (
          <ActivitySearchFormRQ variant={variant} />
        )}
      </div>
    );
  }

  return (
    <div
      className={`${styles.bookingForm} ${styles[variant]} ${className || ""}`}
    >
      <Tabs.Root
        className={styles.tabsRoot}
        defaultValue={initialTab}
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

        <Tabs.Content className={styles.tabsContent} value="ferry">
          <FerrySearchForm variant={variant} />
        </Tabs.Content>

        <Tabs.Content className={styles.tabsContent} value="local-boat">
          {/* <BoatBookingForm variant={variant} /> */}
          null
        </Tabs.Content>

        <Tabs.Content className={styles.tabsContent} value="activities">
          <ActivitySearchFormRQ variant={variant} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
