"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Section, Column } from "@/components/layout";

import { ImageContainer } from "@/components/atoms";
import { BookingForm } from "@/components/organisms";
import {
  TrustedFerries,
  PlanInFourEasySteps,
  Trivia,
} from "@/components/sectionBlocks/ferry";

import {
  FAQ,
  LargeCardSection,
  Partners,
  Testimonials,
} from "@/components/sectionBlocks/common";

import { content } from "./page.content";

import styles from "./page.module.css";

import { useBooking } from "@/context/BookingContext";

export default function FerryPage() {
  const router = useRouter();
  const { bookingState } = useBooking();

  const handleViewFerries = () => {
    // Navigate to booking page with current booking state
    router.push(
      `/ferry/booking?from=${bookingState.from}&to=${bookingState.to}&date=${
        bookingState.date
      }&time=${encodeURIComponent(bookingState.time)}&passengers=${
        bookingState.adults + bookingState.children + bookingState.infants
      }`
    );
  };

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

          <BookingForm initialTab="ferry" />
        </Column>
      </Section>

      <PlanInFourEasySteps />
      <TrustedFerries />
      <Partners
        title={content.partners.title}
        specialWord={content.partners.specialWord}
        partners={content.partners.partners}
        partnersAlt={content.partners.partnersAlt}
      />
      <LargeCardSection
        subtitle={content.largeCardSection.subtitle}
        title={content.largeCardSection.title}
        image={content.largeCardSection.image}
        imageAlt={content.largeCardSection.imageAlt}
        ctaText={content.largeCardSection.ctaText}
        ctaHref={content.largeCardSection.ctaHref}
      />
      <Trivia />
      <Testimonials
        title={content.testimonials.title}
        specialWord={content.testimonials.specialWord}
        subtitle={content.testimonials.subtitle}
        testimonials={content.testimonials.testimonials}
      />
      <FAQ
        title={content.faqSection.title}
        specialWord={content.faqSection.specialWord}
        items={content.faqSection.items}
      />
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
