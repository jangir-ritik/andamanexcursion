import { formatTimeForDisplay } from "@/utils/timeUtils";
import {
  BookingFormState,
  BookingAction,
  BookingActionTypes,
} from "./BookingContext.types";

// Use a function to get the current date to avoid stale dates on component remounts
export const getCurrentDate = () => new Date().toISOString().split("T")[0];

// Default state for the booking form
export const defaultBookingState: BookingFormState = {
  from: "Port Blair",
  to: "Havelock",
  date: getCurrentDate(),
  time: "11:00 AM",
  adults: 2,
  children: 0,
  infants: 0,
};

/**
 * Reducer function for the booking state
 * @param state Current booking state
 * @param action Action to perform on the state
 * @returns New booking state
 */
export function bookingReducer(
  state: BookingFormState,
  action: BookingAction
): BookingFormState {
  switch (action.type) {
    case BookingActionTypes.UPDATE_BOOKING:
      // Format time if it's being updated
      const formattedPayload = { ...action.payload };
      if (formattedPayload.time) {
        formattedPayload.time = formatTimeForDisplay(formattedPayload.time);
      }

      return {
        ...state,
        ...formattedPayload,
      };

    case BookingActionTypes.RESET_BOOKING:
      return {
        ...defaultBookingState,
        date: getCurrentDate(), // Ensure date is always current
      };

    default:
      return state;
  }
}
