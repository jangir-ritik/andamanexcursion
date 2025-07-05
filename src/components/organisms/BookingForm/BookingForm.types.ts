import { Location } from "@/components/atoms/LocationSelect/LocationSelect.types";
import { TimeSlot } from "@/components/atoms/SlotSelect/SlotSelect.types";
import { Activity } from "@/components/atoms/ActivitySelect/ActivitySelect.types";
import { PassengerCount } from "@/components/atoms/PassengerCounter/PassengerCounter.types";

export interface BookingFormProps {
  className?: string;
  variant?: "default" | "compact" | "embedded";
  initialTab?: "ferry" | "local-boat" | "activities";
}

export interface FormState {
  fromLocation: string;
  toLocation: string;
  selectedActivity: string;
  selectedDate: Date;
  selectedSlot: string;
  passengers: PassengerCount;
}

export interface TabConfig {
  id: string;
  label: string;
  type: "transport" | "activity";
  locations?: Location[];
  activities?: Activity[];
  timeSlots: TimeSlot[];
}

// Constants previously in src/types/booking.ts
export const LOCATIONS: Location[] = [
  { id: "port-blair", name: "Port Blair" },
  { id: "havelock", name: "Havelock" },
  { id: "neil-island", name: "Neil Island" },
  { id: "diglipur", name: "Diglipur" },
  { id: "rangat", name: "Rangat" },
];

export const ACTIVITIES: Activity[] = [
  { id: "scuba-diving", name: "Scuba Diving" },
  { id: "snorkeling", name: "Snorkeling" },
  { id: "sea-walk", name: "Sea Walk" },
  { id: "glass-bottom-boat", name: "Glass Bottom Boat" },
  { id: "jet-ski", name: "Jet Ski" },
  { id: "parasailing", name: "Parasailing" },
];

export const TIME_SLOTS: TimeSlot[] = [
  { id: "07-00", time: "7:00 AM" },
  { id: "07-30", time: "7:30 AM" },
  { id: "08-00", time: "8:00 AM" },
  { id: "08-30", time: "8:30 AM" },
  { id: "09-00", time: "9:00 AM" },
  { id: "09-30", time: "9:30 AM" },
  { id: "10-00", time: "10:00 AM" },
  { id: "10-30", time: "10:30 AM" },
  { id: "11-00", time: "11:00 AM" },
  { id: "11-30", time: "11:30 AM" },
  { id: "12-00", time: "12:00 PM" },
  { id: "12-30", time: "12:30 PM" },
  { id: "13-00", time: "1:00 PM" },
  { id: "13-30", time: "1:30 PM" },
  { id: "14-00", time: "2:00 PM" },
  { id: "14-30", time: "2:30 PM" },
  { id: "15-00", time: "3:00 PM" },
  { id: "15-30", time: "3:30 PM" },
  { id: "16-00", time: "4:00 PM" },
  { id: "16-30", time: "4:30 PM" },
];
