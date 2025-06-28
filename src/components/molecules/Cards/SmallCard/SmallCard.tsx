import { SmallCardProps } from "@/types/components/molecules/cards";
import styles from "./SmallCard.module.css";

export const SmallCard = ({
  image,
  imageAlt,
  title,
  duration,
  price,
}: SmallCardProps) => {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.imageWrapper}>
        <div
          className={styles.imageContainer}
          style={{ backgroundImage: `url(${image})` }}
          aria-label={imageAlt}
        />
        <div className={styles.imageOverlay} />
        <div className={styles.contentContainer}>
          <div className={styles.durationBadge}>
            <span className={styles.durationText}>{duration}</span>
          </div>
          <div className={styles.cardInfo}>
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardPrice}>{price}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
