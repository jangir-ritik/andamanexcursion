import React from "react";
import { BlockRenderer } from "@/components/layout/BlockRenderer/BlockRenderer";
// import { LargeCardSection, Trivia } from "@/components/sectionBlocks/common";
// import {
//   BannerSection,
//   ExploreSection,
//   FeatureSection,
//   HeroSection,
//   HowToReachSection,
// } from "./components";
// import { Column } from "@/components/layout";

import styles from "./page.module.css";
import { getPageBySlug } from "@/lib/payload";
import { notFound } from "next/navigation";
// import { content } from "./page.content";
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DestinationPage({ params }: PageProps) {
  // Await params before using its properties
  const { slug: destinationSlug } = await params;

  const page = await getPageBySlug(destinationSlug);

  if (!page) {
    return notFound();
  }

  return (
    <main className={styles.main}>
      <BlockRenderer blocks={page.pageContent?.content} />
      {/* <Column fullWidth gap={3}>
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

      <LargeCardSection content={content.largeCardSection} /> */}
    </main>
  );
}
