import { Location } from "../components/LocationSelect";
import { TimeSlot } from "../components/SlotSelect";

export type Activity = {
  id: string;
  name: string;
};

export type TabConfig = {
  id: string;
  label: string;
  type: "transport" | "activity";
  locations?: Location[];
  activities?: Activity[];
  timeSlots: TimeSlot[];
};

export const LOCATIONS: Location[] = [
  { id: "port-blair", name: "Port Blair" },
  { id: "havelock", name: "Havelock" },
  { id: "neil-island", name: "Neil Island" },
];

export const ACTIVITIES: Activity[] = [
  { id: "scuba-diving", name: "Scuba Diving" },
  { id: "snorkeling", name: "Snorkeling" },
  { id: "sea-walk", name: "Sea Walk" },
  { id: "glass-bottom", name: "Glass Bottom Boat" },
  { id: "jet-ski", name: "Jet Ski" },
];

export const TIME_SLOTS: TimeSlot[] = [
  { id: "09-00", time: "9:00AM - 9:30AM" },
  { id: "09-30", time: "9:30AM - 10:00AM" },
  { id: "10-00", time: "10:00AM - 10:30AM" },
  { id: "10-30", time: "10:30AM - 11:00AM" },
  { id: "11-00", time: "11:00AM - 11:30AM" },
  { id: "11-30", time: "11:30AM - 12:00PM" },
  { id: "13-00", time: "1:00PM - 1:30PM" },
  { id: "13-30", time: "1:30PM - 2:00PM" },
  { id: "14-00", time: "2:00PM - 2:30PM" },
  { id: "14-30", time: "2:30PM - 3:00PM" },
  { id: "15-00", time: "3:00PM - 3:30PM" },
  { id: "15-30", time: "3:30PM - 4:00PM" },
];

export const LOCAL_BOAT_TIME_SLOTS: TimeSlot[] = [
  { id: "08-00", time: "8:00AM - 8:30AM" },
  { id: "08-30", time: "8:30AM - 9:00AM" },
  { id: "09-00", time: "9:00AM - 9:30AM" },
  { id: "09-30", time: "9:30AM - 10:00AM" },
  { id: "10-00", time: "10:00AM - 10:30AM" },
  { id: "10-30", time: "10:30AM - 11:00AM" },
  { id: "11-00", time: "11:00AM - 11:30AM" },
  { id: "11-30", time: "11:30AM - 12:00PM" },
  { id: "12-00", time: "12:00PM - 12:30PM" },
  { id: "12-30", time: "12:30PM - 1:00PM" },
];

export const ACTIVITY_TIME_SLOTS: TimeSlot[] = [
  { id: "07-00", time: "7:00AM - 7:30AM" },
  { id: "07-30", time: "7:30AM - 8:00AM" },
  { id: "08-00", time: "8:00AM - 8:30AM" },
  { id: "08-30", time: "8:30AM - 9:00AM" },
  { id: "09-00", time: "9:00AM - 9:30AM" },
  { id: "09-30", time: "9:30AM - 10:00AM" },
  { id: "10-00", time: "10:00AM - 10:30AM" },
  { id: "10-30", time: "10:30AM - 11:00AM" },
  { id: "11-00", time: "11:00AM - 11:30AM" },
  { id: "11-30", time: "11:30AM - 12:00PM" },
  { id: "14-00", time: "2:00PM - 2:30PM" },
  { id: "14-30", time: "2:30PM - 3:00PM" },
];

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
