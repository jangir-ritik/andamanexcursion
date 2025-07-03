"use client";

import type { PackageCardProps  } from "./PackageCard.types";
import styles from "./PackageCard.module.css";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { InlineLink } from "@/components/atoms/InlineLink/InlineLink";

export const PackageCard = ({
  title,
  description,
  images,
  href,
  className,
}: PackageCardProps) => {
  const CardContent = ({ isWrappedInLink = false }) => (
    <div className={styles.contentContainer}>
      <div className={styles.headerContainer}>
        <h2 className={styles.title}>{title}</h2>
        {href && !isWrappedInLink && (
          <div className={styles.viewDetailsContainer}>
            <InlineLink
              href={href}
              icon="arrow-right"
              iconSize={24}
              color="primary"
              ariaLabel={`View details for ${title}`}
            >
              View Details
            </InlineLink>
          </div>
        )}
        {href && isWrappedInLink && (
          <div className={styles.viewDetailsContainer}>
            <span className={styles.viewDetailsText}>View Details</span>
          </div>
        )}
      </div>
      <div className={styles.divider} />
      <p className={styles.description}>{description}</p>
      <div className={styles.imagesContainer}>
        {images.map((image, index) => {
          // Make the middle image larger
          const isMiddleImage = index === 1 && images.length >= 3;
          const WrapperComponent = isMiddleImage
            ? styles.largeImageWrapper
            : styles.smallImageWrapper;

          return (
            <div key={index} className={WrapperComponent}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={
                  isMiddleImage
                    ? "(max-width: 768px) 100vw, 576px"
                    : "(max-width: 768px) 100vw, 251px"
                }
                className={styles.image}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  const cardClasses = clsx(styles.packageCard, className, {
    [styles.interactive]: href !== undefined,
  });

  return href ? (
    <div className={cardClasses}>
      <Link
        href={href}
        className={styles.cardLink}
        aria-label={`${title} - View package details`}
      >
        <CardContent isWrappedInLink={true} />
      </Link>
    </div>
  ) : (
    <div className={cardClasses}>
      <CardContent />
    </div>
  );
};
