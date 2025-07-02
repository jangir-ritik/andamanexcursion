import { LOCATIONS, ACTIVITIES, TIME_SLOTS } from "../BookingForm.types";
import { TabConfig } from "../BookingForm.types";

// Custom time slots for specific tabs
const LOCAL_BOAT_TIME_SLOTS = TIME_SLOTS.filter((slot) =>
  [
    "08-00",
    "08-30",
    "09-00",
    "09-30",
    "10-00",
    "10-30",
    "11-00",
    "11-30",
    "12-00",
    "12-30",
  ].includes(slot.id)
);

const ACTIVITY_TIME_SLOTS = TIME_SLOTS.filter((slot) =>
  [
    "07-00",
    "07-30",
    "08-00",
    "08-30",
    "09-00",
    "09-30",
    "10-00",
    "10-30",
    "11-00",
    "11-30",
    "14-00",
    "14-30",
  ].includes(slot.id)
);

export const TAB_CONFIG: TabConfig[] = [
  {
    id: "ferry",
    label: "Ferry",
    type: "transport",
    locations: LOCATIONS,
    timeSlots: TIME_SLOTS,
  },
  {
    id: "local-boat",
    label: "Local Boat",
    type: "transport",
    locations: LOCATIONS,
    timeSlots: LOCAL_BOAT_TIME_SLOTS,
  },
  {
    id: "activities",
    label: "Activities",
    type: "activity",
    activities: ACTIVITIES,
    timeSlots: ACTIVITY_TIME_SLOTS,
  },
];
