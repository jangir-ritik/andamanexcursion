"use client";

import React, { useState } from "react";
import { Section } from "@/components/layout/Section";
import { Column } from "@/components/layout/Column";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { PackageSelector } from "@/components/molecules/PackageSelector";
import styles from "./page.module.css";
import { PackageCard } from "@/components/molecules/Cards/PackageCard/PackageCard";
import { DescriptionText } from "@/components/atoms/DescriptionText";
import {
  packageOptions,
  periodOptions,
  packageCategoriesContent,
  packagesPageFAQContent,
} from "./page.content";
import FAQ from "@/components/sectionBlocks/common/faq/FAQ";
import Testimonials from "@/components/sectionBlocks/common/testimonials/Testimonials";
import ScubaDiving from "@/components/sectionBlocks/common/scubaDiving/ScubaDiving";

const PackagesPage = () => {
  const [selectedPackage, setSelectedPackage] = useState("honeymoon");
  const [selectedPeriod, setSelectedPeriod] = useState("4-3");

  const handlePackageChange = (packageId: string) => {
    setSelectedPackage(packageId);
    // Here you could filter packages based on selection
  };

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriod(periodId);
    // Here you could filter packages based on duration
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
                href={category.href}
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
};

export default PackagesPage;
