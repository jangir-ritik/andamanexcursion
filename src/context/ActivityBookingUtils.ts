import { ActivityCardProps } from "@/components/molecules/Cards/ActivityCard/ActivityCard.types";

/**
 * Filters activities by time range
 * @param activities List of activities to filter
 * @param filter Time filter string
 * @returns Filtered list of activities
 */
export function filterActivitiesByTime(
  activities: ActivityCardProps[],
  filter: string | null
): ActivityCardProps[] {
  if (!activities.length) {
    return [];
  }

  // If no time filter, show all activities
  if (!filter) {
    return activities;
  }

  // For now, just return all activities since we've simplified the time format
  return activities;
}

/**
 * Groups activities by time
 * @param activities List of activities to group
 * @returns Object containing main time group and other time groups
 */
export function groupActivitiesByTime(activities: ActivityCardProps[]): {
  mainTimeGroup: ActivityCardProps[];
  otherTimeGroups: ActivityCardProps[];
} {
  // For simplicity, put all activities in the main time group
  return {
    mainTimeGroup: activities,
    otherTimeGroups: [],
  };
}
