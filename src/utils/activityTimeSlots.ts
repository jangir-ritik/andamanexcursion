import { Activity, TimeSlotOption } from "@/store/ActivityStore";
import {
  activityTimeSlotApi,
  ActivityTimeSlot,
} from "@/services/api/activityTimeSlots";

/**
 * Get filtered time slots for an activity
 * This is the main function - always use this for accurate filtering
 */
export async function getActivityTimeSlots(
  activity: Activity | null,
  allTimeSlots: TimeSlotOption[]
): Promise<TimeSlotOption[]> {
  // If no activity is provided, return all time slots
  if (!activity) {
    return allTimeSlots;
  }

  try {
    // Check if activity has custom time slots configured
    if (
      activity.scheduling?.useCustomTimeSlots &&
      activity.scheduling?.availableTimeSlots?.length
    ) {
      // Use activity's specific time slots
      const customTimeSlots = activity.scheduling.availableTimeSlots;

      // Filter allTimeSlots to only include the ones in customTimeSlots
      const filteredSlots = allTimeSlots.filter((uiSlot) =>
        customTimeSlots.some((customSlot) => customSlot.id === uiSlot.id)
      );

      console.log("📋 Using custom time slots for activity:", {
        activityTitle: activity.title,
        customSlotsCount: customTimeSlots.length,
        filteredSlotsCount: filteredSlots.length,
      });

      return filteredSlots.length > 0 ? filteredSlots : allTimeSlots;
    }

    // Fall back to category-based filtering
    let activityTimeSlots: ActivityTimeSlot[] = [];
    const categorySlug = activity.coreInfo.category[0]?.slug;

    if (categorySlug) {
      // Fetch time slots for this category from the database
      activityTimeSlots = await activityTimeSlotApi.getForCategory(
        categorySlug
      );

      console.log("📊 Category-based filtering:", {
        activityTitle: activity.title,
        categorySlug,
        foundTimeSlots: activityTimeSlots.length,
      });
    }

    // If no specific time slots found, return all slots
    if (!activityTimeSlots.length) {
      console.log("⚠️ No time slots found for category, returning all slots");
      return allTimeSlots;
    }

    // Filter UI time slots based on activity time slots
    const filteredSlots = allTimeSlots.filter((uiSlot) => {
      const slotTime = uiSlot.time || uiSlot.value.replace("-", ":");
      return activityTimeSlotApi.isTimeInSlots(slotTime, activityTimeSlots);
    });

    console.log("✅ Filtering complete:", {
      originalSlots: allTimeSlots.length,
      filteredSlots: filteredSlots.length,
      filteredTimes: filteredSlots.map((slot) => slot.label),
    });

    return filteredSlots.length > 0 ? filteredSlots : allTimeSlots;
  } catch (error) {
    console.error("❌ Error filtering time slots:", error);
    return allTimeSlots;
  }
}

/**
 * Synchronous version for immediate use (less accurate, use async version when possible)
 * Only filters based on custom time slots, not category-based filtering
 */
export function getActivityTimeSlotsSync(
  activity: Activity | null,
  allTimeSlots: TimeSlotOption[]
): TimeSlotOption[] {
  if (!activity) {
    return allTimeSlots;
  }

  // Only handle custom time slots synchronously
  if (
    activity.scheduling?.useCustomTimeSlots &&
    activity.scheduling?.availableTimeSlots?.length
  ) {
    const customTimeSlots = activity.scheduling.availableTimeSlots;

    const filteredSlots = allTimeSlots.filter((uiSlot) =>
      customTimeSlots.some(
        (customSlot) =>
          customSlot.slug === uiSlot.value || customSlot.id === uiSlot.id
      )
    );

    return filteredSlots.length > 0 ? filteredSlots : allTimeSlots;
  }

  // For category-based filtering, return all slots (use async version for accurate filtering)
  return allTimeSlots;
}

/**
 * Get activity-specific time slots for display (like in activity cards)
 * This converts activity time slot data to display format
 */
export function getActivityDisplayTimeSlots(activity: Activity | null): Array<{
  id: string;
  startTime: string;
  endTime?: string;
  displayTime: string;
  isAvailable: boolean;
}> {
  if (!activity) return [];

  // Use activity's direct availableTimeSlots if present
  if (activity.availableTimeSlots?.length) {
    return activity.availableTimeSlots;
  }

  // Convert scheduling time slots to display format
  if (activity.scheduling?.availableTimeSlots?.length) {
    return activity.scheduling.availableTimeSlots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      displayTime: slot.twelveHourTime || formatTimeForDisplay(slot.startTime),
      isAvailable: slot.status?.isActive !== false,
    }));
  }

  return [];
}

