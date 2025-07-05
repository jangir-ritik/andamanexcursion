import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../FerryCard.module.css";
import star from "@public/icons/misc/star.svg";
import { ferryCardContent } from "../FerryCard.content";

interface FerryHeaderProps {
  ferryName: string;
  rating: number;
  detailsUrl?: string;
}

export const FerryHeader = memo<FerryHeaderProps>(
  ({ ferryName, rating, detailsUrl }) => {
    return (
      <div className={styles.ferryInfo}>
        <div className={styles.logoContainer}>
          <Image
            src="/icons/partners/makruzz.svg"
            alt={`${ferryName} logo`}
            width={48}
            height={48}
            className={styles.ferryLogo}
          />
        </div>
        <div className={styles.ferryDetails}>
          <h3 className={styles.ferryName}>
            {detailsUrl ? (
              <Link
                href={detailsUrl}
                className={styles.ferryNameLink}
                onClick={(e) => e.stopPropagation()}
                aria-label={`${ferryCardContent.aria.viewDetails} ${ferryName}`}
              >
                {ferryName}
              </Link>
            ) : (
              ferryName
            )}
          </h3>
          <div className={styles.ratingContainer}>
            <div className={styles.starIcon}>
              <Image src={star} alt="star" width={16} height={16} />
            </div>
            <span
              className={styles.ratingText}
              aria-label={`${rating} out of 5 stars`}
            >
              {rating} {ferryCardContent.stars}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

FerryHeader.displayName = "FerryHeader";
