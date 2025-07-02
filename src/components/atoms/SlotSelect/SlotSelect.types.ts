export interface TimeSlot {
  id: string;
  time: string;
}

export interface SlotSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: TimeSlot[];
  className?: string;
}
