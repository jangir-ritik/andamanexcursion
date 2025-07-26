// import { useState, useEffect, useCallback, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import { useBooking } from "@/context/BookingContext";
// import { useActivityBookingContext } from "@/context/ActivityBookingContext";
// import { useClientSearchParams } from "./useClientSearchParams";

// export interface ActivityBookingHookState {
//   activity: string;
//   date: string;
//   time: string;
//   passengers: number;
// }

// export interface ActivityBookingHookActions {
//   handleSelectActivity: (activityId: string) => void;
//   setTimeFilter: (filter: string | null) => void;
//   SearchParamsLoader: React.FC;
// }

// // Define the hook
// function useActivityBooking(): [
//   ActivityBookingHookState,
//   ActivityBookingHookActions
// ] {
//   const { searchParams, getParam, SearchParamsLoader } =
//     useClientSearchParams();
//   const router = useRouter();
//   const { bookingState } = useBooking();
//   const {
//     activityState,
//     loadActivities,
//     setTimeFilter: setActivityTimeFilter,
//     selectActivity,
//   } = useActivityBookingContext();

//   // Memoize search parameters to prevent unnecessary re-renders
//   const activity = useMemo(
//     () => getParam("activity") || "scuba-diving",
//     [getParam]
//   );
//   const date = useMemo(
//     () => getParam("date") || bookingState.date,
//     [getParam, bookingState.date]
//   );
//   const time = useMemo(
//     () => getParam("time") || bookingState.time,
//     [getParam, bookingState.time]
//   );
//   const passengers = useMemo(
//     () =>
//       parseInt(
//         getParam("passengers") ||
//           String(
//             bookingState.adults + bookingState.children + bookingState.infants
//           ),
//         10
//       ),
//     [getParam, bookingState.adults, bookingState.children, bookingState.infants]
//   );

//   // Effect for initial load and when search params change
//   useEffect(() => {
//     if (searchParams) {
//       loadActivities(activity, date, time, passengers);
//     }
//   }, [loadActivities, activity, date, time, passengers, searchParams]);

//   // Effect to set initial time filter
//   useEffect(() => {
//     if (time && !activityState.timeFilter) {
//       setActivityTimeFilter(time);
//     }
//   }, [time, activityState.timeFilter, setActivityTimeFilter]);

//   // Handle selecting an activity - memoized to prevent recreation
//   const handleSelectActivity = useCallback(
//     (activityId: string) => {
//       selectActivity(activityId);
//       // Navigate to the activity detail page using Next.js router
//       router.push(`/activities/booking?id=${activityId}`);
//     },
//     [selectActivity, router]
//   );

//   // Memoized actions to prevent recreation on every render
//   const actions = useMemo<ActivityBookingHookActions>(
//     () => ({
//       handleSelectActivity,
//       setTimeFilter: setActivityTimeFilter,
//       SearchParamsLoader,
//     }),
//     [handleSelectActivity, setActivityTimeFilter, SearchParamsLoader]
//   );

//   // Memoized state to prevent recreation on every render
//   const state = useMemo<ActivityBookingHookState>(
//     () => ({
//       activity,
//       date,
//       time,
//       passengers,
//     }),
//     [activity, date, time, passengers]
//   );

//   return [state, actions];
// }

// // Export both named and default exports for flexibility
// export { useActivityBooking };
// export default useActivityBooking;
