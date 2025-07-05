import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FerryCardProps } from "@/components/molecules/Cards/FerryCard/FerryCard.types";
import { useBooking } from "@/context/BookingContext";
import { fetchAvailableFerries } from "@/services/ferryService";
import { convertTo24Hour, parseTimeFilter } from "@/utils/timeUtils";

export interface FerryBookingState {
  ferries: FerryCardProps[];
  filteredFerries: FerryCardProps[];
  mainTimeGroup: FerryCardProps[];
  otherTimeGroups: FerryCardProps[];
  loading: boolean;
  from: string;
  to: string;
  date: string;
  time: string;
  timeFilter: string | null;
  passengers: number;
}

export interface FerryBookingActions {
  handleChooseSeats: (classType: string, ferryIndex: number) => void;
  setTimeFilter: (filter: string | null) => void;
}

// Define the hook
function useFerryBooking(): [FerryBookingState, FerryBookingActions] {
  const searchParams = useSearchParams();
  const { bookingState } = useBooking();
  const [ferries, setFerries] = useState<FerryCardProps[]>([]);
  const [filteredFerries, setFilteredFerries] = useState<FerryCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);

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

  // Load ferries based on search parameters - optimized with useCallback
  const loadFerries = useCallback(async () => {
    setLoading(true);
    const data = await fetchAvailableFerries(from, to, date, passengers);
    setFerries(data);

    // Set initial time filter from URL or booking state
    if (time && !timeFilter) {
      setTimeFilter(time);
    }

    setLoading(false);
  }, [from, to, date, passengers, time, timeFilter]);

  // Effect for initial load and when search params change
  useEffect(() => {
    loadFerries();
  }, [loadFerries]);

  // Memoized filter function to prevent unnecessary recalculations
  const filterFerriesByTime = useCallback(
    (ferries: FerryCardProps[], filter: string | null) => {
      if (!ferries.length) {
        return [];
      }

      // If no time filter, show all ferries
      if (!filter) {
        return ferries;
      }

      // Parse time filter
      const timeRange = parseTimeFilter(filter);
      if (!timeRange) {
        return ferries;
      }

      // Filter ferries by departure time
      return ferries.filter((ferry) => {
        const departureTime = convertTo24Hour(ferry.departureTime);
        return (
          departureTime >= timeRange.start && departureTime <= timeRange.end
        );
      });
    },
    []
  );

  // Filter ferries based on time range - optimized with useEffect dependency
  useEffect(() => {
    const filtered = filterFerriesByTime(ferries, timeFilter);
    setFilteredFerries(filtered);
  }, [ferries, timeFilter, filterFerriesByTime]);

  // Handle choosing seats - memoized to prevent recreation
  const handleChooseSeats = useCallback(
    (classType: string, ferryIndex: number) => {
      console.log(`Selected ${classType} class`);
      // Navigate to the ferry detail page
      window.location.href = `/ferry/booking/${ferryIndex}`;
    },
    []
  );

  // Memoized time groups to prevent unnecessary recalculations
  const mainTimeGroup = useMemo(
    () =>
      filteredFerries.filter((ferry) => {
        const departureTime = convertTo24Hour(ferry.departureTime);
        return departureTime >= 1000 && departureTime < 1200; // 10:00 AM to 11:59 AM
      }),
    [filteredFerries]
  );

  const otherTimeGroups = useMemo(
    () =>
      filteredFerries.filter((ferry) => {
        const departureTime = convertTo24Hour(ferry.departureTime);
        return departureTime < 1000 || departureTime >= 1200;
      }),
    [filteredFerries]
  );

  // Memoized actions to prevent recreation on every render
  const actions = useMemo<FerryBookingActions>(
    () => ({
      handleChooseSeats,
      setTimeFilter,
    }),
    [handleChooseSeats, setTimeFilter]
  );

  // Memoized state to prevent recreation on every render
  const state = useMemo<FerryBookingState>(
    () => ({
      ferries,
      filteredFerries,
      mainTimeGroup,
      otherTimeGroups,
      loading,
      from,
      to,
      date,
      time,
      timeFilter,
      passengers,
    }),
    [
      ferries,
      filteredFerries,
      mainTimeGroup,
      otherTimeGroups,
      loading,
      from,
      to,
      date,
      time,
      timeFilter,
      passengers,
    ]
  );

  return [state, actions];
}

// Export both named and default exports for flexibility
export { useFerryBooking };
export default useFerryBooking;
