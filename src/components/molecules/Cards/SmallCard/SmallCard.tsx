"use client";

import type { SmallCardProps } from "./SmallCard.types";
import { MoveUpRight, Star } from "lucide-react";
import Link from "next/link";
import styles from "./SmallCard.module.css";
import { Chip } from "@/components/atoms";
import star from "@public/icons/misc/star.svg";

export const SmallCard = ({
  image,
  imageAlt,
  title,
  duration,
  price,
  href,
  rating,
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
          {duration && (
            <div className={styles.durationBadge}>
              <span className={styles.durationText}>{duration}</span>
            </div>
          )}
          <div className={styles.cardInfo}>
            {rating && (
              <Chip
                icon={star}
                text={rating.toFixed(1).toString() + " Stars"}
                className={styles.ratingBadge}
              />
            )}
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
