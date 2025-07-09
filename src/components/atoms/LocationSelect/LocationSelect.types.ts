export interface Location {
  id: string;
  name: string;
}

export interface LocationSelectProps {
  value: string;
  onChange: (...event: any[]) => void;
  label: string;
  options: Location[];
  className?: string;
  hasError?: boolean;
  placeholder?: string;
}
