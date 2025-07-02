import React from "react";
import styles from "./ItineraryDay.module.css";
import { ItineraryDayProps } from "./ItineraryDay.types";

export const ItineraryDay: React.FC<ItineraryDayProps> = ({
  day,
  title,
  description,
  isLast = false,
}) => {
  return (
    <div className={styles.itineraryDay}>
      <div className={styles.dayNumber}>
        <span>Day {day}</span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
      {!isLast && <div className={styles.connector} />}
    </div>
  );
};
