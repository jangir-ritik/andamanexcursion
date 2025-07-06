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
  // For activities, we'll assume each activity has a start time that's part of its duration
  // For example, "1hr" might start at 10:00 AM
  return activities.filter((activity) => {
    // For now, we'll use a simple approach - if the activity's location contains a time
    // In a real app, you'd have a proper time field
    const activityTime = convertTo24Hour(activity.duration.split(" ")[0]);
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
    const activityTime = convertTo24Hour(activity.duration.split(" ")[0]);
    return activityTime >= 1000 && activityTime < 1200;
  });

  // Other time groups: before 10:00 AM or after 11:59 AM
  const otherTimeGroups = activities.filter((activity) => {
    const activityTime = convertTo24Hour(activity.duration.split(" ")[0]);
    return activityTime < 1000 || activityTime >= 1200;
  });

  return {
    mainTimeGroup,
    otherTimeGroups,
  };
}
