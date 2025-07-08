"use client";
import React, { useState } from "react";
import { Container, Row, Section } from "@/components/layout";
import { DescriptionText, SectionTitle } from "@/components/atoms";
import { HoverExpandCard } from "@/components/molecules/Cards/HoverExpandCard/HoverExpandCard";
import styles from "../page.module.css";

interface FamousFish {
  subtitle: string;
  title: string;
  image: string;
  imageAlt: string;
}

export interface FamousFishesProps {
  title: string;
  specialWord: string;
  description: string;
  fishes: FamousFish[];
}

export const FamousFishes: React.FC<{ content: FamousFishesProps }> = ({
  content,
}) => {
  const [expandedCardIndex, setExpandedCardIndex] = useState(0);

  const handleCardClick = (index: number) => {
    setExpandedCardIndex(index);
  };

  return (
    <Section className={styles.famousFishes}>
      <Container>
        <Row fullWidth className={styles.famousFishesTitleContainer}>
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
        <Row gap="var(--space-6)" className={styles.famousFishesGrid}>
          {content.fishes.map((fish, index) => (
            <HoverExpandCard
              key={fish.title}
              {...fish}
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