/**
 * Convert 24-hour time to 12-hour format for display
 */
export function formatTimeForDisplay(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours >= 12 ? "PM" : "AM";
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Create duration-appropriate time slots for activities
 * This replaces 30-minute intervals with slots that match the activity duration
 */
export function createDurationBasedTimeSlots(
  activity: Activity | null,
  categorySlug?: string
): TimeSlotOption[] {
  if (!activity && !categorySlug) return [];

  // Get activity duration in hours
  const duration = activity?.coreInfo?.duration || "2 hours";
  const durationHours = parseDurationToHours(duration);

  // Determine activity type for appropriate time ranges
  const activityTitle = activity?.title || "";
  const category =
    categorySlug || activity?.coreInfo?.category?.[0]?.slug || "";

  const isWaterActivity =
    activityTitle.toLowerCase().includes("scuba") ||
    activityTitle.toLowerCase().includes("snorkel") ||
    activityTitle.toLowerCase().includes("diving") ||
    activityTitle.toLowerCase().includes("kayak") ||
    category.includes("water") ||
    category.includes("marine");

  const isAdventureActivity =
    category.includes("adventure") ||
    activityTitle.toLowerCase().includes("trek") ||
    activityTitle.toLowerCase().includes("hike");

  // Create appropriate time slots based on activity type and duration
  if (isWaterActivity) {
    return [
      createTimeSlot("09:00", durationHours, "morning-water"),
      createTimeSlot("14:00", durationHours, "afternoon-water"),
    ].filter((slot) => slot !== null);
  } else if (isAdventureActivity) {
    return [
      createTimeSlot("08:00", durationHours, "early-adventure"),
      createTimeSlot("15:00", durationHours, "afternoon-adventure"),
    ].filter((slot) => slot !== null);
  } else {
    // General activities
    return [
      createTimeSlot("10:00", durationHours, "morning-general"),
      createTimeSlot("14:00", durationHours, "afternoon-general"),
      createTimeSlot("17:00", durationHours, "evening-general"),
    ].filter((slot) => slot !== null);
  }
}

/**
 * Helper to create a single time slot
 */
function createTimeSlot(
  startTime: string,
  durationHours: number,
  id: string
): TimeSlotOption | null {
  try {
    const endTime = addHoursToTime(startTime, durationHours);
    const endHour = parseInt(endTime.split(":")[0]);

    // Don't create slots that go past 6 PM
    if (endHour > 18) return null;

    const timeSlug = startTime.replace(":", "-");
    const displayLabel = `${formatTimeForDisplay(
      startTime
    )} - ${formatTimeForDisplay(endTime)}`;

    return {
      id,
      name: displayLabel,
      value: timeSlug,
      slug: timeSlug,
      label: displayLabel,
      time: formatTimeForDisplay(startTime),
    };
  } catch (error) {
    console.error("Error creating time slot:", error);
    return null;
  }
}

/**
 * Parse duration string to hours
 */
function parseDurationToHours(duration: string): number {
  const match = duration.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 2; // default to 2 hours
}

/**
 * Add hours to a time string
 */
function addHoursToTime(timeStr: string, hours: number): string {
  const [hour, minute] = timeStr.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + hours * 60;
  const newHour = Math.floor(totalMinutes / 60) % 24;
  const newMinute = totalMinutes % 60;
  return `${newHour.toString().padStart(2, "0")}:${newMinute
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Check if a specific time slot is available for an activity (async version)
 */
export async function isTimeSlotAvailableForActivity(
  timeSlotId: string,
  activity: Activity | null,
  allTimeSlots: TimeSlotOption[]
): Promise<boolean> {
  if (!activity) return true;

  const availableSlots = await getActivityTimeSlots(activity, allTimeSlots);
  return availableSlots.some(
    (slot) => slot.id === timeSlotId || slot.value === timeSlotId
  );
}

/**
 * Get the first available time slot for an activity (async version)
 */
export async function getFirstAvailableTimeSlot(
  activity: Activity | null,
  allTimeSlots: TimeSlotOption[]
): Promise<string> {
  if (!activity) return allTimeSlots[0]?.value || "";

  const availableSlots = await getActivityTimeSlots(activity, allTimeSlots);
  return availableSlots[0]?.value || allTimeSlots[0]?.value || "";
}
