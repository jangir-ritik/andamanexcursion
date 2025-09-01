"use client";
import React, { memo } from "react";
import styles from "./FeatureCard.module.css";
import { FeatureCardProps } from "./FeatureCard.types";
import { cn } from "@/utils/cn";
import { IconContainer } from "@/components/atoms/IconContainer/IconContainer";

export const FeatureCard = memo<FeatureCardProps>(
  ({ title, description, icon, className, ...props }) => {
    return (
      <article {...props} className={cn(styles.featureCard, className)}>
        <div className={styles.iconContainer} aria-hidden="true">
          <IconContainer src={icon.url || ""} alt={icon.alt || ""} size={20} />
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
