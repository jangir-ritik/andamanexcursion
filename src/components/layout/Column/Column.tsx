import React from "react";
import styles from "./Column.module.css";
import { ColumnProps } from "@/types/components/layout";

export const Column = ({
  children,
  className,
  gap,
  wrap = false,
  fullWidth = false,
  fullHeight = false,
  justifyContent,
  alignItems,
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

  const style =
    gap !== undefined
      ? { gap: typeof gap === "number" ? `${gap * 8}px` : gap }
      : {};

  return (
    <div className={columnClasses} style={style}>
      {children}
    </div>
  );
};
