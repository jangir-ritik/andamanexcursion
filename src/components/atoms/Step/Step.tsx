import React from "react";
import Image from "next/image";
import styles from "./Step.module.css";

interface StepProps {
  title: string;
  description: string;
  icon: string;
  position?: "top" | "bottom";
}

export const Step: React.FC<StepProps> = ({
  title,
  description,
  icon,
  position = "top",
}) => {
  return (
    <div
      aria-label={`Step ${title}`}
      className={`${styles.step} ${styles[position]}`}
    >
      <div className={styles.iconContainer}>
        <Image
          aria-hidden="true"
          src={icon}
          alt={title}
          width={40}
          height={40}
          className={styles.icon}
        />
      </div>
      <div aria-hidden="true" className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
};
