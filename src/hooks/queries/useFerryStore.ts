import { useFerryStore } from "@/store/FerryStore";
import { useFerrySearch } from "./ferryQueryHooks/useFerrySearch";
import { useSeatLayout } from "./ferryQueryHooks/useSeatLayout";
import { useFerryBooking, useFerryHealth } from "./ferryQueryHooks";

// Enhanced orchestration hook with fault tolerance support
export const useFerryFlow = () => {
  const {
    searchParams,
    selectedFerry,
    selectedClass,
    selectedSeats,
    bookingSession,
  } = useFerryStore();

  // Enhanced search Query with fault tolerance
  const searchQuery = useFerrySearch(searchParams);

  // Seat Layout query (only if ferry and class selected)
  const seatLayoutQuery = useSeatLayout(
    selectedFerry?.operator || "",
    selectedFerry?.id || null,
    selectedClass?.id || null,
    selectedFerry?.operatorData?.originalResponse?.routeId || null,
    searchParams.date || null
  );

  // Mutations
  const bookingMutation = useFerryBooking();

  // Health status
  const healthQuery = useFerryHealth();

  // Derived state
  const isSearchEnabled = !!(
    searchParams.from &&
    searchParams.to &&
    searchParams.date
  );

  const canSelectSeats = !!(
    selectedFerry &&
    selectedClass &&
    selectedFerry.operator !== "makruzz" &&
    selectedFerry.features.supportsSeatSelection
  );

  const isReadyToBook = !!(
    selectedFerry &&
    selectedClass &&
    (selectedSeats.length > 0 || !selectedFerry.features.supportsSeatSelection)
  );

  // Helper functions
  const createBooking = () => {
    if (bookingSession) {
      return bookingMutation.mutate(bookingSession);
    }
  };

  const getServiceStatus = () => {
    const searchData = searchQuery.data;
    if (!searchData) return null;

    return {
      availableOperators: searchData.availableOperators || [],
      failedOperators: searchData.failedOperators || [],
      isPartialFailure: searchData.isPartialFailure || false,
      operatorErrors: searchData.errors || [],
    };
  };

  return {
    // Search state - Enhanced with fault tolerance
    ferries: searchQuery.data?.results || [],
    searchErrors: searchQuery.data?.errors || [],
    isSearching: searchQuery.isFetching,
    searchError: searchQuery.error,
    isPartialFailure: searchQuery.data?.isPartialFailure || false,
    availableOperators: searchQuery.data?.availableOperators || [],
    failedOperators: searchQuery.data?.failedOperators || [],

    // Seat layout state
    seatLayout: seatLayoutQuery.data,
    isLoadingSeats: seatLayoutQuery.isFetching,
    seatError: seatLayoutQuery.error,

    // Booking state
    isBooking: bookingMutation.isPending,
    bookingError: bookingMutation.error,
    bookingSuccess: bookingMutation.data,

    // Health state
    operatorHealth: healthQuery.data,
    isCheckingHealth: healthQuery.isFetching,

    // Computed state
    isSearchEnabled,
    canSelectSeats,
    isReadyToBook,

    // Service status helper
    serviceStatus: getServiceStatus(),

    // Actions
    refetchSearch: searchQuery.refetch,
    refetchSeats: seatLayoutQuery.refetch,
    createBooking,

    // Raw queries for advanced usage
    queries: {
      search: searchQuery,
      seatLayout: seatLayoutQuery,
      health: healthQuery,
    },
    mutations: {
      booking: bookingMutation,
    },

    // Enhanced error information
    hasAnyErrors: !!(
      searchQuery.error ||
      (searchQuery.data?.errors?.length && searchQuery.data.errors.length > 0)
    ),
    hasCriticalError: !!(
      searchQuery.error &&
      (!searchQuery.data?.results?.length ||
        searchQuery.data.results.length === 0)
    ),
    hasPartialFailure: !!(
      searchQuery.data?.isPartialFailure &&
      searchQuery.data.results?.length &&
      searchQuery.data.results.length > 0
    ),
  };
};
