export interface PassengerCount {
  adults: number;
  infants: number;
  children: number; // Might need to remove this field
}

export interface PassengerCounterProps {
  value: PassengerCount;
  onChange: (type: keyof PassengerCount, value: number) => void;
  className?: string;
}
