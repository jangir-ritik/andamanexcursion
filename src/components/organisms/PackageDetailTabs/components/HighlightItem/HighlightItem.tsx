import React from "react";
import { IconContainer } from "@/components/atoms/IconContainer/IconContainer";
import checkboxIcon from "@public/icons/misc/checkbox.svg";
import { HighlightItemProps } from "./HighlightItem.types";

import styles from "./HighlightItem.module.css";

export const HighlightItem: React.FC<HighlightItemProps> = ({ text }) => {
  return (
    <div
      role="listitem"
      aria-label={`Highlight: ${text}`}
      className={styles.highlightItem}
    >
      <div className={styles.iconContainer}>
        <IconContainer src={checkboxIcon} size={20} alt="Checkbox" />
      </div>
      <span className={styles.text}>{text}</span>
    </div>
  );
};
