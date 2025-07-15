"use client";
import React, { useState } from "react";
import { Container, Row, Section } from "@/components/layout";
import { DescriptionText, SectionTitle } from "@/components/atoms";
import { HoverExpandCard } from "@/components/molecules/Cards/HoverExpandCard/HoverExpandCard";
import styles from "../page.module.css";

interface ExploreActivity {
  subtitle: string;
  title: string;
  image: string;
  imageAlt: string;
}

export interface ExploreSectionContent {
  title: string;
  specialWord: string;
  description: string;
  activities: ExploreActivity[];
}

export const ExploreSection: React.FC<{
  content: ExploreSectionContent;
}> = ({ content }) => {
  const [expandedCardIndex, setExpandedCardIndex] = useState(0);

  const handleCardClick = (index: number) => {
    setExpandedCardIndex(index);
  };

  return (
    <Section className={styles.exploreSection}>
      <Container>
        <Row fullWidth className={styles.exploreTitleContainer}>
          <SectionTitle
            text={content.title}
            specialWord={content.specialWord}
            className={styles.exploreTitle}
          />
          <DescriptionText
            text={content.description}
            className={styles.exploreDescription}
          />
        </Row>
        <Row gap="var(--space-6)" className={styles.exploreGrid}>
          {content.activities.map((activity, index) => (
            <HoverExpandCard
              key={activity.title}
              {...activity}
              className={styles.exploreCard}
              isExpanded={index === expandedCardIndex}
              onHover={() => handleCardClick(index)}
            />
          ))}
        </Row>
      </Container>
    </Section>
  );
};
