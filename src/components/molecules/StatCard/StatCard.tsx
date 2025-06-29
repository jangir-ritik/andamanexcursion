"use client";

import React from "react";
import UsersIcon from "@icons/misc/users.svg";
import FerryIcon from "@icons/misc/ferry.svg";
import IslandIcon from "@icons/misc/island.svg";
import styles from "./StatCard.module.css";
import Image from "next/image";

export interface StatCardProps {
  value: string;
  description: string;
  icon: "users" | "ferry" | "island";
}

const iconMap = {
  users: { src: UsersIcon, alt: "Users icon" },
  ferry: { src: FerryIcon, alt: "Ferry icon" },
  island: { src: IslandIcon, alt: "Island icon" },
} as const;

export const StatCard = ({ value, description, icon }: StatCardProps) => {
  const iconData = iconMap[icon];

  return (
    <div
      className={styles.statCard}
      role="group"
      aria-label={`${value} ${description}`}
    >
      <div className={styles.content}>
        <div className={styles.value} aria-label={`Value: ${value}`}>
          {value}
        </div>
        <div className={styles.descriptionWrapper}>
          <span className={styles.icon} aria-hidden="true">
            <Image
              src={iconData.src}
              alt={iconData.alt}
              width={20}
              height={20}
            />
          </span>
          <span className={styles.description}>{description}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
