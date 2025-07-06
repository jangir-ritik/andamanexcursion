import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { useActivityBookingContext } from "@/context/ActivityBookingContext";

export interface ActivityBookingHookState {
  activity: string;
  date: string;
  time: string;
  passengers: number;
}

export interface ActivityBookingHookActions {
  handleSelectActivity: (activityId: string) => void;
  setTimeFilter: (filter: string | null) => void;
}

// Define the hook
function useActivityBooking(): [
  ActivityBookingHookState,
  ActivityBookingHookActions
] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { bookingState } = useBooking();
  const {
    activityState,
    loadActivities,
    setTimeFilter: setActivityTimeFilter,
    selectActivity,
  } = useActivityBookingContext();

  // Memoize search parameters to prevent unnecessary re-renders
  const activity = useMemo(
    () => searchParams.get("activity") || "scuba-diving",
    [searchParams]
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
    loadActivities(activity, date, time, passengers);
  }, [loadActivities, activity, date, time, passengers]);

  // Effect to set initial time filter
  useEffect(() => {
    if (time && !activityState.timeFilter) {
      setActivityTimeFilter(time);
    }
  }, [time, activityState.timeFilter, setActivityTimeFilter]);

  // Handle selecting an activity - memoized to prevent recreation
  const handleSelectActivity = useCallback(
    (activityId: string) => {
      selectActivity(activityId);
      // Navigate to the activity detail page using Next.js router
      router.push(`/activities/booking?id=${activityId}`);
    },
    [selectActivity, router]
  );

  // Memoized actions to prevent recreation on every render
  const actions = useMemo<ActivityBookingHookActions>(
    () => ({
      handleSelectActivity,
      setTimeFilter: setActivityTimeFilter,
    }),
    [handleSelectActivity, setActivityTimeFilter]
  );

  // Memoized state to prevent recreation on every render
  const state = useMemo<ActivityBookingHookState>(
    () => ({
      activity,
      date,
      time,
      passengers,
    }),
    [activity, date, time, passengers]
  );

  return [state, actions];
}

// Export both named and default exports for flexibility
export { useActivityBooking };
export default useActivityBooking;
