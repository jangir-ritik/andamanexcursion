"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [filteredCategories, setFilteredCategories] = useState(
    packageCategoriesContent
  );

  // Sync with URL params
  useEffect(() => {
    const period = searchParams.get("period") || "all";
    setSelectedPeriod(period);
  }, [searchParams]);

  // Filter categories based on period (if needed)
  useEffect(() => {
    if (selectedPeriod === "all") {
      setFilteredCategories(packageCategoriesContent);
    } else {
      // You might want to implement category filtering by period here
      // For now, we'll show all categories regardless of period
      setFilteredCategories(packageCategoriesContent);
    }
  }, [selectedPeriod, packageCategoriesContent]);

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriod(periodId);

    // Update URL
    const params = new URLSearchParams(searchParams);
    if (periodId === "all") {
      params.delete("period");
    } else {
      params.set("period", periodId);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/packages?${queryString}` : "/packages";
    router.push(newUrl);
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
          <SectionTitle text="Choose Your Package" />
          <PackageSelector
            packageOptions={packageOptions}
            periodOptions={periodOptions}
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            showPackageSelector={true}
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
            {filteredCategories.map((category) => (
              <PackageCard
                key={category.id}
                title={category.title}
                description={category.description}
                media={category.media}
                href={`/packages/${category.slug}${
                  selectedPeriod !== "all" ? `?period=${selectedPeriod}` : ""
                }`}
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
