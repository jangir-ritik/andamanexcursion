import React from "react";
import { ImageContainer } from "@/components/atoms/ImageContainer/ImageContainer";
import { InlineLink } from "@/components/atoms/InlineLink";
import { FeaturePackageCardProps } from "@/types/components/molecules/cards";
import clsx from "clsx";

import styles from "./FeaturePackageCard.module.css";

export const FeaturePackageCard: React.FC<FeaturePackageCardProps> = ({
  title,
  description,
  price,
  location,
  duration,
  image,
  href,
  className,
}) => {
  return (
    <div
      className={clsx(styles.card, className)}
      role="article"
      aria-label={`Package: ${title}`}
    >
      <div className={styles.contentWrapper}>
        <ImageContainer
          src={image}
          alt={`${title} package image`}
          className={styles.imageWrapper}
        />
        <div className={styles.textContent}>
          <div className={styles.titleWrapper}>
            <div className={styles.titleInfo}>
              <h3 className={styles.title}>{title}</h3>
              <p
                className={styles.price}
                aria-label={`Price: ${price} rupees per adult`}
              >
                ₹{price}/adult
              </p>
            </div>
            <div className={styles.locationInfo}>
              <span className={styles.location}>{location}</span>
              <span className={styles.duration}>. {duration}</span>
            </div>
          </div>
          <p className={styles.description}>{description}</p>
          <InlineLink
            href={href}
            aria-label={`View details for ${title} package`}
          >
            View Details
          </InlineLink>
        </div>
      </div>
    </div>
  );
};
