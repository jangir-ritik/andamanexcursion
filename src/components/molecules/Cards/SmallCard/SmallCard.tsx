"use client";

import { SmallCardProps } from "./SmallCard.types";
import { MoveUpRight } from "lucide-react";
import Link from "next/link";
import styles from "./SmallCard.module.css";

export const SmallCard = ({
  image,
  imageAlt,
  title,
  duration,
  price,
  href,
}: SmallCardProps) => {
  const CardContent = () => (
    <>
      <div className={styles.imageWrapper}>
        <div
          className={styles.imageContainer}
          style={{ backgroundImage: `url(${image})` }}
          aria-label={imageAlt}
        />
        <div className={styles.imageOverlay} />
        <div className={styles.contentContainer}>
          <div className={styles.durationBadge}>
            <span className={styles.durationText}>{duration}</span>
          </div>
          <div className={styles.cardInfo}>
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardPrice}>{price}</p>
          </div>
        </div>
        <div className={styles.arrowButton} aria-hidden="true">
          <MoveUpRight size={20} color="var(--color-primary)" />
        </div>
      </div>
    </>
  );

  return (
    <div className={styles.cardContainer}>
      {href ? (
        <Link href={href} className={styles.cardLink}>
          <CardContent />
        </Link>
      ) : (
        <CardContent />
      )}
    </div>
  );
};
