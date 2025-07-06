import { ActivityCardProps } from "@/components/molecules/BookingResults/ActivityResults";
import { convertTo24Hour, parseTimeFilter } from "@/utils/timeUtils";

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

  // Parse time filter
  const timeRange = parseTimeFilter(filter);
  if (!timeRange) {
    return activities;
  }

  // Filter activities by time slot
  return activities.filter((activity) => {
    // Extract the time part from the duration field (e.g., "10:00 AM - 1 hr" -> "10:00 AM")
    const timeMatch = activity.duration.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
    if (!timeMatch) return false;

    const activityTimeStr = timeMatch[1];
    const activityTime = convertTo24Hour(activityTimeStr);

    return activityTime >= timeRange.start && activityTime <= timeRange.end;
  });
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
  // Main time group: 10:00 AM to 11:59 AM
  const mainTimeGroup = activities.filter((activity) => {
    const timeMatch = activity.duration.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
    if (!timeMatch) return false;

    const activityTimeStr = timeMatch[1];
    const activityTime = convertTo24Hour(activityTimeStr);

    return activityTime >= 1000 && activityTime < 1200;
  });

  // Other time groups: before 10:00 AM or after 11:59 AM
  const otherTimeGroups = activities.filter((activity) => {
    const timeMatch = activity.duration.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
    if (!timeMatch) return false;

    const activityTimeStr = timeMatch[1];
    const activityTime = convertTo24Hour(activityTimeStr);

    return activityTime < 1000 || activityTime >= 1200;
  });

  return {
    mainTimeGroup,
    otherTimeGroups,
  };
}
