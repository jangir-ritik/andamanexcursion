"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Section, Column } from "@/components/layout";
import { PackageSelector } from "@/components/molecules/PackageSelector/PackageSelector";
import { SectionTitle, DescriptionText } from "@/components/atoms";
import styles from "../page.module.css";
import { FeaturePackageCard } from "@/components/molecules/Cards";

interface CategoryPageClientProps {
  category: any;
  packages: any[];
  periodOptions: any[];
  packageOptions: any[];
  initialPeriod: string;
}

export function CategoryPageClient({
  category,
  packages,
  periodOptions,
  packageOptions,
  initialPeriod,
}: CategoryPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);

  // Sync with URL params
  useEffect(() => {
    const period = searchParams.get("period") || "all";
    setSelectedPeriod(period);
  }, [searchParams]);

  // Filter packages based on selected period
  const filteredPackages = useMemo(() => {
    if (selectedPeriod === "all") {
      return packages;
    }

    return packages.filter((pkg) => {
      // Assuming the package has a period field that matches the period value
      return (
        pkg.coreInfo?.period?.value === selectedPeriod ||
        pkg.coreInfo?.period?.id === selectedPeriod ||
        pkg.period?.value === selectedPeriod ||
        pkg.period?.id === selectedPeriod
      );
    });
  }, [packages, selectedPeriod]);

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
    const newUrl = queryString
      ? `/packages/${category.slug}?${queryString}`
      : `/packages/${category.slug}`;
    router.push(newUrl);
  };

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
          <SectionTitle
            text={`${category.title} Packages`}
            specialWord={category.title}
          />
          <PackageSelector
            packageOptions={packageOptions}
            periodOptions={periodOptions}
            selectedPackage={category.slug}
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            showPackageSelector={true}
          />
        </Column>
      </Section>

      {/* Category Description */}
      {/* {category.categoryDetails?.description && (
        <Column gap={2} alignItems="start" fullWidth>
          <DescriptionText text={category.categoryDetails.description} />
        </Column>
      )} */}

      {/* Packages Grid */}
      <Section>
        <Column gap={4} fullWidth responsive responsiveGap="var(--space-3)">
          {/* <SectionTitle
            text={`${category.title} Options`}
            specialWord="Options"
          /> */}
          {filteredPackages.length > 0 ? (
            // <div className={styles.packagesGrid}>
            <>
              {filteredPackages.map((pkg) => (
                <FeaturePackageCard
                  key={pkg.id}
                  title={pkg.title}
                  description={
                    pkg.coreInfo?.shortDescription || pkg.description
                  }
                  image={pkg.media}
                  href={`/packages/${category.slug}/${pkg.slug}`}
                  price={pkg.pricing?.basePrice}
                  duration={
                    pkg.coreInfo?.period?.shortTitle ||
                    pkg.coreInfo?.period?.title
                  }
                  location="India"
                />
              ))}
            </>
          ) : (
            // </div>
            <div className={styles.noPackages}>
              <p>No packages found for the selected duration.</p>
              <p>
                Try selecting "All Durations" to see all available packages.
              </p>
            </div>
          )}
        </Column>
      </Section>
    </main>
  );
}
