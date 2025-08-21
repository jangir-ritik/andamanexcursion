import { useQuery } from "@tanstack/react-query";
import { activityTimeSlotApi } from "@/services/api/activityTimeSlots";

export function useActivityTimeSlotsByCategory(categorySlug: string | null) {
  return useQuery({
    queryKey: ["activityTimeSlots", "category", categorySlug],
    queryFn: () => activityTimeSlotApi.getForCategory(categorySlug!),
    enabled: !!categorySlug,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

export function useActivityTimeSlotsById(timeSlotIds: string[]) {
  return useQuery({
    queryKey: ["activityTimeSlots", "ids", timeSlotIds.sort()],
    queryFn: () => activityTimeSlotApi.getByIds(timeSlotIds),
    enabled: timeSlotIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}
