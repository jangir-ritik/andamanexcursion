import { Boat } from "./BoatBookingContext.types";

/**
 * Filter boats by departure time
 */
export const filterBoatsByTime = (
  boats: Boat[],
  timeFilter: string | null
): Boat[] => {
  if (!timeFilter) {
    return boats;
  }

  return boats.filter((boat) => {
    // Convert boat departure time to comparable format (e.g., "10:00 AM" to "10:00")
    const boatTime = boat.departureTime
      .replace(/\s?[AP]M/, "")
      .trim()
      .padStart(5, "0");

    // Convert filter time to comparable format
    const filterTimeFormatted = timeFilter
      .replace(/\s?[AP]M/, "")
      .trim()
      .padStart(5, "0");

    return boatTime === filterTimeFormatted;
  });
};

/**
 * Group boats by departure time
 */
export const groupBoatsByTime = (boats: Boat[]) => {
  // If no boats, return empty groups
  if (!boats.length) {
    return { mainTimeGroup: [], otherTimeGroups: [] };
  }

  // Count occurrences of each departure time
  const timeCounts: Record<string, number> = {};
  boats.forEach((boat) => {
    const time = boat.departureTime;
    timeCounts[time] = (timeCounts[time] || 0) + 1;
  });

  // Find the most common departure time
  let mostCommonTime = "";
  let maxCount = 0;
  Object.entries(timeCounts).forEach(([time, count]) => {
    if (count > maxCount) {
      mostCommonTime = time;
      maxCount = count;
    }
  });

  // Group boats by the most common time and other times
  const mainTimeGroup = boats.filter(
    (boat) => boat.departureTime === mostCommonTime
  );
  const otherTimeGroups = boats.filter(
    (boat) => boat.departureTime !== mostCommonTime
  );

  return { mainTimeGroup, otherTimeGroups };
};
