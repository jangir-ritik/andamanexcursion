import { ReactNode, CSSProperties } from "react";

export interface ColumnProps {
  className?: string;
  children?: ReactNode;
  gap?: number | string;
  wrap?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly";
  alignItems?: "start" | "center" | "end" | "stretch" | "baseline";
  style?: CSSProperties;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}
