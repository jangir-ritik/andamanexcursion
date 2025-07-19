import React from "react";
import { Section, Column, Row } from "@/components/layout";
import {
  SectionTitle,
  DescriptionText,
  InlineLink,
  Button,
} from "@/components/atoms";
import { getPackageDetailPageData } from "@/lib/payload";
import { notFound } from "next/navigation";

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
  const packageData = await getPackageDetailPageData(category, id);

  if (!packageData || !packageData.packageData) {
    notFound();
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
          {/* <PackageDetailHeader packageData={packageData} /> */}
          {/* Package Detail Tabs */}
          {/* <PackageDetailTabs packageData={packageData} /> */}
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
  const packageData = await getPackageDetailPageData(category, id);

  if (!packageData || !packageData.packageData) {
    return {
      title: "Package Not Found",
      description: "The requested package does not exist.",
    };
  }

  return {
    title: `${packageData.packageData.title} | Your Site Name`,
    description:
      packageData.packageData.descriptions?.shortDescription ||
      packageData.packageData.descriptions?.description ||
      `${packageData.packageData.title} - Book Now`,
  };
}
