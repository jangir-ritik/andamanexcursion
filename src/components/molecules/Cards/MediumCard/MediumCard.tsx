"use client";

import type { MediumCardProps  } from "./MediumCard.types";
import { MoveUpRight } from "lucide-react";
import styles from "./MediumCard.module.css";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

export const MediumCard = ({
  image,
  imageAlt,
  title,
  description,
  badge,
  badgeIcon,
  href,
  className,
}: MediumCardProps) => {
  const CardContent = () => (
    <>
      <div className={styles.imageWrapper}>
        <div className={styles.imageContainer}>
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={styles.imageOverlay} aria-hidden="true" />
        <div className={styles.contentContainer}>
          {badge && (
            <div className={styles.badge} aria-label={`${badge} adventure`}>
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
    </>
  );

  return (
    <div className={clsx(styles.cardContainer, className)}>
      {href ? (
        <Link
          href={href}
          className={styles.cardLink}
          aria-label={`${title} - ${description}`}
        >
          <CardContent />
        </Link>
      ) : (
        <CardContent />
      )}
    </div>
  );
};
