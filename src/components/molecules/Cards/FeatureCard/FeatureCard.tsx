"use client";
import React, { memo } from "react";
import styles from "./FeatureCard.module.css";
import { FeatureCardProps } from "./FeatureCard.types";
import Image from "next/image";
import { cn } from "@/utils/cn";

export const FeatureCard = memo<FeatureCardProps>(
  ({ title, description, icon, className, ...props }) => {
    return (
      <article {...props} className={cn(styles.featureCard, className)}>
        <div className={styles.iconContainer} aria-hidden="true">
          <Image src={icon} alt="" width={28} height={28} />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
      </article>
    );
  }
);

FeatureCard.displayName = "FeatureCard";
