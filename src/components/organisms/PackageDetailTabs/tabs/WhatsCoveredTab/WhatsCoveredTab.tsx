import React from "react";
import { Column } from "@/components/layout/Column";
import { WhatsCoveredTabProps } from "../../PackageDetailTabs.types";
import { IncludeItem } from "../../components/IncludeItem/IncludeItem";
import { ExcludeItem } from "../../components/ExcludeItem/ExcludeItem";

import styles from "./WhatsCoveredTab.module.css";

export const WhatsCoveredTab: React.FC<WhatsCoveredTabProps> = ({
  includes,
  excludes,
}) => {
  return (
    <div
      className={styles.whatsCoveredContainer}
      role="region"
      aria-label="What's covered in this package"
    >
      <div className={styles.sectionsWrapper}>
        {includes && includes.length > 0 && (
          <Column className={styles.section}>
            <h3 id="included-title" className={styles.sectionTitle}>
              Included
            </h3>
            <div className={styles.itemsGrid} aria-labelledby="included-title">
              {includes.map((item, index) => (
                <IncludeItem key={index} text={item} />
              ))}
            </div>
          </Column>
        )}

        {excludes && excludes.length > 0 && (
          <Column className={styles.section}>
            <h3 id="excluded-title" className={styles.sectionTitle}>
              Not Included
            </h3>
            <div className={styles.itemsGrid} aria-labelledby="excluded-title">
              {excludes.map((item, index) => (
                <ExcludeItem key={index} text={item} />
              ))}
            </div>
          </Column>
        )}
      </div>
    </div>
  );
};
