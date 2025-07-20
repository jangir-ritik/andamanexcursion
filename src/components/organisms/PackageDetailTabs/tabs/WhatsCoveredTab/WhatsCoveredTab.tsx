import React from "react";

import { Column } from "@/components/layout";

import type { WhatsCoveredTabProps } from "../../PackageDetailTabs.types";

import styles from "./WhatsCoveredTab.module.css";
import { IncludeItem } from "../../components/IncludeItem/IncludeItem";
import { ExcludeItem } from "../../components/ExcludeItem/ExcludeItem";

export const WhatsCoveredTab: React.FC<WhatsCoveredTabProps> = ({
  includes,
  excludes,
}) => {
  // Process includes to handle both array formats
  const processedIncludes = React.useMemo(() => {
    if (!includes) return [];

    return includes.map((item) => {
      if (typeof item === "string") return item;
      return item.inclusion;
    });
  }, [includes]);

  // Process excludes to handle both array formats
  const processedExcludes = React.useMemo(() => {
    if (!excludes) return [];

    return excludes.map((item) => {
      if (typeof item === "string") return item;
      return item.exclusion;
    });
  }, [excludes]);

  // If nothing to show, return empty message
  if (
    (!processedIncludes || processedIncludes.length === 0) &&
    (!processedExcludes || processedExcludes.length === 0)
  ) {
    return (
      <div className={styles.whatsCoveredContainer}>
        <p>No inclusion or exclusion details available.</p>
      </div>
    );
  }

  return (
    <div
      className={styles.whatsCoveredContainer}
      role="region"
      aria-label="What's covered in this package"
    >
      <div className={styles.sectionsWrapper}>
        {processedIncludes && processedIncludes.length > 0 && (
          <Column
            className={styles.section}
            responsive
            responsiveGap="var(--space-4)"
          >
            <h3 id="included-title" className={styles.sectionTitle}>
              Included
            </h3>
            <div className={styles.itemsGrid} aria-labelledby="included-title">
              {processedIncludes.map((item, index) => (
                <IncludeItem key={index} text={item} />
              ))}
            </div>
          </Column>
        )}

        {processedExcludes && processedExcludes.length > 0 && (
          <Column
            className={styles.section}
            responsive
            responsiveGap="var(--space-4)"
          >
            <h3 id="excluded-title" className={styles.sectionTitle}>
              Not Included
            </h3>
            <div className={styles.itemsGrid} aria-labelledby="excluded-title">
              {processedExcludes.map((item, index) => (
                <ExcludeItem key={index} text={item} />
              ))}
            </div>
          </Column>
        )}
      </div>
    </div>
  );
};
