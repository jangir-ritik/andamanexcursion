"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Section, Column } from "@/components/layout";
import { PackageSelector } from "@/components/molecules/PackageSelector/PackageSelector";
import { FeaturePackageCard } from "@/components/molecules/Cards";
import { SectionTitle } from "@/components/atoms";
import { usePackageContext } from "@/context/PackageContext";
import styles from "../page.module.css";

interface CategoryPageClientProps {
  category: any;
  packages: any[];
  packageOptions: any[];
  periodOptions: any[];
  initialPeriod?: string;
}

export function CategoryPageClient({
  category,
  packages,
  packageOptions,
  periodOptions,
  initialPeriod,
}: CategoryPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    selectedPackage,
    selectedPeriod,
    setSelectedPackage,
    setSelectedPeriod,
  } = usePackageContext();

  // Initialize with URL params first, then context values
  const [currentPeriod, setCurrentPeriod] = useState("all");

  // Update local state after component mounts to match props/context
  useEffect(() => {
    const periodToUse = initialPeriod || selectedPeriod || "all";
    setCurrentPeriod(periodToUse);

    // Also update context if we have initialPeriod from URL
    if (initialPeriod && initialPeriod !== selectedPeriod) {
      setSelectedPeriod(initialPeriod);
    }
  }, [initialPeriod, selectedPeriod, setSelectedPeriod]);

  // Handle package change
  const handlePackageChange = (packageId: string) => {
    setSelectedPackage(packageId);
    router.push(`/packages/${category.slug}?period=${currentPeriod}`);
  };

  // Handle period change
  const handlePeriodChange = (periodId: string) => {
    setCurrentPeriod(periodId);
    setSelectedPeriod(periodId);

    // Update URL with search params
    const params = new URLSearchParams(searchParams.toString());
    if (periodId === "all") {
      params.delete("period");
    } else {
      params.set("period", periodId);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/packages/${category.slug}${newUrl}`, { scroll: false });
  };

  const getCategoryTitle = (category: any) => {
    return category?.title || category?.categoryDetails?.name || "Packages";
  };

  // We can now directly use the period data from the CMS
  useEffect(() => {
    // Debug log to check package data
    console.log(
      "Package period data:",
      packages.map((pkg) => ({
        title: pkg.title,
        period: pkg.coreInfo?.period,
      }))
    );
  }, [packages]);

  return (
    <main className={styles.main}>
      {/* Package Selector Section */}
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
            onPackageChange={handlePackageChange}
            onPeriodChange={handlePeriodChange}
            defaultPackage={selectedPackage}
            defaultPeriod={currentPeriod}
          />
        </Column>
      </Section>

      {/* Category Header */}
      <Section>
        <Column gap={2} alignItems="start" fullWidth>
          <SectionTitle
            text={`${getCategoryTitle(category)} Packages`}
            specialWord={getCategoryTitle(category)}
            className={styles.sectionTitle}
          />
          {category.description && (
            <p className={styles.categoryDescription}>{category.description}</p>
          )}
        </Column>
      </Section>

      {/* Packages Grid */}
      <Section>
        <Column gap={4} fullWidth responsive responsiveGap="var(--space-3)">
          {packages.length > 0 ? (
            packages.map((pkg) => (
              <FeaturePackageCard
                key={pkg.id}
                title={pkg.title}
                description={pkg.description}
                price={pkg.price}
                // discountedPrice={pkg.discountedPrice}
                location={pkg.location}
                // Use the pre-formatted period value directly from CMS
                duration={
                  pkg.coreInfo?.period?.shortTitle ||
                  pkg.coreInfo?.period?.title ||
                  ""
                }
                image={pkg.images?.[0] || pkg.media?.heroImage}
                href={`/packages/${category.slug}/${pkg.slug}`}
                // highlights={pkg.highlights?.slice(0, 3)} // Show first 3 highlights
              />
            ))
          ) : (
            <div className={styles.noPackages}>
              <p>No packages found for the selected period.</p>
              <button
                onClick={() => handlePeriodChange("all")}
                className={styles.showAllButton}
              >
                Show All Packages
              </button>
            </div>
          )}
        </Column>
      </Section>
    </main>
  );
}
