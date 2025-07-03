import React from "react";
import { ImageContainer } from "@/components/atoms";
import { Column, Row } from "@/components/layout";
import styles from "./PackageDetailHeader.module.css";
import type { PackageDetailHeaderProps } from "./PackageDetailHeader.types";

export const PackageDetailHeader: React.FC<PackageDetailHeaderProps> = ({
  packageData,
}) => {
  return (
    <React.Fragment>
      <Row fullWidth>
        <ImageContainer
          src={packageData.images[1]}
          alt={packageData.title}
          className={styles.imageContainer}
        />
      </Row>
      <Row fullWidth justifyContent="between" alignItems="center">
        <h3
          aria-label={`Package: ${packageData.title}`}
          className={styles.sectionTitle}
        >
          {packageData.title}
        </h3>
        <Column gap={1} alignItems="end" className={styles.infoContainer}>
          <p
            className={styles.price}
            aria-label={`Price: ${packageData.price} rupees per adult`}
          >
            ₹{packageData.price}/adult
          </p>
          <Row gap={1}>
            <p
              className={styles.location}
              aria-label={`Location: ${packageData.location}`}
            >
              {packageData.location || "Andaman Islands"}
            </p>
            <p
              className={styles.period}
              aria-label={`Period: ${packageData.period}`}
            >
              {packageData.period.replace("-", "D ")}N
            </p>
          </Row>
        </Column>
      </Row>
    </React.Fragment>
  );
};
