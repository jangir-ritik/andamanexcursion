export interface Location {
  id: string;
  name: string;
}

export interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: Location[];
  className?: string;
}
