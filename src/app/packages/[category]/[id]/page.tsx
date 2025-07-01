"use client";

import React from "react";
import { Section } from "@/components/layout/Section";
import { Column } from "@/components/layout/Column";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { PackageSelector } from "@/components/molecules/PackageSelector";
import styles from "../../page.module.css";
import { DescriptionText } from "@/components/atoms/DescriptionText";
import { packageOptions, periodOptions } from "../../page.content";
import { getPackageById } from "@/data/packages";
import { usePackageContext } from "@/context/PackageContext";
import { useParams } from "next/navigation";
import Image from "next/image";

// New styles for package detail page
const detailStyles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    width: "100%",
    gap: "2rem",
  },
  imageContainer: {
    position: "relative" as const,
    width: "100%",
    height: "400px",
    borderRadius: "12px",
    overflow: "hidden",
  },
  infoSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
    padding: "2rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1rem",
  },
  feature: {
    padding: "0.5rem 1rem",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  priceTag: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#4A6FA1",
  },
  discountedPrice: {
    fontSize: "1.5rem",
    textDecoration: "line-through",
    color: "#6c757d",
    marginRight: "1rem",
  },
  itineraryDay: {
    marginBottom: "1.5rem",
    padding: "1.5rem",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  dayTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "#2D3748",
  },
  dayDescription: {
    marginBottom: "1rem",
    color: "#4A5568",
  },
  activitiesList: {
    paddingLeft: "1.5rem",
  },
  activityItem: {
    marginBottom: "0.5rem",
  },
  includesExcludes: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
  },
  listContainer: {
    padding: "1.5rem",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  list: {
    paddingLeft: "1.5rem",
  },
  listItem: {
    marginBottom: "0.5rem",
  },
};

const PackageDetailPage = () => {
  const {
    selectedPackage,
    selectedPeriod,
    setSelectedPackage,
    setSelectedPeriod,
  } = usePackageContext();
  const params = useParams();
  const packageId = params.id as string;

  const packageData = getPackageById(packageId);

  if (!packageData) {
    return (
      <main className={styles.main}>
        <Section>
          <Column gap={3}>
            <SectionTitle text="Package Not Found" />
            <DescriptionText text="The package you're looking for does not exist." />
          </Column>
        </Section>
      </main>
    );
  }

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
        <Column gap={3}>
          <SectionTitle text={packageData.title} />
          <DescriptionText text={packageData.description} />

          <div style={detailStyles.container}>
            {/* Main package image */}
            <div style={detailStyles.imageContainer}>
              <Image
                src={packageData.images[0] || "/images/placeholder.jpg"}
                alt={packageData.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* Price and features */}
            <div style={detailStyles.infoSection}>
              <div>
                {packageData.discountedPrice && (
                  <span style={detailStyles.discountedPrice}>
                    ₹{packageData.price.toLocaleString()}
                  </span>
                )}
                <span style={detailStyles.priceTag}>
                  ₹
                  {(
                    packageData.discountedPrice || packageData.price
                  ).toLocaleString()}
                </span>
                <span> per person</span>
              </div>

              <h3>Package Features</h3>
              <div style={detailStyles.featuresGrid}>
                {packageData.features.map((feature, index) => (
                  <div key={index} style={detailStyles.feature}>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            <div>
              <h2>Itinerary</h2>
              {packageData.itinerary.map((day) => (
                <div key={day.day} style={detailStyles.itineraryDay}>
                  <h3 style={detailStyles.dayTitle}>
                    Day {day.day}: {day.title}
                  </h3>
                  <p style={detailStyles.dayDescription}>{day.description}</p>
                  <h4>Activities:</h4>
                  <ul style={detailStyles.activitiesList}>
                    {day.activities.map((activity, index) => (
                      <li key={index} style={detailStyles.activityItem}>
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Includes/Excludes */}
            <div style={detailStyles.includesExcludes}>
              <div style={detailStyles.listContainer}>
                <h3>Package Includes</h3>
                <ul style={detailStyles.list}>
                  {packageData.includes.map((item, index) => (
                    <li key={index} style={detailStyles.listItem}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={detailStyles.listContainer}>
                <h3>Package Excludes</h3>
                <ul style={detailStyles.list}>
                  {packageData.excludes.map((item, index) => (
                    <li key={index} style={detailStyles.listItem}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Column>
      </Section>
    </main>
  );
};

export default PackageDetailPage;
