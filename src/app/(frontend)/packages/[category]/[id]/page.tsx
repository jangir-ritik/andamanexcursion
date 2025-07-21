import React from "react";
import { Section, Column, Row } from "@/components/layout";
import { InlineLink, Button } from "@/components/atoms";
import { getPackageDetailPageData } from "@/lib/payload";
import { notFound } from "next/navigation";

import { FAQ } from "@/components/sectionBlocks/common/faq/FAQ";
import styles from "../../page.module.css";
import { Testimonials } from "@/components/sectionBlocks/common/testimonials/Testimonials";
import { LargeCardSection } from "@/components/sectionBlocks/common";
import { PackageDetailTabs } from "@/components/organisms";
import { PackageDetailHeader } from "@/components/sectionBlocks/packages/packageDetailHeader/PackageDetailHeader";
import { PayloadPackage } from "@/components/sectionBlocks/packages/packageDetailHeader/PackageDetailHeader.types";
import {
  packagesPageFAQContent,
  testimonials,
  largeCardSectionContent,
} from "../../page.content";

interface PackageDetailPageProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

export default async function PackageDetailPage({
  params,
}: PackageDetailPageProps) {
  const { category, id } = await params;

  // Get package data from API
  const result = await getPackageDetailPageData(category, id);

  if (!result || !result.packageData) {
    notFound();
  }

  // Get the original package data object - this contains all Payload CMS fields
  const packageData = result.packageData as PayloadPackage;

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

// Generate static params for better performance
export async function generateStaticParams() {
  // In a real implementation, you would fetch all categories and packages
  // For now, we'll return an empty array since this is just a placeholder
  return [];
}

// Add metadata generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = await params;
  const result = await getPackageDetailPageData(category, id);

  if (!result || !result.packageData) {
    return {
      title: "Package Not Found",
      description: "The requested package does not exist.",
    };
  }

  const packageData = result.packageData as PayloadPackage;

  return {
    title: `${packageData.title} | Andaman Excursion`,
    description:
      packageData.descriptions?.shortDescription ||
      packageData.descriptions?.description ||
      `${packageData.title} - Book Now`,
  };
}
