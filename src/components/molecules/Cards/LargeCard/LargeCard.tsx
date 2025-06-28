import { LargeCardProps } from "@/types/components/molecules/cards";
import Link from "next/link";
import styles from "./LargeCard.module.css";

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
    <div className={styles.cardContainer}>
      <div
        className={styles.imageContainer}
        style={{ backgroundImage: `url(${image})` }}
        aria-label={imageAlt}
      >
        <div className={styles.imageOverlay} />
      </div>
      <div className={styles.contentContainer}>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <h2 className={styles.cardTitle}>{title}</h2>
        <p className={styles.cardDescription}>{description}</p>
        {ctaText && ctaHref && (
          <Link href={ctaHref} className={styles.ctaLink}>
            {ctaText}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
};
