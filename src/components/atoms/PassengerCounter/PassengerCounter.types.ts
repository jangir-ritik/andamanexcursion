export interface PassengerCount {
  adults: number;
  infants: number;
  children?: number;
}

export interface PassengerCounterProps {
  value: PassengerCount;
  onChange: (type: keyof PassengerCount, value: number) => void;
  className?: string;
  hasError?: boolean;
}
