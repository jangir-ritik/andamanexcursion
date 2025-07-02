import React from "react";
import styles from "./ItineraryDay.module.css";
import { ItineraryDayProps } from "@/types/components/atoms/ItineraryDay";

export const ItineraryDay: React.FC<ItineraryDayProps> = ({
  day,
  title,
  description,
  isLast = false,
}) => {
  return (
    <div
      role="listitem"
      aria-label={`Itinerary Day: ${day} - ${title}`}
      className={styles.dayContainer}
    >
      <div className={styles.timelineMarker}>
        <div className={styles.dot} />
        {!isLast && <div className={styles.line} />}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>
          <span className={styles.dayNumber}>Day {day}:</span> {title}
        </h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
};
