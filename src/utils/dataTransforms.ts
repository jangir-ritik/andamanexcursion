// Utility functions to transform API data to UI-friendly formats
import { TimeSlot, Location } from "@payload-types";
import { formatTimeForDisplay } from "./timeUtils";

// Transform locations for select component
export const transformLocationsForSelect = (
  locations: Location[]
): Array<{
  id: string;
  name: string;
  slug: string;
  value: string;
  label: string;
}> => {
  return locations.map((location) => ({
    id: location.id,
    name: location.name,
    slug: location.slug || location.name.toLowerCase().replace(/\s+/g, "-"), // Fallback if no slug
    value: location.slug || location.name.toLowerCase().replace(/\s+/g, "-"), // Use slug as value
    label: location.name,
  }));
};

// Transform time slots for select components with slug support
// Sorted by startTime (24-hour format)
export function transformTimeSlotsForSelect(timeSlots: TimeSlot[]) {
  // Sort by startTime first
  const sortedSlots = [...timeSlots].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  return sortedSlots.map((slot) => ({
    id: slot.id,
    startTime: slot.startTime, // 24-hour format like "09:00"
    twelveHourTime: slot.twelveHourTime, // 12-hour format like "9:00 AM"
    slug: slot.slug,
    value: slot.slug, // Use slug as form value
    label: slot.twelveHourTime || formatTimeForDisplay(slot.startTime), // Display 12-hour format
    time: slot.twelveHourTime || formatTimeForDisplay(slot.startTime), // Backward compatibility
  }));
}

// Transform activities for select component
export const transformActivitiesForSelect = (
  activities: any[]
): Array<{
  id: string;
  name: string;
  slug: string;
  value: string;
  label: string;
}> => {
  return activities.map((activity) => ({
    id: activity.id,
    name: activity.name,
    slug: activity.slug || activity.name.toLowerCase().replace(/\s+/g, "-"),
    value: activity.slug || activity.name.toLowerCase().replace(/\s+/g, "-"),
    label: activity.name,
  }));
};

// Helper function to convert slug back to human readable format
export function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper function to find time slot by slug and get its display time
export function getTimeDisplayBySlug(
  timeSlots: TimeSlot[],
  slug: string
): string {
  const slot = timeSlots.find((slot) => slot.slug === slug);
  return slot?.twelveHourTime || slot?.startTime || "";
}

// Helper function to find option by slug
export function findOptionBySlug<T extends { slug: string }>(
  options: T[],
  slug: string
): T | undefined {
  return options.find((option) => option.slug === slug);
}

// Time conversion utilities for sorting
export function convertTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;

  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

// Sort time slots by time
export function sortTimeSlotsByTime<T extends { time: string }>(
  slots: T[]
): T[] {
  return [...slots].sort((a, b) => {
    const timeA = convertTimeToMinutes(a.time);
    const timeB = convertTimeToMinutes(b.time);
    return timeA - timeB;
  });
}
