import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { OverviewTab } from "./tabs/OverviewTab";
import { ItineraryTab } from "./tabs/ItineraryTab";
import { WhatsCoveredTab } from "./tabs/WhatsCoveredTab";
import { PackageDetailTabsProps } from "@/types/components/organisms/packageDetailTabs";

import styles from "./PackageDetailTabs.module.css";

export const PackageDetailTabs: React.FC<PackageDetailTabsProps> = ({
  packageData,
}) => {
  return (
    <Tabs.Root className={styles.tabsRoot} defaultValue="overview">
      <Tabs.List className={styles.tabsList} aria-label="Package details">
        <Tabs.Trigger
          className={styles.tabsTrigger}
          value="overview"
          aria-controls="overview-tab"
        >
          Overview
        </Tabs.Trigger>
        <Tabs.Trigger
          className={styles.tabsTrigger}
          value="itinerary"
          aria-controls="itinerary-tab"
        >
          Itinerary
        </Tabs.Trigger>
        <Tabs.Trigger
          className={styles.tabsTrigger}
          value="whats-covered"
          aria-controls="whats-covered-tab"
        >
          What's Covered
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content
        className={styles.tabsContent}
        value="overview"
        id="overview-tab"
        role="tabpanel"
        aria-labelledby="overview"
      >
        <OverviewTab packageData={packageData} />
      </Tabs.Content>

      <Tabs.Content
        className={styles.tabsContent}
        value="itinerary"
        id="itinerary-tab"
        role="tabpanel"
        aria-labelledby="itinerary"
      >
        <ItineraryTab itinerary={packageData.itinerary} />
      </Tabs.Content>

      <Tabs.Content
        className={styles.tabsContent}
        value="whats-covered"
        id="whats-covered-tab"
        role="tabpanel"
        aria-labelledby="whats-covered"
      >
        <WhatsCoveredTab
          includes={packageData.includes}
          excludes={packageData.excludes}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
};
