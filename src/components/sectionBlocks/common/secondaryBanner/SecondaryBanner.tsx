import { DescriptionText, ImageContainer } from "@/components/atoms";
import { Column, Row, Section } from "@/components/layout";
import React from "react";
import styles from "./SecondaryBanner.module.css";
import { Media } from "@payload-types";

interface SecondaryBannerProps {
  title: string;
  subtitle: string;
  description: string;
  image: Media;
}

export const SecondaryBanner = ({
  content,
}: {
  content: SecondaryBannerProps;
}) => {
  const hasDescription = content.description;

  return (
    <Section className={styles.section}>
      <Row
        fullWidth
        gap="var(--space-8)"
        className={styles.contentContainer}
        alignItems="center"
        responsive
        responsiveGap="var(--space-4)"
        responsiveAlignItems="center"
      >
        <Column fullWidth className={styles.titleContainer}>
          <h1 className={hasDescription ? styles.title : styles.highlight}>
            {content.title} <br />
            <span className={hasDescription ? styles.highlight : styles.title}>
              {content.subtitle}
            </span>
          </h1>
        </Column>

        {hasDescription && (
          <Column
            responsive
            responsiveGap="var(--space-4)"
            responsiveAlignItems="center"
          >
            <DescriptionText
              text={content.description}
              className={styles.description}
            />
          </Column>
        )}
      </Row>

      <Row gap="var(--space-8)" fullWidth>
        <ImageContainer
          src={content.image}
          alt={content.image.alt}
          aspectRatio="banner"
          priority
          fullWidth
        />
      </Row>
    </Section>
  );
};
