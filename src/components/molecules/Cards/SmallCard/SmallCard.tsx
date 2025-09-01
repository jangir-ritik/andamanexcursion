"use client";

import type { SmallCardProps } from "./SmallCard.types";
import { MoveUpRight } from "lucide-react";
import Link from "next/link";
import styles from "./SmallCard.module.css";
import { Chip } from "@/components/atoms";
// import star from "@public/icons/misc/star.svg";
// import heart from "@public/icons/misc/heart.svg";
import { cn } from "@/utils/cn";
import { Media } from "@payload-types";
import MediaContainer from "@/components/atoms/MediaContainer/MediaContainer";

const star = "/icons/misc/star.svg";
const heart = "/icons/misc/heart.svg";

export const SmallCard = ({
  image,
  imageAlt,
  title,
  duration,
  price,
  description,
  href,
  rating,
  priority = false,
}: SmallCardProps) => {
  const CardContent = () => (
    <>
      <div className={styles.imageWrapper}>
        <MediaContainer
          src={image}
          alt={imageAlt || title}
          className={styles.cardImage}
          aspectRatio="auto"
          objectFit="cover"
          priority={priority}
        />
        <div className={styles.imageOverlay} />
        <div
          className={cn(
            styles.contentContainer,
            description && styles.contentContainerWithDescription
          )}
        >
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
            {description && (
              <Chip
                icon={heart}
                text={"Customer's Favourite"}
                className={styles.favouriteBadge}
              />
            )}
            <h3 className={styles.cardTitle}>{title}</h3>
            {description && (
              <p className={styles.cardDescription}>{description}</p>
            )}
            {price && (
              <p className={styles.cardPrice}>
                ₹{typeof price === "number" ? price.toLocaleString() : price}
              </p>
            )}
          </div>
        </div>
        <div
          className={cn(
            styles.arrowButton,
            description && styles.arrowButtonWithDescription
          )}
          aria-hidden="true"
        >
          <MoveUpRight size={20} color="var(--color-primary)" />
        </div>
      </div>
    </>
  );

  return (
    <div
      className={cn(
        styles.cardContainer,
        description && styles.cardContainerWithDescription
      )}
    >
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
