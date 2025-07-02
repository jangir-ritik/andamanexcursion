import React from "react";
import styles from "./Row.module.css";
import { RowProps } from "./Row.types";

export const Row = ({
  children,
  className,
  gap,
  wrap = false,
  fullWidth = false,
  fullHeight = false,
  justifyContent,
  alignItems,
}: RowProps) => {
  const rowClasses = [
    styles.row,
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

  const style =
    gap !== undefined
      ? { gap: typeof gap === "number" ? `${gap * 8}px` : gap }
      : {};

  return (
    <div className={rowClasses} style={style}>
      {children}
    </div>
  );
};
