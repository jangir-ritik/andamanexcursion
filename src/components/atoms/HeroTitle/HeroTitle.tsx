import React from "react";
import styles from "./HeroTitle.module.css";
import { HeroTitleProps } from "@/types/components/atoms/heroTitle";

export const HeroTitle = ({
  primaryText,
  secondaryText,
  className,
  id,
}: HeroTitleProps) => {
  const titleClasses = [styles.heroTitle, className || ""].join(" ").trim();

  return (
    <div className={titleClasses} id={id} role="heading" aria-level={1}>
      <h1 className={styles.primary}>{primaryText}</h1>
      <h1 className={styles.secondary}>{secondaryText}</h1>
    </div>
  );
};
