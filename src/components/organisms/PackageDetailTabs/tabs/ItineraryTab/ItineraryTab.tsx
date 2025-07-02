import React from "react";
import styles from "./ItineraryTab.module.css";
import { Column } from "@/components/layout/Column";
import { ItineraryDay } from "../../components/ItineraryDay/ItineraryDay";
import { ItineraryTabProps } from "@/types/components/organisms/packageDetailTabs";

export const ItineraryTab: React.FC<ItineraryTabProps> = ({ itinerary }) => {
  return (
    <div
      className={styles.itineraryContainer}
      role="region"
      aria-label="Package itinerary"
    >
      <Column gap={4} fullWidth>
        <div className={styles.timeline} aria-label="Day-by-day itinerary">
          {itinerary.map((day, index) => (
            <ItineraryDay
              key={day.day}
              day={day.day}
              title={day.title}
              description={day.description}
              isLast={index === itinerary.length - 1}
            />
          ))}
        </div>
      </Column>
    </div>
  );
};
