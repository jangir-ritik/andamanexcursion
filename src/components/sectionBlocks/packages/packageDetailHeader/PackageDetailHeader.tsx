import React from "react";
import { ImageContainer } from "@/components/atoms";
import { Column, Row } from "@/components/layout";
import styles from "./PackageDetailHeader.module.css";
import type { PackageDetailHeaderProps } from "./PackageDetailHeader.types";

export const PackageDetailHeader: React.FC<PackageDetailHeaderProps> = ({
  packageData,
}) => {
  // Get first available image URL
  const imageUrl = packageData.images?.[0]?.url || "/images/placeholder.png";

  // Get period display
  const periodValue =
    typeof packageData.coreInfo?.period === "object"
      ? packageData.coreInfo.period?.value
      : packageData.coreInfo?.period || "";
  const periodDisplay = periodValue.replace("-", "D ") + "N";

  // Get location display
  const locationDisplay = packageData.coreInfo?.locations
    ?.map((location) => {
      if (typeof location === "string") return location;
      return location.name;
    })
    .join(", ");

  return (
    <>
      <Row fullWidth responsive responsiveGap="var(--space-4)">
        <ImageContainer
          src={imageUrl}
          alt={packageData.title}
          className={styles.imageContainer}
        />
      </Row>

      <Row
        fullWidth
        justifyContent="between"
        alignItems="start"
        responsive
        responsiveGap="var(--space-4)"
      >
        <h1 className={styles.sectionTitle}>{packageData.title}</h1>

        <Column
          gap={1}
          alignItems="end"
          className={styles.infoContainer}
          responsive
          responsiveAlignItems="start"
          responsiveGap="var(--space-2)"
        >
          <p role="text" aria-label="Price" className={styles.price}>
            ₹{packageData.pricing?.price || 0}/adult
          </p>

          <Row
            gap={1}
            responsive
            responsiveGap="var(--space-2)"
            alignItems="start"
          >
            <p role="text" aria-label="Location" className={styles.location}>
              {locationDisplay}
            </p>
            <span
              role="separator"
              aria-label="Separator"
              className={styles.separator}
            >
              •
            </span>
            <p role="text" aria-label="Period" className={styles.period}>
              {periodDisplay}
            </p>
          </Row>
        </Column>
      </Row>
    </>
  );
};
