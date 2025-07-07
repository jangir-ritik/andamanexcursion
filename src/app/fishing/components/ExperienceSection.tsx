import React from "react";
import { Container, Row, Section } from "@/components/layout";
import { DescriptionText, SectionTitle } from "@/components/atoms";
import { FeatureCard } from "@/components/molecules/Cards/FeatureCard/FeatureCard";
import styles from "../page.module.css";
import Image from "next/image";
import stepsWave from "@public/graphics/stepsWave.svg";
import { content } from "../page.content";

interface HowToReachCard {
  title: string;
  description: string;
  icon: string;
}

interface ExperienceSectionProps {
  cards: HowToReachCard[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  cards,
}) => {
  return (
    <Section
      fullBleed
      id="experience"
      className={styles.experience}
      aria-labelledby="experience-title"
    >
      <Image
        src={stepsWave}
        alt="dotted decorative wave"
        fill
        aria-hidden="true"
        className={styles.dottedWave}
      />
      <Container className={styles.experienceContainer}>
        <Row fullWidth gap={3} alignItems="center" justifyContent="between">
          <SectionTitle
            text={content.experience.title}
            specialWord={content.experience.specialWord}
          />
          <DescriptionText
            align="right"
            text={content.experience.description}
          />
        </Row>
        <Row gap="var(--space-4)" justifyContent="between">
          {cards.map((card) => (
            <FeatureCard key={card.title} className={styles.featureCard} {...card} />
          ))}
        </Row>
      </Container>
    </Section>
  );
};
