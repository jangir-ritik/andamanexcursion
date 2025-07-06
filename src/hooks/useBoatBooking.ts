import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { useBoatBookingContext } from "@/context/BoatBookingContext";

export interface BoatBookingHookState {
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
}

export interface BoatBookingHookActions {
  handleSelectBoat: (classType: string, boatIndex: number) => void;
  setTimeFilter: (filter: string | null) => void;
}

// Define the hook
function useBoatBooking(): [BoatBookingHookState, BoatBookingHookActions] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { bookingState } = useBooking();
  const {
    boatState,
    loadBoats,
    setTimeFilter: setBoatTimeFilter,
    selectBoat,
  } = useBoatBookingContext();

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
    loadBoats(from, to, date, passengers);
  }, [loadBoats, from, to, date, passengers]);

  // Effect to set initial time filter
  useEffect(() => {
    if (time && !boatState.timeFilter) {
      setBoatTimeFilter(time);
    }
  }, [time, boatState.timeFilter, setBoatTimeFilter]);

  // Handle selecting a boat - memoized to prevent recreation
  const handleSelectBoat = useCallback(
    (classType: string, boatIndex: number) => {
      selectBoat(boatIndex.toString(), classType);
      // Navigate to the boat detail page using Next.js router
      router.push(`/boat/booking/${boatIndex}`);
    },
    [selectBoat, router]
  );

  // Memoized actions to prevent recreation on every render
  const actions = useMemo<BoatBookingHookActions>(
    () => ({
      handleSelectBoat,
      setTimeFilter: setBoatTimeFilter,
    }),
    [handleSelectBoat, setBoatTimeFilter]
  );

  // Memoized state to prevent recreation on every render
  const state = useMemo<BoatBookingHookState>(
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
export { useBoatBooking };
export default useBoatBooking;
