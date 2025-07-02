import { ReactNode } from "react";

export interface RowProps {
  children?: ReactNode;
  className?: string;
  gap?: number | string;
  wrap?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  justifyContent?: "start" | "end" | "center" | "between" | "around" | "evenly";
  alignItems?: "start" | "end" | "center" | "baseline" | "stretch";
}
