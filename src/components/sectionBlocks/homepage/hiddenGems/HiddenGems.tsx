import React from "react";
import {
  Button,
  DescriptionText,
  ImageContainer,
  SectionTitle,
} from "@/components/atoms";
import { HiddenGemsProps } from "./HiddenGems.types";
import Link from "next/link";
import { Column, Row, Section } from "@/components/layout";
import styles from "./HiddenGems.module.css";
import DecorativeCurlyArrow from "@/components/atoms/DecorativeCurlyArrow/DecorativeCurlyArrow";

export const HiddenGems = ({ content }: HiddenGemsProps) => {
  const { title, specialWord, description, ctaText, ctaHref, images } = content;

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
        <Column
          gap="var(--space-8)"
          alignItems="start"
          className={styles.column}
        >
          <SectionTitle
            text={title}
            specialWord={specialWord}
            className={styles.sectionTitle}
            id="hidden-gems-title"
          />
          <DecorativeCurlyArrow top="20%" left="75%" />
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
