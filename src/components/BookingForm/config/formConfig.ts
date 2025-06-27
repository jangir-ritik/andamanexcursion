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
  { id: "09-00", time: "9:00AM" },
  { id: "11-00", time: "11:00AM" },
  { id: "13-00", time: "1:00PM" },
  { id: "15-00", time: "3:00PM" },
];

export const LOCAL_BOAT_TIME_SLOTS: TimeSlot[] = [
  { id: "08-00", time: "8:00AM" },
  { id: "10-00", time: "10:00AM" },
  { id: "12-00", time: "12:00PM" },
];

export const ACTIVITY_TIME_SLOTS: TimeSlot[] = [
  { id: "07-00", time: "7:00AM" },
  { id: "09-00", time: "9:00AM" },
  { id: "11-00", time: "11:00AM" },
  { id: "14-00", time: "2:00PM" },
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
