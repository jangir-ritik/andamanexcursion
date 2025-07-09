export interface TimeSlot {
  id: string;
  time: string;
}

export interface SlotSelectProps {
  value: string;
  onChange: (...event: any[]) => void;
  options: TimeSlot[];
  className?: string;
  hasError?: boolean;
}
