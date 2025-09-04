import { FerryAggregationService } from "@/services/ferryServices/ferryAggregationService";
import { FerrySearchParams } from "@/types/FerryBookingSession.types";
import { useQuery } from "@tanstack/react-query";

export const useFerrySearch = (params: FerrySearchParams) => {
  return useQuery({
    queryKey: ["ferry-search", params],
    queryFn: async () => {
      // Call your API route instead of the service directly
      const response = await fetch("/api/ferry/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Ferry search failed");
      }

      const data = await response.json();
      return data.data; // Return the data portion which has results and errors
    },
    enabled: !!(
      (
        params.from &&
        params.to &&
        params.date &&
        params.adults >= 0 &&
        params.children >= 0
      )
      // &&
      // params.infants >= 0
    ),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    // Add retry logic specific to ferry search
    retry: (failureCount, error: any) => {
      // Don't retry if all operators are down
      if (error?.message?.includes("All ferry operators failed")) {
        return false;
      }
      return failureCount < 2;
    },

    // Add error handling
    throwOnError: false,

    // Refetch on window focus for real-time availability
    refetchOnWindowFocus: true,

    // Don't refetch too frequently to avoid hitting rate limits
    refetchInterval: false,
  });
};
