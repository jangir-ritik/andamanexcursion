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

  // Simple class logic
  const gridClasses = [
    styles.famousFishesGrid,
    expandedCardIndex !== null ? styles.hasExpanded : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Section className={styles.famousFishes}>
      <Container noPadding>
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

        <div className={gridClasses}>
          {content.categories.map((category, index) => (
            <HoverExpandCard
              key={category.title}
              {...category}
              className={`${styles.famousFishesCard} ${
                index === expandedCardIndex ? styles.expanded : ""
              }`}
              isExpanded={index === expandedCardIndex}
              onHover={() => handleCardClick(index)}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
};
