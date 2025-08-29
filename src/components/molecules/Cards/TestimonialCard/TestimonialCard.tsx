import React from "react";
import Image from "next/image";
import styles from "./TestimonialCard.module.css";
import quoteIcon from "@public/icons/misc/quote.svg";
import { Media } from "@payload-types";
import { cn } from "@/utils/cn";
import { ImageContainer } from "@/components/atoms";

// Updated interface to handle both Payload Media and Google Reviews avatar structure
interface TestimonialCardInternalProps {
  text: string;
  author: string;
  avatar: Media | { url: string; alt: string };
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

  // Check if avatar is a simple object with url and alt (Google Reviews format)
  const isSimpleAvatar =
    avatar && typeof avatar === "object" && "url" in avatar && "alt" in avatar;

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
            {isSimpleAvatar ? (
              // Handle Google Reviews avatar format
              <div className={styles.avatar}>
                {avatar.url && (
                  <Image
                    src={avatar.url}
                    alt={avatar.alt}
                    width={48}
                    height={48}
                    className={styles.avatarImage}
                  />
                )}
              </div>
            ) : (
              // Handle Payload CMS Media format
              <ImageContainer
                src={avatar as Media}
                alt={`${author}'s profile picture`}
                aspectRatio="square"
                className={styles.avatar}
              />
            )}
            <span className={styles.authorName}>{author}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
