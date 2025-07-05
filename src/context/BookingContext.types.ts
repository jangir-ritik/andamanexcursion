// Types for the BookingContext

// Basic form state for bookings
export interface BookingFormState {
  from: string;
  to: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  infants: number;
}

// Context type that will be provided to consumers
export interface BookingContextType {
  bookingState: BookingFormState;
  updateBookingState: (newState: Partial<BookingFormState>) => void;
  resetBookingState: () => void;
  getTotalPassengers: () => number;
  getTimeRange: () => { startTime: string; endTime: string } | null;
}

// Action types for the reducer
export enum BookingActionTypes {
  UPDATE_BOOKING = "UPDATE_BOOKING",
  RESET_BOOKING = "RESET_BOOKING",
}

// Action interfaces
export interface UpdateBookingAction {
  type: BookingActionTypes.UPDATE_BOOKING;
  payload: Partial<BookingFormState>;
}

export interface ResetBookingAction {
  type: BookingActionTypes.RESET_BOOKING;
}

export type BookingAction = UpdateBookingAction | ResetBookingAction;
