import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { useFerryBookingContext } from "@/context/FerryBookingContext";
import { useClientSearchParams } from "./useClientSearchParams";

export interface FerryBookingHookState {
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
}

export interface FerryBookingHookActions {
  handleChooseSeats: (classType: string, ferryIndex: number) => void;
  setTimeFilter: (filter: string | null) => void;
  SearchParamsLoader: React.FC;
}

// Define the hook
function useFerryBooking(): [FerryBookingHookState, FerryBookingHookActions] {
  const { searchParams, getParam, SearchParamsLoader } =
    useClientSearchParams();
  const router = useRouter();
  const { bookingState } = useBooking();
  const {
    ferryState,
    loadFerries,
    setTimeFilter: setFerryTimeFilter,
    selectFerry,
  } = useFerryBookingContext();

  // Memoize search parameters to prevent unnecessary re-renders
  const from = useMemo(
    () => getParam("from") || bookingState.from,
    [getParam, bookingState.from]
  );
  const to = useMemo(
    () => getParam("to") || bookingState.to,
    [getParam, bookingState.to]
  );
  const date = useMemo(
    () => getParam("date") || bookingState.date,
    [getParam, bookingState.date]
  );
  const time = useMemo(
    () => getParam("time") || bookingState.time,
    [getParam, bookingState.time]
  );
  const passengers = useMemo(
    () =>
      parseInt(
        getParam("passengers") ||
          String(
            bookingState.adults + bookingState.children + bookingState.infants
          ),
        10
      ),
    [getParam, bookingState.adults, bookingState.children, bookingState.infants]
  );

  // Effect for initial load and when search params change
  useEffect(() => {
    if (searchParams) {
      loadFerries(from, to, date, passengers);
    }
  }, [loadFerries, from, to, date, passengers, searchParams]);

  // Effect to set initial time filter
  useEffect(() => {
    if (time && !ferryState.timeFilter) {
      setFerryTimeFilter(time);
    }
  }, [time, ferryState.timeFilter, setFerryTimeFilter]);

  // Handle choosing seats - memoized to prevent recreation
  const handleChooseSeats = useCallback(
    (classType: string, ferryIndex: number) => {
      selectFerry(ferryIndex.toString(), classType);
      // Navigate to the ferry detail page using Next.js router
      router.push(`/ferry/booking/${ferryIndex}`);
    },
    [selectFerry, router]
  );

  // Memoized actions to prevent recreation on every render
  const actions = useMemo<FerryBookingHookActions>(
    () => ({
      handleChooseSeats,
      setTimeFilter: setFerryTimeFilter,
      SearchParamsLoader,
    }),
    [handleChooseSeats, setFerryTimeFilter, SearchParamsLoader]
  );

  // Memoized state to prevent recreation on every render
  const state = useMemo<FerryBookingHookState>(
    () => ({
      from,
      to,
      date,
      time,
      passengers,
    }),
    [from, to, date, time, passengers]
  );

  return [state, actions];
}

// Export both named and default exports for flexibility
export { useFerryBooking };
export default useFerryBooking;
