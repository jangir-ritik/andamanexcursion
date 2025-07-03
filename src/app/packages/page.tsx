"use client";

import React from "react";
import { Section, Column } from "@/components/layout";
import { PackageSelector } from "@/components/molecules/PackageSelector/PackageSelector";
import { PackageCard } from "@/components/molecules/Cards/PackageCard/PackageCard";

import { FAQ } from "@/components/sectionBlocks/common/faq/FAQ";
import { Testimonials } from "@/components/sectionBlocks/common/testimonials/Testimonials";
import { ScubaDiving } from "@/components/sectionBlocks/common/scubaDiving/ScubaDiving";
import { usePackageContext } from "@/context/PackageContext";

import styles from "./page.module.css";
import {
  packageOptions,
  periodOptions,
  packageCategoriesContent,
  packagesPageFAQContent,
} from "./page.content";
import { DescriptionText, SectionTitle } from "@/components/atoms";

export default function PackagesPage() {
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
        <Column gap={7}>
          <Column gap={3} alignItems="start" justifyContent="start">
            <SectionTitle text="Our Packages" specialWord="Packages" />
            <DescriptionText text="Crafted Just For You!" />
          </Column>
          <Column>
            {packageCategoriesContent.map((category) => (
              <PackageCard
                key={category.id}
                title={category.title}
                description={category.description}
                images={category.images}
                href={`/packages/${category.id}`}
              />
            ))}
          </Column>
        </Column>
      </Section>
      <FAQ {...packagesPageFAQContent} />
      <Testimonials />
      <ScubaDiving />
    </main>
  );
}
