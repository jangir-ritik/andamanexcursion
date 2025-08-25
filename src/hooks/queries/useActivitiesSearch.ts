import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/services/api/activities";
import { ActivitySearchParams } from "@/store/ActivityStoreRQ";

export function useActivitiesSearch(
  searchParams: ActivitySearchParams,
  enabled: boolean = true
) {
  const queryEnabled = enabled && !!searchParams.activityType;

  console.log("🔍 useActivitiesSearch - Hook called:", {
    searchParams,
    enabled,
    queryEnabled,
    activityType: searchParams.activityType,
  });

  return useQuery({
    queryKey: ["activities", "search", searchParams],
    queryFn: async () => {
      console.log(
        "🔍 useActivitiesSearch - Executing query with params:",
        searchParams
      );
      const result = await activityApi.search(searchParams);
      console.log(
        "🔍 useActivitiesSearch - Query result:",
        result?.length || 0,
        "activities"
      );
      return result;
    },
    enabled: queryEnabled,
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
