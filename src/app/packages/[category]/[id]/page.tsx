"use client";

import React from "react";
import { Section, Column, Row } from "@/components/layout";
import {
  SectionTitle,
  DescriptionText,
  InlineLink,
  Button,
} from "@/components/atoms";
import { getPackageById } from "@/data/packages";
import { useParams } from "next/navigation";

import { FAQ } from "@/components/sectionBlocks/common/faq/FAQ";
import styles from "../../page.module.css";
import { Testimonials } from "@/components/sectionBlocks/common/testimonials/Testimonials";
import { LargeCardSection } from "@/components/sectionBlocks/common";
import { largeCardSectionContent, testimonials } from "../../page.content";
import { PackageDetailTabs } from "@/components/organisms";
import { PackageDetailHeader } from "@/components/sectionBlocks/packages/packageDetailHeader/PackageDetailHeader";

export default function PackageDetailPage() {
  const params = useParams();
  const packageId = params.id as string;

  const packageData = getPackageById(packageId);

  if (!packageData) {
    return (
      <main className={styles.main}>
        <Section>
          <Column gap={3}>
            <SectionTitle text="Package Not Found" />
            <DescriptionText text="The package you're looking for does not exist." />
          </Column>
        </Section>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Section className={styles.packageDetailSection}>
        <Column fullWidth gap={5}>
          <PackageDetailHeader packageData={packageData} />
          {/* Package Detail Tabs */}
          <PackageDetailTabs packageData={packageData} />
          <Row gap={3}>
            <InlineLink href="/customise">Customise this package</InlineLink>
            <Button>Enquire</Button>
          </Row>
        </Column>
      </Section>
      <FAQ
        title="Frequently Asked Questions"
        items={[
          {
            question: "What is the price of the package?",
            answer: "The price of the package is 10000 INR per person.",
          },
        ]}
      />
      <Testimonials
        title={testimonials.title}
        specialWord={testimonials.specialWord}
        subtitle={testimonials.subtitle}
        testimonials={testimonials.testimonials}
      />
      <LargeCardSection
        subtitle={largeCardSectionContent.subtitle}
        title={largeCardSectionContent.title}
        image={largeCardSectionContent.image}
        imageAlt={largeCardSectionContent.imageAlt}
        ctaText={largeCardSectionContent.ctaText}
        ctaHref={largeCardSectionContent.ctaHref}
      />
    </main>
  );
}
