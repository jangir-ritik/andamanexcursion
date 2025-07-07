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
  DescriptionText,
  ImageContainer,
  SectionTitle,
} from "@/components/atoms";
import { content } from "./page.content";

export default async function LiveVolcanosPage() {
  return (
    <main className={styles.main}>
      <Section className={styles.section}>
        <Row fullWidth gap="var(--space-8)" className={styles.contentContainer}>
          <Column fullWidth className={styles.titleContainer}>
            <h1 className={styles.title}>
              Witness India's only <br />
              <span className={styles.highlight}>Active Volcano</span>
            </h1>
          </Column>
          <Column>
            <DescriptionText
              text={
                "See smoke rise, feel the thrill, and witness raw nature in action."
              }
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
        <Row fullWidth gap="var(--space-8)" className={styles.contentContainer}>
          <Column
            fullWidth
            gap="var(--space-8)"
            className={styles.content}
            alignItems="start"
          >
            <SectionTitle
              text={content.feature.title}
              specialWord={content.feature.specialWord}
            />
            <DescriptionText
              text={content.feature.description}
              className={styles.description}
            />
            <Button showArrow href={content.feature.ctaHref}>
              {content.feature.ctaText}
            </Button>
          </Column>
          <Column fullWidth className={styles.imageContainer}>
            <ImageContainer
              src={content.feature.image}
              alt={content.feature.imageAlt}
              aspectRatio="video"
              priority
              fullWidth
              className={styles.image}
            />
          </Column>
        </Row>
      </Section>

      <Trivia
        title={content.trivia.title}
        text={content.trivia.text}
        highlightedPhrases={content.trivia.highlightedPhrases}
      />

      <FAQ
        title={content.faq.title}
        specialWord={content.faq.specialWord}
        items={content.faq.items}
      />

      <LargeCardSection
        title={content.largeCardSection.title}
        subtitle={content.largeCardSection.subtitle}
        image={content.largeCardSection.image}
        imageAlt={content.largeCardSection.imageAlt}
        ctaText={content.largeCardSection.ctaText}
        ctaHref={content.largeCardSection.ctaHref}
      />
    </main>
  );
}
