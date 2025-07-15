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
import { PackageDetailTabs } from "@/components/organisms";
import { PackageDetailHeader } from "@/components/sectionBlocks/packages/packageDetailHeader/PackageDetailHeader";
import {
  packagesPageFAQContent,
  testimonials,
  largeCardSectionContent,
} from "../../page.content";

export default function PackageDetailPage() {
  const params = useParams();
  const packageId = params.id as string;

  const packageData = getPackageById(packageId);

  if (!packageData) {
    return (
      <main className={styles.main}>
        <Section>
          <Column gap={3} responsive responsiveGap="var(--space-4)">
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
        <Column
          fullWidth
          gap={5}
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          <PackageDetailHeader packageData={packageData} />
          {/* Package Detail Tabs */}
          <PackageDetailTabs packageData={packageData} />
          <Row gap={3} responsive responsiveGap="var(--space-4)">
            <InlineLink href="/customise">Customise this package</InlineLink>
            <Button showArrow>Enquire</Button>
          </Row>
        </Column>
      </Section>
      <FAQ content={packagesPageFAQContent} />
      <Testimonials content={testimonials} />
      <LargeCardSection content={largeCardSectionContent} />
    </main>
  );
}
