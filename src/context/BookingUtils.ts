import { parseTimeFilter } from "@/utils/timeUtils";
import { BookingFormState } from "./BookingContext.types";

/**
 * Calculates the total number of passengers from the booking state
 * @param bookingState Current booking state
 * @returns Total number of passengers
 */
export function calculateTotalPassengers(
  bookingState: BookingFormState
): number {
  return bookingState.adults + bookingState.children + bookingState.infants;
}

/**
 * Calculates the time range from a time string
 * @param timeString Time string to parse
 * @returns Object containing start and end times, or null if invalid
 */
export function calculateTimeRange(
  timeString: string
): { startTime: string; endTime: string } | null {
  if (!timeString) return null;

  // Parse the time string to get start and end times
  const timeRange = parseTimeFilter(timeString);
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
}
