"use client";
import React, { ReactNode } from "react";
import Image from "next/image";
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
          <Image src={icon} alt="" width={20} height={20} />
        ) : null}
      </div>
      <span className={styles.chipText}>{text}</span>
    </div>
  );
};
