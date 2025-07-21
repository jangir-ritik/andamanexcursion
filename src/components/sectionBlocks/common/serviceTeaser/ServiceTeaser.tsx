import { Section, Row, Column } from "@/components/layout";
import { DescriptionText, SectionTitle } from "@/components/atoms";
import { DecorativeCurlyArrow, ImageContainer } from "@/components/atoms";
import { Button } from "@/components/atoms";
import React from "react";

import styles from "./ServiceTeaser.module.css";
import { Media } from "@payload-types";

interface ServiceTeaserProps {
  title: string;
  specialWord: string;
  description: string;
  image: Media;
  ctaText: string;
  ctaHref: string;
}

export const ServiceTeaser = ({ content }: { content: ServiceTeaserProps }) => {
  return (
    <Section fullBleed className={styles.waveContainer}>
      <Row
        fullWidth
        gap="var(--space-6)"
        justifyContent="between"
        alignItems="start"
        className={styles.contentContainer}
        responsive
        responsiveGap="var(--space-4)"
        responsiveAlignItems="start"
      >
        <SectionTitle
          className={styles.featureTitle}
          text={content.title}
          specialWord={content.specialWord}
        />
        <DecorativeCurlyArrow
          top="50%"
          left="20%"
          flip
          rotation={210}
          scale={1.5}
        />
        <Column fullWidth className={styles.imageContainer}>
          <ImageContainer
            src={content.image}
            alt={content.image.alt}
            aspectRatio="square"
            priority
            fullWidth
            className={styles.image}
          />
        </Column>
        <Column
          gap={3}
          alignItems="start"
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          <DescriptionText
            text={content.description}
            className={styles.description}
          />
          <Button showArrow href={content.ctaHref}>
            {content.ctaText}
          </Button>
        </Column>
      </Row>
    </Section>
  );
};
