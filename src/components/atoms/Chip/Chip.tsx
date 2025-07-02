"use client";

import React from "react";
import Image from "next/image";
import styles from "./Chip.module.css";
import { ChipProps } from "./Chip.types";

export const Chip = ({ icon, text, className = "" }: ChipProps) => {
  return (
    <div className={`${styles.chipContainer} ${className}`}>
      <div className={styles.iconWrapper}>
        <Image src={icon} alt="" width={20} height={20} />
      </div>
      <span className={styles.chipText}>{text}</span>
    </div>
  );
};

export default Chip;
