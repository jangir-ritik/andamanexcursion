export interface Activity {
  id: string;
  name: string;
}

export interface ActivitySelectProps {
  value: string;
  onChange: (...event: any[]) => void;
  options: Activity[];
  className?: string;
  hasError?: boolean;
}
