import { useQuery } from "@tanstack/react-query";
import {
  FerrySearchParams,
  UnifiedFerryResult,
} from "@/types/FerryBookingSession.types";

interface FerrySearchResponse {
  success: boolean;
  message?: string;
  data: {
    results: UnifiedFerryResult[];
    searchParams: FerrySearchParams;
    meta: {
      totalResults: number;
      searchTime: string;
      operatorErrors: Array<{
        operator: string;
        error: string;
      }>;
      availableOperators: string[];
      failedOperators: string[];
    };
  };
}

interface FerrySearchError {
  success: false;
  error: string;
  message: string;
  details?: any;
}

export const useFerrySearch = (searchParams: FerrySearchParams | null) => {
  return useQuery({
    queryKey: ["ferry-search", searchParams],
    queryFn: async (): Promise<{
      results: UnifiedFerryResult[];
      errors: Array<{ operator: string; error: string }>;
      isPartialFailure: boolean;
      availableOperators: string[];
      failedOperators: string[];
    }> => {
      if (!searchParams?.from || !searchParams?.to || !searchParams?.date) {
        throw new Error("Missing required search parameters");
      }

      const response = await fetch("/api/ferry/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      const data = await response.json();

      // Handle different response status codes
      if (response.status === 200) {
        // Complete success
        const successData = data as FerrySearchResponse;
        return {
          results: successData.data.results,
          errors: successData.data.meta.operatorErrors || [],
          isPartialFailure: false,
          availableOperators: successData.data.meta.availableOperators || [],
          failedOperators: successData.data.meta.failedOperators || [],
        };
      } else if (response.status === 207) {
        // Partial success - some operators failed
        const partialData = data as FerrySearchResponse;
        return {
          results: partialData.data.results,
          errors: partialData.data.meta.operatorErrors || [],
          isPartialFailure: true,
          availableOperators: partialData.data.meta.availableOperators || [],
          failedOperators: partialData.data.meta.failedOperators || [],
        };
      } else if (response.status === 503) {
        // Service completely unavailable
        const errorData = data as FerrySearchError;
        throw new Error(`Service unavailable: ${errorData.message}`);
      } else {
        // Other client/server errors
        const errorData = data as FerrySearchError;
        throw new Error(
          errorData.message || errorData.error || "Ferry search failed"
        );
      }
    },
    enabled: !!(searchParams?.from && searchParams?.to && searchParams?.date),
    retry: (failureCount, error) => {
      // Don't retry client errors (4xx)
      if (
        error.message.includes("Missing required") ||
        error.message.includes("Invalid date")
      ) {
        return false;
      }

      // Retry service errors up to 2 times with exponential backoff
      if (
        error.message.includes("Service unavailable") ||
        error.message.includes("timeout")
      ) {
        return failureCount < 2;
      }

      // Retry other errors once
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 2, // 2 minutes - ferry data changes frequently
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when user comes back to tab
    refetchOnMount: "always", // Always fetch fresh data when component mounts
  });
};
