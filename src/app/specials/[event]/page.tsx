import React from "react";
import { FAQ, LargeCardSection } from "@/components/sectionBlocks/common";
import { Column, Row } from "@/components/layout";
import { Section } from "@/components/layout";
import {
  Button,
  DescriptionText,
  ImageContainer,
  SectionTitle,
} from "@/components/atoms";
import { ExperienceSection } from "./components/ExperienceSection";

import styles from "./page.module.css";
import { content } from "./page.content";

export default async function SpecialsPage() {
  return (
    <main className={styles.main}>
      <Section className={styles.section}>
        <Row
          fullWidth
          gap="var(--space-8)"
          className={styles.contentContainer}
          alignItems="center"
        >
          <Column fullWidth className={styles.titleContainer}>
            <h1 className={styles.highlight}>
              {content.title.text} <br />
              <span className={styles.title}>{content.title.specialWord}</span>
            </h1>
          </Column>
        </Row>
        <Row gap="var(--space-8)" fullWidth>
          <ImageContainer
            src={content.banner.image}
            alt={content.banner.imageAlt}
            aspectRatio="banner"
            priority
            fullWidth
          />
        </Row>
      </Section>

      <Section fullBleed className={styles.waveContainer}>
        <Row
          fullWidth
          gap="var(--space-6)"
          justifyContent="between"
          className={styles.contentContainer}
        >
          <SectionTitle
            className={styles.featureTitle}
            text={content.feature.title}
            specialWord={content.feature.specialWord}
          />
          <Column fullWidth className={styles.imageContainer}>
            <ImageContainer
              src={content.feature.image}
              alt={content.feature.imageAlt}
              aspectRatio="square"
              priority
              fullWidth
              className={styles.image}
            />
          </Column>
          <Column gap={3} alignItems="start">
            <DescriptionText
              text={content.feature.description}
              className={styles.description}
            />
            <Button showArrow href={content.feature.ctaHref}>
              {content.feature.ctaText}
            </Button>
          </Column>
        </Row>
      </Section>

      <ExperienceSection content={content.experience} />

      <FAQ content={content.faq} />

      <LargeCardSection content={content.largeCardSection} />
    </main>
  );
}
