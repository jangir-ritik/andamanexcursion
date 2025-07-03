"use client";

import React from "react";
import { Section, Column } from "@/components/layout";

import styles from "./page.module.css";
import { content } from "./page.content";
import { ImageContainer } from "@/components/atoms";
import { BookingForm } from "@/components/organisms";
import {
  FAQ,
  LargeCardSection,
  Partners,
  Testimonials,
} from "@/components/sectionBlocks/common";
import {
  TrustedFerries,
  PlanInFourEasySteps,
  Trivia,
} from "@/components/sectionBlocks/ferry";

export default function FerryPage() {
  return (
    <main className={styles.main}>
      <Section noPadding id="hero">
        <Column gap="var(--space-8)" fullWidth>
          <ImageContainer
            src={content.image}
            alt={content.imageAlt}
            aspectRatio="banner"
            priority
            fullWidth
          />

          <BookingForm />
        </Column>
      </Section>
      <PlanInFourEasySteps />
      <TrustedFerries />
      <Partners />
      <LargeCardSection
        subtitle={content.largeCardSection.subtitle}
        title={content.largeCardSection.title}
        image={content.largeCardSection.image}
        imageAlt={content.largeCardSection.imageAlt}
        ctaText={content.largeCardSection.ctaText}
        ctaHref={content.largeCardSection.ctaHref}
      />
      <Trivia />
      <Testimonials />
      <FAQ
        title={content.faqSection.title}
        specialWord={content.faqSection.specialWord}
        items={content.faqSection.items}
      />{" "}
      <LargeCardSection
        title={content.largeCardSection2.title}
        image={content.largeCardSection2.image}
        imageAlt={content.largeCardSection2.imageAlt}
        ctaText={content.largeCardSection2.ctaText}
        ctaHref={content.largeCardSection2.ctaHref}
      />
    </main>
  );
}
