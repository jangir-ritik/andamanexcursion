import React from "react";
import styles from "./page.module.css";
import { content } from "./page.content";
import { LargeCardSection, Trivia } from "@/components/sectionBlocks/common";
import {
  BannerSection,
  ExploreSection,
  FeatureSection,
  HeroSection,
  HowToReachSection,
} from "./components";

interface PageProps {
  params: Promise<{ name: string }>;
}

export default async function DestinationPage({ params }: PageProps) {
  // Await params before using its properties
  const { name: destinationName } = await params;

  return (
    <main className={styles.main}>
      <HeroSection
        destinationName={destinationName}
        description={content.hero.description}
      />

      <BannerSection
        image={content.banner.image}
        imageAlt={content.banner.imageAlt}
      />

      <FeatureSection {...content.feature} />

      <HowToReachSection cards={content.howToReach.cards} />

      <ExploreSection
        title={content.explore.title}
        specialWord={content.explore.specialWord}
        description={content.explore.description}
        activities={content.explore.activities}
      />

      <Trivia
        title={content.trivia.title}
        text={content.trivia.text}
        highlightedPhrases={content.trivia.highlightedPhrases}
      />

      <LargeCardSection
        title={content.largeCardSection.title}
        image={content.largeCardSection.image}
        imageAlt={content.largeCardSection.imageAlt}
        ctaText={content.largeCardSection.ctaText}
        ctaHref={content.largeCardSection.ctaHref}
      />
    </main>
  );
}
