import React, { memo } from "react";
import { Info } from "lucide-react";
import styles from "../page.module.css";
import { formatTimeForDisplay } from "@/utils/timeUtils";

interface SearchSummaryProps {
  loading: boolean;
  ferryCount: number;
  from: string;
  to: string;
  date: string;
  time: string;
  timeFilter: string | null;
  passengers: number;
}

export const SearchSummary = memo<SearchSummaryProps>(
  ({ loading, ferryCount, from, to, date, time, timeFilter, passengers }) => {
    if (loading) {
      return (
        <div className={styles.searchSummary}>
          <div className={styles.searchInfo}>
            <p>Searching for ferries...</p>
          </div>
          {/* <Button href="/ferry" variant="outline" size="small">
            Modify Search
          </Button> */}
        </div>
      );
    }

    const displayTime = formatTimeForDisplay(timeFilter || time);
    const formattedDate = new Date(date).toLocaleDateString();
    const passengerText = `${passengers} Passenger${
      passengers !== 1 ? "s" : ""
    }`;

    return (
      <div className={styles.searchSummary}>
        <div className={styles.searchInfo}>
          <div className={styles.ferryCount}>
            <Info size={16} />
            <span>
              {ferryCount} ferries found for {from} to {to} at {displayTime}
            </span>
          </div>
          <h2>
            {from} to {to} • {formattedDate} • {passengerText}
          </h2>
        </div>
        {/* <Button href="/ferry" variant="outline" size="small">
          Modify Search
        </Button> */}
      </div>
    );
  }
);
