import React from "react";
import { Container, Row, Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { FeatureCard } from "@/components/molecules/Cards/FeatureCard/FeatureCard";
import styles from "../page.module.css";
import Image from "next/image";
// import stepsWave from "@public/graphics/stepsWave.svg";

interface HowToReachCard {
  title: string;
  description: string;
  icon: string;
}

export interface HowToReachSectionContent {
  title: string;
  specialWord: string;
  cards: HowToReachCard[];
}

export const HowToReachSection: React.FC<{
  content: HowToReachSectionContent;
}> = ({ content }) => {
  return (
    <Section
      fullBleed
      id="how-to-reach"
      className={styles.howToReach}
      aria-labelledby="how-to-reach-title"
    >
      {/* <Image
        src={stepsWave}
        alt="dotted decorative wave"
        fill
        aria-hidden="true"
        className={styles.dottedWave}
      /> */}
      <Container className={styles.howToReachContainer}>
        <Row fullWidth>
          <SectionTitle
            text={content.title}
            specialWord={content.specialWord}
          />
        </Row>
        <Row gap="var(--space-4)" justifyContent="between">
          {content.cards.map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </Row>
      </Container>
    </Section>
  );
};
