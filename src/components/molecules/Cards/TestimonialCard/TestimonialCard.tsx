import React from "react";
import Image from "next/image";
import styles from "./TestimonialCard.module.css";
import quoteIcon from "@public/icons/misc/quote.svg";
import { Media } from "@payload-types";
import { cn } from "@/utils/cn";
import { ImageContainer } from "@/components/atoms";

interface TestimonialCardInternalProps {
  text: string;
  author: string;
  avatar: Media;
  rotation?: number;
}

export const TestimonialCard: React.FC<TestimonialCardInternalProps> = ({
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
      className={cn(styles.card, getRotationClass())}
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
            <ImageContainer
              src={avatar}
              alt={`${author}'s profile picture`}
              aspectRatio="square"
              className={styles.avatar}
            />
            <span className={styles.authorName}>{author}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
