"use client";

import React from "react";
import { Section } from "@/components/layout/Section";
import { Column } from "@/components/layout/Column";
import { SectionTitle } from "@/components/atoms/SectionTitle/SectionTitle";
import { PackageSelector } from "@/components/molecules/PackageSelector";
import { FeaturePackageCard } from "@/components/molecules/Cards/FeaturePackageCard";

import { usePackageCategoryPage } from "@/hooks/usePackageCategoryPage";

import styles from "../page.module.css";
import { packageOptions, periodOptions } from "../page.content";

const CategoryPage = () => {
  const {
    selectedPackage,
    selectedPeriod,
    category,
    packages,
    handlePackageChange,
    handlePeriodChange,
    getCategoryTitle,
    formatDuration,
  } = usePackageCategoryPage();

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
        <Column gap={7} fullWidth>
          <Column alignItems="start" justifyContent="start" fullWidth>
            <SectionTitle
              text={getCategoryTitle(category) + " Packages"}
              specialWord={getCategoryTitle(category)}
              className={styles.sectionTitle}
            />
            {packages.map((pkg) => (
              <FeaturePackageCard
                key={pkg.id}
                title={pkg.title}
                description={pkg.description}
                price={pkg.price}
                location={pkg.location}
                duration={formatDuration(pkg.period)}
                image={pkg.images[0]}
                href={`/packages/${category}/${pkg.id}`}
              />
            ))}
          </Column>
        </Column>
      </Section>
    </main>
  );
};

export default CategoryPage;
