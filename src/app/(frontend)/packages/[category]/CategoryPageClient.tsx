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

  // Initialize with URL search params or context
  const [currentPeriod, setCurrentPeriod] = useState(
    initialPeriod || selectedPeriod || "all"
  );

  // Filter packages based on selected period
  const filteredPackages = useMemo(() => {
    if (currentPeriod === "all") return packages;
    return packages.filter((pkg) => pkg.period === currentPeriod);
  }, [packages, currentPeriod]);

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
    const params = new URLSearchParams(searchParams);
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

  const formatDuration = (period: string) => {
    // Convert period format like "4-3" to "4 Days 3 Nights"
    if (!period || period === "all") return "";
    const [days, nights] = period.split("-");
    return `${days} Days ${nights} Nights`;
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
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => (
              <FeaturePackageCard
                key={pkg.id}
                title={pkg.title}
                description={pkg.description}
                price={pkg.price}
                // discountedPrice={pkg.discountedPrice}
                location={pkg.location}
                duration={formatDuration(pkg.period)}
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
