import { Location } from "./components/atoms/locationSelect";
import { TimeSlot } from "./components/atoms/slotSelect";
import { Activity } from "./components/atoms/activitySelect";
import { PassengerCount } from "./components/atoms/passengerCounter";

// Domain-specific types for booking
export interface BookingData {
  id: string;
  type: "ferry" | "local-boat" | "activity";
  fromLocation?: string;
  toLocation?: string;
  activity?: string;
  date: Date;
  slot: string;
  passengers: PassengerCount;
  price: number;
  status: "pending" | "confirmed" | "cancelled";
}

// Re-export the tab config for use in booking contexts
export type { TabConfig } from "./components/organisms/bookingForm";

// Constants
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
