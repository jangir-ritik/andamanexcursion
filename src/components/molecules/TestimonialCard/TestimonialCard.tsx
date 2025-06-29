import React from "react";
import Image from "next/image";
import styles from "./TestimonialCard.module.css";
import quoteIcon from "@public/icons/misc/quote.svg";

interface TestimonialCardProps {
  text: string;
  author: string;
  avatar: string;
  rotation?: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
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
    >
      <div
        className={styles.cardContent}
        // style={{ transform: `rotate(${rotation * -1}deg)` }}
      >
        <div className={styles.testimonialText}>
          <div className={styles.quoteIconWrapper}>
            <Image src={quoteIcon} alt="quote" width={29.5} height={25} />
          </div>
          <p className={styles.text}>{text}</p>
        </div>
        <div className={styles.authorSection}>
          <div className={styles.divider} />
          <div className={styles.authorInfo}>
            <div className={styles.avatar}>
              <Image
                src={avatar}
                alt={author}
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
