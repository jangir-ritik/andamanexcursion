import { useMemo, useState } from "react";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";

export const useTimeFiltering = (
  searchResults: UnifiedFerryResult[] | null
) => {
  const [timeFilter, setTimeFilter] = useState<string | null>(null);

  const filteredResults = useMemo(() => {
    if (!searchResults || searchResults.length === 0) {
      return [];
    }

    if (!timeFilter) {
      return searchResults;
    }

    const [startHour, endHour] = timeFilter.split("-").map((time) => {
      const hour = parseInt(time.substring(0, 2));
      return hour;
    });

    return searchResults.filter((ferry: UnifiedFerryResult) => {
      const departureHour = parseInt(
        ferry.schedule.departureTime.split(":")[0]
      );

      if (startHour <= endHour) {
        return departureHour >= startHour && departureHour < endHour;
      } else {
        // Handle overnight times (e.g., 18:00 - 05:59)
        return departureHour >= startHour || departureHour < endHour;
      }
    });
  }, [searchResults, timeFilter]);

  return {
    timeFilter,
    setTimeFilter,
    filteredResults,
  };
};
