"use client";

import { MediumCardProps } from "@/types/components/molecules/cards";
import { MoveUpRight } from "lucide-react";
import styles from "./MediumCard.module.css";

export const MediumCard = ({
  image,
  imageAlt,
  title,
  description,
  badge,
  badgeIcon,
}: MediumCardProps) => {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.imageWrapper}>
        <div
          className={styles.imageContainer}
          style={{ backgroundImage: `url(${image})` }}
          aria-label={imageAlt}
        />
        <div className={styles.imageOverlay} />
        <div className={styles.contentContainer}>
          {badge && (
            <div className={styles.badge}>
              {badgeIcon && (
                <span className={styles.badgeIcon}>{badgeIcon}</span>
              )}
              <span className={styles.badgeText}>{badge}</span>
            </div>
          )}
          <div className={styles.cardInfo}>
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardDescription}>{description}</p>
          </div>
        </div>
        <div className={styles.arrowButton} aria-hidden="true">
          <MoveUpRight size={20} color="var(--color-primary)" />
        </div>
      </div>
    </div>
  );
};
