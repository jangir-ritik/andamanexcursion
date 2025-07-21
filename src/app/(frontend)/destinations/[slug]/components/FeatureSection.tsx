import React from "react";
import { Column, Row, Section } from "@/components/layout";
import {
  Button,
  DecorativeCurlyArrow,
  DescriptionText,
  ImageContainer,
  SectionTitle,
} from "@/components/atoms";
import styles from "../page.module.css";

interface FeatureSectionProps {
  title: string;
  specialWord: string;
  description: string;
  image: string;
  imageAlt: string;
  ctaText: string;
  ctaHref?: string;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  specialWord,
  description,
  image,
  imageAlt,
  ctaText,
  ctaHref,
}) => {
  return (
    <Section fullBleed className={styles.waveContainer}>
      <Row fullWidth gap="var(--space-8)" className={styles.contentContainer}>
        <Column
          fullWidth
          gap="var(--space-8)"
          className={styles.content}
          alignItems="start"
        >
          <SectionTitle text={title} specialWord={specialWord} />
          <DecorativeCurlyArrow top="30%" left="40%" scale={1.5} />
          <DescriptionText text={description} className={styles.description} />
          <Button showArrow href={ctaHref}>
            {ctaText}
          </Button>
        </Column>
        <Column fullWidth className={styles.imageContainer}>
          <ImageContainer
            src={image}
            alt={imageAlt}
            aspectRatio="video"
            priority
            fullWidth
            className={styles.image}
          />
        </Column>
      </Row>
    </Section>
  );
};
