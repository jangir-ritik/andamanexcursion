export interface FlexProps {
  children: React.ReactNode;
  className?: string;
  gap?: number | string;
  wrap?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  justifyContent?: "start" | "end" | "center" | "between" | "around" | "evenly";
  alignItems?: "start" | "end" | "center" | "baseline" | "stretch";
}

export interface RowProps extends FlexProps {
  children: React.ReactNode;
  className?: string;
  gap?: number | string;
  wrap?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  justifyContent?: "start" | "end" | "center" | "between" | "around" | "evenly";
  alignItems?: "start" | "end" | "center" | "baseline" | "stretch";
}

export interface ColumnProps extends FlexProps {
  children: React.ReactNode;
  className?: string;
  gap?: number | string;
  wrap?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  justifyContent?: "start" | "end" | "center" | "between" | "around" | "evenly";
  alignItems?: "start" | "end" | "center" | "baseline" | "stretch";
  style?: React.CSSProperties;
}

export interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  backgroundColor?: "white" | "light" | "primary" | "secondary";
  spacing?: "small" | "medium" | "large";
  fullWidth?: boolean;
  noPadding?: boolean;
}
export * from "./column";
export * from "./container";
export * from "./row";
export * from "./section";
