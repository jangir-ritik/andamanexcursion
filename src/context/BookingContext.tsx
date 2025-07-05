"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { formatTimeForDisplay, parseTimeFilter } from "@/utils/timeUtils";

export interface BookingFormState {
  from: string;
  to: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  infants: number;
}

interface BookingContextType {
  bookingState: BookingFormState;
  updateBookingState: (newState: Partial<BookingFormState>) => void;
  resetBookingState: () => void;
  getTotalPassengers: () => number;
  getTimeRange: () => { startTime: string; endTime: string } | null;
}

// Use a function to get the current date to avoid stale dates on component remounts
const getCurrentDate = () => new Date().toISOString().split("T")[0];

const defaultBookingState: BookingFormState = {
  from: "Port Blair",
  to: "Havelock",
  date: getCurrentDate(),
  time: "11:00 AM",
  adults: 2,
  children: 0,
  infants: 0,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [bookingState, setBookingState] = useState<BookingFormState>(
    () => defaultBookingState
  );

  // Optimize update function to use functional updates
  const updateBookingState = useCallback(
    (newState: Partial<BookingFormState>) => {
      setBookingState((prevState) => {
        // If time is being updated, format it consistently
        const formattedState = { ...newState };
        if (formattedState.time) {
          formattedState.time = formatTimeForDisplay(formattedState.time);
        }

        return {
          ...prevState,
          ...formattedState,
        };
      });
    },
    []
  );

  // Optimize reset function
  const resetBookingState = useCallback(() => {
    setBookingState({
      ...defaultBookingState,
      date: getCurrentDate(), // Ensure date is always current
    });
  }, []);

  // Simplified passenger count calculation - doesn't need memoization
  const getTotalPassengers = useCallback(() => {
    return bookingState.adults + bookingState.children + bookingState.infants;
  }, [bookingState.adults, bookingState.children, bookingState.infants]);

  // Optimize time range calculation
  const getTimeRange = useCallback(() => {
    if (!bookingState.time) return null;

    // Parse the time string to get start and end times
    const timeRange = parseTimeFilter(bookingState.time);
    if (!timeRange) return null;

    // Format the times for display
    const formatTime = (time: number) => {
      const hours = Math.floor(time / 100);
      const minutes = time % 100;
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
    };

    return {
      startTime: formatTime(timeRange.start),
      endTime: formatTime(timeRange.end),
    };
  }, [bookingState.time]);

  // Create context value - still using useMemo to prevent unnecessary re-renders
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
