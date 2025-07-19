import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { useBoatBookingContext } from "@/context/BoatBookingContext";
import { useClientSearchParams } from "./useClientSearchParams";

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
  SearchParamsLoader: React.FC;
}

// Define the hook
function useBoatBooking(): [BoatBookingHookState, BoatBookingHookActions] {
  const { searchParams, getParam, SearchParamsLoader } =
    useClientSearchParams();
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
      loadBoats(from, to, date, passengers);
    }
  }, [loadBoats, from, to, date, passengers, searchParams]);

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
      SearchParamsLoader,
    }),
    [handleSelectBoat, setBoatTimeFilter, SearchParamsLoader]
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
