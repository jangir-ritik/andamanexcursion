import React, { memo, useCallback, useMemo } from "react";
import { Clock } from "lucide-react";
import styles from "../page.module.css";
import { Chip } from "@/components/atoms";

// Define time filters as a constant to prevent recreation on each render
export const TIME_FILTERS = [
  { id: "morning", text: "Morning", value: "0600-1200" },
  { id: "afternoon", text: "Afternoon", value: "1200-1800" },
  { id: "evening", text: "Evening", value: "1800-2359" },
];

interface TimeFiltersProps {
  timeFilter: string | null;
  setTimeFilter: (filter: string | null) => void;
}

// Memoized chip component to prevent unnecessary re-renders
const FilterChip = memo<{
  text: string;
  isSelected: boolean;
  onClick: () => void;
}>(({ text, isSelected, onClick }) => (
  <div
    className={`${styles.clickableChip} ${isSelected ? styles.selected : ""}`}
    onClick={onClick}
  >
    <Chip
      className={styles.timeFilterChip}
      iconComponent={<Clock size={16} />}
      text={text}
    />
  </div>
));

FilterChip.displayName = "FilterChip";

export const TimeFilters = memo<TimeFiltersProps>(
  ({ timeFilter, setTimeFilter }) => {
    // Create a stable callback for clearing the filter
    const handleClearFilter = useCallback(() => {
      setTimeFilter(null);
    }, [setTimeFilter]);

    // Create a factory function to generate stable callbacks for each filter
    const createFilterHandler = useCallback(
      (value: string) => () => {
        setTimeFilter(value);
      },
      [setTimeFilter]
    );

    // Memoize the filter chips to prevent unnecessary re-renders
    const filterChips = useMemo(() => {
      return TIME_FILTERS.map((filter) => {
        const isSelected = timeFilter === filter.value;
        const onClick = createFilterHandler(filter.value);

        return (
          <FilterChip
            key={filter.id}
            text={filter.text}
            isSelected={isSelected}
            onClick={onClick}
          />
        );
      });
    }, [timeFilter, createFilterHandler]);

    return (
      <div className={styles.timeFilters}>
        <span className={styles.filterLabel}>Filter by time:</span>
        <div className={styles.chipContainer}>
          <FilterChip
            text="All Times"
            isSelected={!timeFilter}
            onClick={handleClearFilter}
          />
          {filterChips}
        </div>
      </div>
    );
  }
);

TimeFilters.displayName = "TimeFilters";
