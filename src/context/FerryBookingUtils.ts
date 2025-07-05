import { FerryCardProps } from "@/components/molecules/Cards/FerryCard/FerryCard.types";
import { convertTo24Hour, parseTimeFilter } from "@/utils/timeUtils";

/**
 * Filters ferries by time range
 * @param ferries List of ferries to filter
 * @param filter Time filter string
 * @returns Filtered list of ferries
 */
export function filterFerriesByTime(
  ferries: FerryCardProps[],
  filter: string | null
): FerryCardProps[] {
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
    return departureTime >= timeRange.start && departureTime <= timeRange.end;
  });
}

/**
 * Groups ferries by time
 * @param ferries List of ferries to group
 * @returns Object containing main time group and other time groups
 */
export function groupFerriesByTime(ferries: FerryCardProps[]): {
  mainTimeGroup: FerryCardProps[];
  otherTimeGroups: FerryCardProps[];
} {
  // Main time group: 10:00 AM to 11:59 AM
  const mainTimeGroup = ferries.filter((ferry) => {
    const departureTime = convertTo24Hour(ferry.departureTime);
    return departureTime >= 1000 && departureTime < 1200;
  });

  // Other time groups: before 10:00 AM or after 11:59 AM
  const otherTimeGroups = ferries.filter((ferry) => {
    const departureTime = convertTo24Hour(ferry.departureTime);
    return departureTime < 1000 || departureTime >= 1200;
  });

  return {
    mainTimeGroup,
    otherTimeGroups,
  };
}
