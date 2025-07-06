"use client";

import React from "react";
import { Section, Column, Grid } from "@/components/layout";

import { FAQ } from "@/components/sectionBlocks/common/faq/FAQ";
import {
  Testimonials,
  LargeCardSection,
} from "@/components/sectionBlocks/common";

import { content } from "./page.content";
import styles from "./page.module.css";

import {
  DescriptionText,
  ImageContainer,
  SectionTitle,
} from "@/components/atoms";
import { BookingForm } from "@/components/organisms";
import { SmallCard } from "@/components/molecules/Cards";

export default function ActivitiesPage() {
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

          <BookingForm initialTab="activities" />
        </Column>
      </Section>
      <Section id="activities" noPadding>
        <Column gap={3} alignItems="start" justifyContent="start" fullWidth>
          <SectionTitle
            text={content.title}
            specialWord={content.subtitle}
            id="activities-title"
          />
          <DescriptionText text={content.description} />
          <Grid
            columns={{ desktop: 3, tablet: 2, mobile: 1 }}
            gap={3}
            role="grid"
            ariaLabel="Available water activities"
          >
            {content.activitiesData.map((activity) => (
              <SmallCard
                key={activity.id}
                image={activity.image.src}
                imageAlt={activity.imageAlt}
                title={activity.name}
                description={activity.description}
                href={activity.href}
              />
            ))}
          </Grid>
        </Column>
      </Section>
      <FAQ {...content.faqSection} />
      <Testimonials />
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
