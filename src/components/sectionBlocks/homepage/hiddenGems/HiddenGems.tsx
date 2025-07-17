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
import { cn } from "@/utils/cn";

export const HiddenGems = ({ content }: HiddenGemsProps) => {
  const { title, specialWord, description, ctaText, ctaHref, images } = content;

  return (
    <Section
      backgroundColor="light"
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
        responsive
        responsiveAlignItems="start"
        responsiveGap="var(--space-4)"
      >
        <Column
          gap="var(--space-8)"
          alignItems="start"
          className={styles.column}
          responsive
          responsiveAlignItems="start"
          responsiveGap="var(--space-4)"
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
          {images.map((image, index) => (
            <ImageContainer
              key={index}
              src={image.image}
              alt={image.alt}
              className={cn(styles.gridImage, styles[`gridImage${index + 1}`])}
              fullWidth
              priority
            />
          ))}
        </div>
      </Row>
    </Section>
  );
};
