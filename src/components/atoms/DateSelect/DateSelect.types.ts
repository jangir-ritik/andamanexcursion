export interface DateSelectProps {
  selected: Date | string | number | null;
  onChange: (date: Date) => void;
  className?: string;
  hasError?: boolean;
  label?: string;
}
