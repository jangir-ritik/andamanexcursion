import { LargeCardProps } from "./LargeCard.types";
import styles from "./LargeCard.module.css";
import Image from "next/image";
import { InlineLink } from "@/components/atoms/InlineLink/InlineLink";

export const LargeCard = ({
  image,
  imageAlt,
  title,
  subtitle,
  description,
  ctaText,
  ctaHref,
}: LargeCardProps) => {
  return (
    <div
      className={styles.cardContainer}
      role="region"
      aria-label={subtitle || title}
    >
      <div className={styles.imageWrapper}>
        <div className={styles.imageContainer}>
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="100vw"
            priority
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={styles.contentContainer}>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <h2 className={styles.cardTitle}>{title}</h2>
          {description && (
            <p className={styles.cardDescription}>{description}</p>
          )}
          {ctaText && ctaHref && (
            <InlineLink
              href={ctaHref}
              ariaLabel={`${ctaText} about ${title}`}
              icon="arrow-up-right"
              color="white"
              className={styles.ctaLink}
            >
              {ctaText}
            </InlineLink>
          )}
        </div>
      </div>
    </div>
  );
};
