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
  const locationDisplay =
    typeof packageData.coreInfo?.location === "object"
      ? packageData.coreInfo.location?.name
      : packageData.coreInfo?.location || "Andaman Islands";

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
        <h3 className={styles.sectionTitle}>{packageData.title}</h3>

        <Column
          gap={1}
          alignItems="end"
          className={styles.infoContainer}
          responsive
          responsiveAlignItems="start"
          responsiveGap="var(--space-2)"
        >
          <p className={styles.price}>
            ₹{packageData.pricing?.price || 0}/adult
          </p>

          <Row gap={1}>
            <p className={styles.location}>{locationDisplay}</p>
            <p className={styles.period}>{periodDisplay}</p>
          </Row>
        </Column>
      </Row>
    </>
  );
};
