import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../FerryCard.module.css";
import star from "@public/icons/misc/star.svg";

interface FerryHeaderProps {
  ferryName: string;
  rating: number;
  detailsUrl?: string;
  operator: "sealink" | "makruzz" | "greenocean";
}

// Operator icon mapping - using existing files
const operatorIcons = {
  sealink: "/icons/partners/nautika.svg", // Use nautika for sealink since they're the same company
  makruzz: "/icons/partners/makruzz.svg",
  greenocean: "/icons/partners/greenOcean.svg", // Note the capital O
} as const;

// Fallback to makruzz icon if operator icon not found
const getOperatorIcon = (operator: string): string => {
  return (
    operatorIcons[operator as keyof typeof operatorIcons] ||
    "/icons/partners/makruzz.svg"
  );
};

export const FerryHeader = memo<FerryHeaderProps>(
  ({ ferryName, rating, detailsUrl, operator }) => {
    return (
      <div className={styles.ferryInfo}>
        <div className={styles.logoContainer}>
          <Image
            src={getOperatorIcon(operator)}
            alt={`${operator} logo`}
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
                aria-label={`View details for ${ferryName}`}
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
              {rating} stars
            </span>
          </div>
        </div>
      </div>
    );
  }
);

FerryHeader.displayName = "FerryHeader";
