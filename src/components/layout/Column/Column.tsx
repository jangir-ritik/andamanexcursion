import React from "react";
import styles from "./Column.module.css";
import { ColumnProps } from "@/types";

export const Column = ({
  children,
  className,
  gap,
  wrap = false,
  fullWidth = false,
  fullHeight = false,
  justifyContent,
  alignItems,
  style = {},
  role,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
}: ColumnProps) => {
  const columnClasses = [
    styles.column,
    wrap && styles.wrap,
    fullWidth && styles.fullWidth,
    fullHeight && styles.fullHeight,
    justifyContent && styles[`justify-${justifyContent}`],
    alignItems && styles[`align-${alignItems}`],
    className || "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  // Merge gap style with any custom styles
  const combinedStyle = {
    ...(gap !== undefined
      ? { gap: typeof gap === "number" ? `${gap * 8}px` : gap }
      : {}),
    ...style,
  };

  return (
    <div
      className={columnClasses}
      style={combinedStyle}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      {children}
    </div>
  );
};
