import React from "react";
import { LargeCardSection, Trivia } from "@/components/sectionBlocks/common";
import {
  BannerSection,
  ExploreSection,
  FeatureSection,
  HeroSection,
  HowToReachSection,
} from "./components";
import { Column } from "@/components/layout";

import styles from "./page.module.css";
import { content } from "./page.content";
interface PageProps {
  params: Promise<{ name: string }>;
}

export default async function DestinationPage({ params }: PageProps) {
  // Await params before using its properties
  const { name: destinationName } = await params;

  return (
    <main className={styles.main}>
      <Column fullWidth gap={3}>
        <HeroSection
          destinationName={destinationName}
          description={content.hero.description}
        />

        <BannerSection
          image={content.banner.image}
          imageAlt={content.banner.imageAlt}
        />
      </Column>
      <FeatureSection {...content.feature} />

      <HowToReachSection content={content.howToReach} />

      <ExploreSection content={content.explore} />

      <Trivia content={content.trivia} />

      <LargeCardSection content={content.largeCardSection} />
    </main>
  );
}
