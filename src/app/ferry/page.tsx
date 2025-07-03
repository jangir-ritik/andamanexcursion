"use client";

import React from "react";
import { Section, Column } from "@/components/layout";

import styles from "./page.module.css";
import { content } from "./page.content";
import { ImageContainer } from "@/components/atoms";
import { BookingForm } from "@/components/organisms";
import {
  AndamanCalling,
  FAQ,
  Partners,
  Testimonials,
} from "@/components/sectionBlocks/common";
import { TrustedFerries } from "@/components/sectionBlocks/ferry/trustedFerries/TrustedFerries";

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
      {/* Plan in 4 easy steps */}
      {/* most trusted ferries */}
      <TrustedFerries />
      <Partners />
      {/* Sea walking */}
      <Testimonials />
      <FAQ
        title="Get Answers to all your Questions!"
        specialWord="Answers"
        items={content.faqs}
      />
      <AndamanCalling />
    </main>
  );
}
