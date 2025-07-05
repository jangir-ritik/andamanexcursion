"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useReducer,
} from "react";

import {
  BookingContextType,
  BookingFormState,
  BookingActionTypes,
} from "./BookingContext.types";

import { bookingReducer, defaultBookingState } from "./BookingReducer";

import { calculateTotalPassengers, calculateTimeRange } from "./BookingUtils";

// Create the context with undefined as default value
const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Use reducer instead of useState
  const [bookingState, dispatch] = useReducer(
    bookingReducer,
    defaultBookingState
  );

  // Update booking state using dispatch
  const updateBookingState = useCallback(
    (newState: Partial<BookingFormState>) => {
      dispatch({
        type: BookingActionTypes.UPDATE_BOOKING,
        payload: newState,
      });
    },
    []
  );

  // Reset booking state using dispatch
  const resetBookingState = useCallback(() => {
    dispatch({ type: BookingActionTypes.RESET_BOOKING });
  }, []);

  // Calculate total passengers using utility function
  const getTotalPassengers = useCallback(() => {
    return calculateTotalPassengers(bookingState);
  }, [bookingState]);

  // Calculate time range using utility function
  const getTimeRange = useCallback(() => {
    return calculateTimeRange(bookingState.time);
  }, [bookingState]);

  // Create context value
  const contextValue = useMemo<BookingContextType>(
    () => ({
      bookingState,
      updateBookingState,
      resetBookingState,
      getTotalPassengers,
      getTimeRange,
    }),
    [
      bookingState,
      updateBookingState,
      resetBookingState,
      getTotalPassengers,
      getTimeRange,
    ]
  );

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};

// Re-export types for convenience
export type { BookingFormState } from "./BookingContext.types";
