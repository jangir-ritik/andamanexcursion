// Utility functions to transform API data to UI-friendly formats

// Transform locations for select component
export const transformLocationsForSelect = (
  locations: any[]
): Array<{ id: string; name: string }> => {
  return locations.map((location) => ({
    id: location.id,
    name: location.name,
  }));
};

// Transform time slots for select component
export const transformTimeSlotsForSelect = (
  timeSlots: any[]
): Array<{ id: string; time: string }> => {
  return timeSlots.map((slot) => ({
    id: slot.id,
    time: slot.twelveHourTime || slot.startTime,
  }));
};

// Transform activities for select component
export const transformActivitiesForSelect = (
  activities: any[]
): Array<{ id: string; name: string }> => {
  return activities.map((activity) => ({
    id: activity.slug, // Use slug as ID for better readability in URLs
    name: activity.title,
  }));
};
