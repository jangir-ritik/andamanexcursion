
import React from "react";
import styles from "./HiddenGems.module.css"; 
import { Button, DescriptionText, ImageContainer, SectionTitle } from "@/components/atoms";
import { hiddenGemsContent } from "./HiddenGems.content";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { Column, Row, Section } from "@/components/layout";

export const HiddenGems = () => {
  const { title, specialWord, description, ctaText, ctaHref, images } =
    hiddenGemsContent;

  return (
    <Section
      backgroundColor="light"
      spacing="5"
      fullBleed
      className={styles.hiddenGemsSection}
      id="hidden-gems"
      aria-labelledby="hidden-gems-title"
    >
      <Row
        justifyContent="between"
        fullWidth
        className={styles.hiddenGemsRow}
        gap="var(--space-20)"
      >
        <Column gap="var(--space-8)" alignItems="start">
          <SectionTitle
            text={title}
            specialWord={specialWord}
            className={styles.sectionTitle}
            id="hidden-gems-title"
          />
          <DescriptionText text={description} />
          <Link href={ctaHref}>
            <Button showArrow>{ctaText}</Button>
          </Link>
        </Column>
        <div className={styles.imagesGrid}>
          <ImageContainer
            src={images.island1.src}
            alt={images.island1.alt}
            className={styles.gridImage1}
            fullWidth
            priority
          />
          <ImageContainer
            src={images.island2.src}
            alt={images.island2.alt}
            className={styles.gridImage2}
            fullWidth
          />
          <ImageContainer
            src={images.island3.src}
            alt={images.island3.alt}
            className={styles.gridImage3}
            fullWidth
          />
        </div>
      </Row>
    </Section>
  );
};
