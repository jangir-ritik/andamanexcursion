import { LargeCardProps } from "@/types/components/molecules/cards";
import Link from "next/link";
import styles from "./LargeCard.module.css";
import { ArrowUpRight } from "lucide-react";

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
      <div className={styles.imageWrapper}>
        <div
          className={styles.imageContainer}
          style={{ backgroundImage: `url(${image})` }}
          aria-label={imageAlt}
        />
        <div className={styles.contentContainer}>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <h2 className={styles.cardTitle}>{title}</h2>
          {description && (
            <p className={styles.cardDescription}>{description}</p>
          )}
          {ctaText && ctaHref && (
            <Link href={ctaHref} className={styles.ctaLink}>
              {ctaText}
              <ArrowUpRight />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
