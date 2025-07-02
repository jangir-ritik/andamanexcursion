import React from "react";
import styles from "./ExcludeItem.module.css";
import { Circle } from "lucide-react";
import { ExcludeItemProps } from "@/types/components/atoms/ExcludeItem";

export const ExcludeItem: React.FC<ExcludeItemProps> = ({ text }) => {
  return (
    <div
      role="listitem"
      aria-label={`Exclude: ${text}`}
      className={styles.excludeItem}
    >
      <div className={styles.iconContainer}>
        <Circle
          size={12}
          fill="var(--color-exclude-circle)"
          color="var(--color-exclude-circle)"
        />
      </div>
      <span className={styles.text}>{text}</span>
    </div>
  );
};
