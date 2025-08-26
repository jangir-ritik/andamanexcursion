// src/hooks/queries/useActivityTimesByCategory.ts
// This hook is used to get the time slots for a given category and location
// It is used to populate the time slot dropdown in the unified searching form
// It is also used to get the time slots for a given activity in the booking results

import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/services/api/activities";

export interface TimeSlot {
  value: string;
  label: string;
  startTime: string;
  endTime: string;
}

export function useActivityTimesByCategory(
  categorySlug: string | null,
  locationSlug: string | null
) {
  return useQuery({
    queryKey: ["activity-times", categorySlug, locationSlug],
    queryFn: async (): Promise<TimeSlot[]> => {
      if (!categorySlug || !locationSlug) {
        return [];
      }

      return await activityApi.getAvailableTimesByCategory(
        categorySlug,
        locationSlug
      );
    },
    enabled: !!(categorySlug && locationSlug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
