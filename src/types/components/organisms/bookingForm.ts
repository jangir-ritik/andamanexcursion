import { Location } from "../atoms/locationSelect";
import { TimeSlot } from "../atoms/slotSelect";
import { Activity } from "../atoms/activitySelect";
import { PassengerCount } from "../atoms/passengerCounter";

export interface BookingFormProps {
  className?: string;
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
