import React, { useState, useMemo } from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import styles from "./TimeFilters.module.css";

interface TimeFiltersProps {
  results: UnifiedFerryResult[];
  onFilterChange?: (filteredResults: UnifiedFerryResult[]) => void;
}

type TimeFilter = "all" | "morning" | "afternoon" | "evening";

export function TimeFilters({ results, onFilterChange }: TimeFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("all");

  // Group ferries by time periods
  const timeGroups = useMemo(() => {
    const groups = {
      morning: results.filter((ferry) => {
        const hour = parseInt(ferry.schedule.departureTime.split(":")[0]);
        return hour >= 6 && hour < 12;
      }),
      afternoon: results.filter((ferry) => {
        const hour = parseInt(ferry.schedule.departureTime.split(":")[0]);
        return hour >= 12 && hour < 17;
      }),
      evening: results.filter((ferry) => {
        const hour = parseInt(ferry.schedule.departureTime.split(":")[0]);
        return hour >= 17 || hour < 6;
      }),
    };

    return groups;
  }, [results]);

  const filteredResults = useMemo(() => {
    switch (activeFilter) {
      case "morning":
        return timeGroups.morning;
      case "afternoon":
        return timeGroups.afternoon;
      case "evening":
        return timeGroups.evening;
      default:
        return results;
    }
  }, [activeFilter, results, timeGroups]);

  // Notify parent component of filter changes
  React.useEffect(() => {
    onFilterChange?.(filteredResults);
  }, [filteredResults, onFilterChange]);

  const handleFilterChange = (filter: TimeFilter) => {
    setActiveFilter(filter);
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className={styles.timeFilters}>
      <h3 className={styles.title}>Filter by departure time</h3>

      <div className={styles.filterButtons}>
        <button
          className={`${styles.filterButton} ${
            activeFilter === "all" ? styles.active : ""
          }`}
          onClick={() => handleFilterChange("all")}
        >
          All Times
          <span className={styles.count}>({results.length})</span>
        </button>

        <button
          className={`${styles.filterButton} ${
            activeFilter === "morning" ? styles.active : ""
          }`}
          onClick={() => handleFilterChange("morning")}
          disabled={timeGroups.morning.length === 0}
        >
          Morning
          <span className={styles.timeRange}>6AM - 12PM</span>
          <span className={styles.count}>({timeGroups.morning.length})</span>
        </button>

        <button
          className={`${styles.filterButton} ${
            activeFilter === "afternoon" ? styles.active : ""
          }`}
          onClick={() => handleFilterChange("afternoon")}
          disabled={timeGroups.afternoon.length === 0}
        >
          Afternoon
          <span className={styles.timeRange}>12PM - 5PM</span>
          <span className={styles.count}>({timeGroups.afternoon.length})</span>
        </button>

        <button
          className={`${styles.filterButton} ${
            activeFilter === "evening" ? styles.active : ""
          }`}
          onClick={() => handleFilterChange("evening")}
          disabled={timeGroups.evening.length === 0}
        >
          Evening
          <span className={styles.timeRange}>5PM onwards</span>
          <span className={styles.count}>({timeGroups.evening.length})</span>
        </button>
      </div>
    </div>
  );
}
