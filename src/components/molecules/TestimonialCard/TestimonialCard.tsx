import React from "react";
import Image from "next/image";
import styles from "./TestimonialCard.module.css";
import quoteIcon from "@public/icons/misc/quote.svg";
import { TestimonialCardProps } from "./TestimonialCard.types";

interface TestimonialCardInternalProps {
  text: string;
  author: string;
  avatar: string;
  rotation?: number;
}

const TestimonialCard: React.FC<TestimonialCardInternalProps> = ({
  text,
  author,
  avatar,
  rotation = 0,
}) => {
  // Determine rotation class
  const getRotationClass = () => {
    if (rotation < 0) return styles.rotateNegative;
    if (rotation > 0) return styles.rotatePositive;
    return "";
  };

  return (
    <div
      className={`${styles.card} ${getRotationClass()}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      role="article"
      aria-label={`Testimonial from ${author}`}
    >
      <div className={styles.cardContent}>
        <div className={styles.testimonialText}>
          <div className={styles.quoteIconWrapper} aria-hidden="true">
            <Image src={quoteIcon} alt="" width={29.5} height={25} />
          </div>
          <p className={styles.text}>{text}</p>
        </div>
        <div className={styles.authorSection}>
          <div className={styles.divider} aria-hidden="true" />
          <div className={styles.authorInfo}>
            <div className={styles.avatar}>
              <Image
                src={avatar}
                alt={`${author}'s profile picture`}
                width={36}
                height={36}
                style={{ objectFit: "cover" }}
              />
            </div>
            <span className={styles.authorName}>{author}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
