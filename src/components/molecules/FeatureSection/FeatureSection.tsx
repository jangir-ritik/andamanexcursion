import React from "react";
import { Section } from "@/components/layout";
import {
  Button,
  DecorativeCurlyArrow,
  DescriptionText,
  ImageContainer,
  SectionTitle,
} from "@/components/atoms";
import styles from "./FeatureSection.module.css";
import { Media } from "@payload-types";

export interface FeatureSectionContent {
  title: string;
  specialWord: string;
  description: string;
  image: Media;
  imageAlt: string;
  ctaText: string;
  ctaHref?: string;
}

interface FeatureSectionProps {
  content: FeatureSectionContent;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({ content }) => {
  const { title, specialWord, description, image, imageAlt, ctaText, ctaHref } =
    content;

  return (
    <Section fullBleed className={styles.waveContainer}>
      <div className={styles.contentContainer}>
        <div className={styles.textContent}>
          <SectionTitle text={title} specialWord={specialWord} />
          <DecorativeCurlyArrow top="5%" left="75%" scale={1.5} />
          <DescriptionText text={description} className={styles.description} />
          <Button showArrow href={ctaHref}>
            {ctaText}
          </Button>
        </div>
        <div className={styles.imageContainer}>
          <ImageContainer
            src={image}
            alt={imageAlt}
            aspectRatio="video"
            priority
            fullWidth
            className={styles.image}
          />
        </div>
      </div>
    </Section>
  );
};
