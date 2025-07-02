import React from "react";
import Image from "next/image";
import checkboxIcon from "@public/icons/misc/checkbox.svg";
import { HighlightItemProps } from "@/types/components/atoms/HighlightItem";

import styles from "./HighlightItem.module.css";

export const HighlightItem: React.FC<HighlightItemProps> = ({ text }) => {
  return (
    <div
      role="listitem"
      aria-label={`Highlight: ${text}`}
      className={styles.highlightItem}
    >
      <div className={styles.iconContainer}>
        <Image src={checkboxIcon} width={20} height={20} alt="Checkbox" />
      </div>
      <span className={styles.text}>{text}</span>
    </div>
  );
};
