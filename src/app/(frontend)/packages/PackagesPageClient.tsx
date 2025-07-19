"use client";
import React from "react";
import { Section, Column } from "@/components/layout";
import { PackageSelector } from "@/components/molecules/PackageSelector/PackageSelector";
import { PackageCard } from "@/components/molecules/Cards/PackageCard/PackageCard";
import {
  DecorativeCurlyArrow,
  DescriptionText,
  SectionTitle,
} from "@/components/atoms";
import {
  LargeCardSection,
  FAQ,
  Testimonials,
} from "@/components/sectionBlocks/common";
import { usePackageContext } from "@/context/PackageContext";
import styles from "./page.module.css";

interface PackagesPageClientProps {
  packageOptions: any[];
  periodOptions: any[];
  packageCategoriesContent: any[];
  faqContent: any;
  testimonials: any;
  largeCardSectionContent: any;
}

export function PackagesPageClient({
  packageOptions,
  periodOptions,
  packageCategoriesContent,
  faqContent,
  testimonials,
  largeCardSectionContent,
}: PackagesPageClientProps) {
  const {
    selectedPackage,
    selectedPeriod,
    setSelectedPackage,
    setSelectedPeriod,
  } = usePackageContext();

  const handlePackageChange = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriod(periodId);
  };

  return (
    <main className={styles.main}>
      <Section>
        <Column
          gap={3}
          justifyContent="start"
          alignItems="start"
          fullWidth
          className={styles.packageSelectorWrapper}
          style={{ minHeight: "150px" }}
        >
          <SectionTitle text="Chosen Package" />
          <PackageSelector
            packageOptions={packageOptions}
            periodOptions={periodOptions}
            onPackageChange={handlePackageChange}
            onPeriodChange={handlePeriodChange}
            defaultPackage={selectedPackage}
            defaultPeriod={selectedPeriod}
          />
        </Column>
      </Section>

      <Section>
        <Column
          gap={7}
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          <Column
            gap={3}
            alignItems="start"
            justifyContent="start"
            responsive
            responsiveGap="var(--space-4)"
          >
            <SectionTitle text="Our Packages" specialWord="Packages" />
            <DescriptionText text="Crafted Just For You!" />
            <DecorativeCurlyArrow
              top="50%"
              left="33%"
              scale={1.5}
              rotation={30}
            />
          </Column>

          <Column>
            {packageCategoriesContent.map((category) => (
              <PackageCard
                key={category.id}
                title={category.title}
                description={category.description}
                media={category.media}
                href={`/packages/${category.slug}`}
              />
            ))}
          </Column>
        </Column>
      </Section>

      <FAQ content={faqContent} />
      <Testimonials content={testimonials} />
      <LargeCardSection content={largeCardSectionContent} />
    </main>
  );
}
