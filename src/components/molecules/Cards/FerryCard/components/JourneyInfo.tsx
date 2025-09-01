import React, { memo } from "react";
import { IconContainer } from "@/components/atoms/IconContainer/IconContainer";
import styles from "../FerryCard.module.css";
import ferryBoatIcon from "@public/icons/misc/boat.svg";
import circle_unfilled from "@public/icons/misc/circle_unfilled.svg";
import circle_filled from "@public/icons/misc/circle_filled.svg";

interface JourneyInfoProps {
  departureTime: string;
  departureLocation: string;
  arrivalTime: string;
  arrivalLocation: string;
}

export const JourneyInfo = memo<JourneyInfoProps>(
  ({ departureTime, departureLocation, arrivalTime, arrivalLocation }) => {
    // Format time for datetime attribute (ISO format)
    const formatTimeForDateTime = (timeStr: string): string => {
      // This is a simple implementation - adjust based on your actual time format
      const today = new Date().toISOString().split("T")[0];
      return `${today}T${timeStr.replace(/\s?(AM|PM)/i, "")}:00`;
    };

    return (
      <div className={styles.journeyInfo}>
        <div className={styles.departureInfo}>
          <time
            className={styles.timeText}
            dateTime={formatTimeForDateTime(departureTime)}
          >
            {departureTime}
          </time>
          <span className={styles.locationText}>{departureLocation}</span>
        </div>

        <div className={styles.journeyLine} role="presentation">
          <div className={styles.dottedLine} />
          <div className={styles.circleStart}>
            <IconContainer
              src={circle_unfilled}
              alt=""
              size={24}
              aria-hidden="true"
            />
          </div>
          <div className={styles.ferryIcon}>
            <IconContainer src={ferryBoatIcon} alt="" aria-hidden="true" />
          </div>
          <div className={styles.circleEnd}>
            <IconContainer
              src={circle_filled}
              alt=""
              size={24}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className={styles.departureInfo}>
          <time
            className={styles.timeText}
            dateTime={formatTimeForDateTime(arrivalTime)}
          >
            {arrivalTime}
          </time>
          <span className={styles.locationText}>{arrivalLocation}</span>
        </div>
      </div>
    );
  }
);

JourneyInfo.displayName = "JourneyInfo";
