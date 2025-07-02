export interface DateSelectProps {
  selected: Date;
  onChange: (date: Date | null) => void;
  className?: string;
}
