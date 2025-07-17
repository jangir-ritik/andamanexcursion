import type { LargeCardProps } from "./LargeCard.types";
import styles from "./LargeCard.module.css";
import { ImageContainer, InlineLink } from "@/components/atoms";

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
        <ImageContainer
          src={image}
          alt={imageAlt}
          fullWidth
          className={styles.imageContainer}
        />
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
