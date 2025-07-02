export interface Activity {
  id: string;
  name: string;
}

export interface ActivitySelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Activity[];
  className?: string;
  label?: string;
}
