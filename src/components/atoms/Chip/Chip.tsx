"use client";
import React, { ReactNode } from "react";
import { IconContainer } from "../IconContainer/IconContainer";
import styles from "./Chip.module.css";

export interface ChipProps {
  icon?: string;
  iconComponent?: ReactNode;
  text: string;
  className?: string;
}

export const Chip = ({
  icon,
  iconComponent,
  text,
  className = "",
}: ChipProps) => {
  return (
    <div className={`${styles.chipContainer} ${className}`}>
      <div className={styles.iconWrapper}>
        {iconComponent ? (
          iconComponent
        ) : icon ? (
          <IconContainer src={icon} alt="" size={20} />
        ) : null}
      </div>
      <span className={styles.chipText}>{text}</span>
    </div>
  );
};
