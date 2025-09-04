import { useFerryStore } from "@/store/FerryStore";
import { useFerrySearch } from "./ferryQueryHooks/useFerrySearch";
import { useSeatLayout } from "./ferryQueryHooks/useSeatLayout";
import { useFerryBooking, useFerryHealth } from "./ferryQueryHooks";

// Main orchestration hook that combines all ferry operations
export const useFerryFlow = () => {
  const {
    searchParams,
    selectedFerry,
    selectedClass,
    selectedSeats,
    bookingSession,
  } = useFerryStore();

  // Search Query
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
  // const seatBlockingMutation = useSeatBlocking();
  // const seatReleaseMutation = useSeatRelease();
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
  // const blockSeats = (seatNumbers: string[]) => {
  //   if (
  //     selectedFerry?.operator === "greenocean" &&
  //     selectedFerry &&
  //     selectedClass
  //   ) {
  //     return seatBlockingMutation.mutate({
  //       routeId: selectedFerry.operatorData.routeId,
  //       ferryId: selectedFerry.id,
  //       classId: selectedClass.id,
  //       seatNumbers,
  //       travelDate: searchParams.date,
  //     });
  //   }
  // };

  // const releaseSeats = (blockingId: string) => {
  //   if (selectedFerry && selectedClass) {
  //     return seatReleaseMutation.mutate({
  //       blockingId,
  //       ferryId: selectedFerry.id,
  //       classId: selectedClass.id,
  //     });
  //   }
  // };

  const createBooking = () => {
    if (bookingSession) {
      return bookingMutation.mutate(bookingSession);
    }
  };

  return {
    // Search state
    ferries: searchQuery.data?.results || [],
    searchErrors: searchQuery.data?.errors || [],
    isSearching: searchQuery.isFetching,
    searchError: searchQuery.error,

    // Seat layout state
    seatLayout: seatLayoutQuery.data,
    isLoadingSeats: seatLayoutQuery.isFetching,
    seatError: seatLayoutQuery.error,

    // Seat blocking state
    // isBlockingSeats: seatBlockingMutation.isPending,
    // blockingError: seatBlockingMutation.error,

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

    // Actions
    refetchSearch: searchQuery.refetch,
    refetchSeats: seatLayoutQuery.refetch,
    // blockSeats,
    // releaseSeats,
    createBooking,

    // Raw queries for advanced usage
    queries: {
      search: searchQuery,
      seatLayout: seatLayoutQuery,
      health: healthQuery,
    },

    mutations: {
      // seatBlocking: seatBlockingMutation,
      // seatRelease: seatReleaseMutation,
      booking: bookingMutation,
    },
  };
};
