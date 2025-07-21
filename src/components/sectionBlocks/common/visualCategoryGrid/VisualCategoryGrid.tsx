"use client";
import React, { useState } from "react";
import { Container, Row, Section } from "@/components/layout";
import { DescriptionText, SectionTitle } from "@/components/atoms";
import { HoverExpandCard } from "@/components/molecules/Cards/HoverExpandCard/HoverExpandCard";
import styles from "./VisualCategoryGrid.module.css";

interface VisualCategory {
  subtitle: string;
  title: string;
  image: string;
  imageAlt: string;
}

export interface VisualCategoryGridProps {
  title: string;
  specialWord: string;
  description: string;
  categories: VisualCategory[];
}

export const VisualCategoryGrid: React.FC<{
  content: VisualCategoryGridProps;
}> = ({ content }) => {
  const [expandedCardIndex, setExpandedCardIndex] = useState(0);

  const handleCardClick = (index: number) => {
    setExpandedCardIndex(index);
  };

  return (
    <Section className={styles.famousFishes}>
      <Container>
        <Row
          fullWidth
          className={styles.famousFishesTitleContainer}
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          <SectionTitle
            text={content.title}
            specialWord={content.specialWord}
            className={styles.famousFishesTitle}
          />
          <DescriptionText
            text={content.description}
            className={styles.famousFishesDescription}
          />
        </Row>
        <Row
          gap="var(--space-6)"
          className={styles.famousFishesGrid}
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="center"
        >
          {content.categories.map((category, index) => (
            <HoverExpandCard
              key={category.title}
              {...category}
              className={styles.famousFishesCard}
              isExpanded={index === expandedCardIndex}
              onHover={() => handleCardClick(index)}
            />
          ))}
        </Row>
      </Container>
    </Section>
  );
};
