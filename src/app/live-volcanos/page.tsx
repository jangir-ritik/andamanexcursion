import React from "react";
import styles from "./page.module.css";
import {
  FAQ,
  LargeCardSection,
  Trivia,
} from "@/components/sectionBlocks/common";
import { Column, Row } from "@/components/layout";
import { Section } from "@/components/layout";
import {
  Button,
  DecorativeCurlyArrow,
  DescriptionText,
  ImageContainer,
  SectionTitle,
} from "@/components/atoms";
import { content } from "./page.content";

export default async function LiveVolcanosPage() {
  return (
    <main className={styles.main}>
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
            <h1 className={styles.title}>
              {content.title.text} <br />
              <span className={styles.highlight}>
                {content.title.specialWord}
              </span>
            </h1>
          </Column>
          <Column
            responsive
            responsiveGap="var(--space-4)"
            responsiveAlignItems="center"
          >
            <DescriptionText
              text={content.description.text}
              className={styles.description}
            />
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
          alignItems="start"
          className={styles.contentContainer}
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          <SectionTitle
            className={styles.featureTitle}
            text={content.feature.title}
            specialWord={content.feature.specialWord}
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
              src={content.feature.image}
              alt={content.feature.imageAlt}
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
              text={content.feature.description}
              className={styles.description}
            />
            <Button showArrow href={content.feature.ctaHref}>
              {content.feature.ctaText}
            </Button>
          </Column>
        </Row>
      </Section>

      <Trivia content={content.trivia} />

      <FAQ content={content.faq} />

      <LargeCardSection content={content.largeCardSection} />
    </main>
  );
}
