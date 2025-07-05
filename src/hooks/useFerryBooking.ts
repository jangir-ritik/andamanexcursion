import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { useFerryBookingContext } from "@/context/FerryBookingContext";

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
}

// Define the hook
function useFerryBooking(): [FerryBookingHookState, FerryBookingHookActions] {
  const searchParams = useSearchParams();
  const { bookingState } = useBooking();
  const {
    ferryState,
    loadFerries,
    setTimeFilter: setFerryTimeFilter,
    selectFerry,
  } = useFerryBookingContext();

  // Memoize search parameters to prevent unnecessary re-renders
  const from = useMemo(
    () => searchParams.get("from") || bookingState.from,
    [searchParams, bookingState.from]
  );
  const to = useMemo(
    () => searchParams.get("to") || bookingState.to,
    [searchParams, bookingState.to]
  );
  const date = useMemo(
    () => searchParams.get("date") || bookingState.date,
    [searchParams, bookingState.date]
  );
  const time = useMemo(
    () => searchParams.get("time") || bookingState.time,
    [searchParams, bookingState.time]
  );
  const passengers = useMemo(
    () =>
      parseInt(
        searchParams.get("passengers") ||
          String(
            bookingState.adults + bookingState.children + bookingState.infants
          ),
        10
      ),
    [
      searchParams,
      bookingState.adults,
      bookingState.children,
      bookingState.infants,
    ]
  );

  // Effect for initial load and when search params change
  useEffect(() => {
    loadFerries(from, to, date, passengers);
  }, [loadFerries, from, to, date, passengers]);

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
      // Navigate to the ferry detail page
      window.location.href = `/ferry/booking/${ferryIndex}`;
    },
    [selectFerry]
  );

  // Memoized actions to prevent recreation on every render
  const actions = useMemo<FerryBookingHookActions>(
    () => ({
      handleChooseSeats,
      setTimeFilter: setFerryTimeFilter,
    }),
    [handleChooseSeats, setFerryTimeFilter]
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
