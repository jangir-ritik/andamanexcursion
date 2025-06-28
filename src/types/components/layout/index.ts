import { ReactNode } from "react";

export interface FlexProps {
  children: ReactNode;
  className?: string;
  gap?: number | string;
  wrap?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  justifyContent?: "start" | "end" | "center" | "between" | "around" | "evenly";
  alignItems?: "start" | "end" | "center" | "baseline" | "stretch";
}

export interface RowProps extends FlexProps {}

export interface ColumnProps extends FlexProps {}

export interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  backgroundColor?: "white" | "light" | "primary" | "secondary";
  spacing?: "small" | "medium" | "large";
  fullWidth?: boolean;
  noPadding?: boolean;
}
