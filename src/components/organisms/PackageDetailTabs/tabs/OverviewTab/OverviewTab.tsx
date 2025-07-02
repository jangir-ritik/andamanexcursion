import React from "react";
import { Column } from "@/components/layout/Column";
import { HighlightItem } from "../../components/HighlightItem/HighlightItem";
import { OverviewTabProps } from "@/types/components/organisms/packageDetailTabs";

import styles from "./OverviewTab.module.css";

export const OverviewTab: React.FC<OverviewTabProps> = ({ packageData }) => {
  return (
    <div
      className={styles.overviewContainer}
      role="region"
      aria-label="Package overview"
    >
      <Column gap={4} fullWidth>
        <div className={styles.descriptionSection}>
          <p className={styles.description}>{packageData.description}</p>
        </div>

        <div
          className={styles.highlightsSection}
          aria-labelledby="highlights-title"
        >
          <h2 id="highlights-title" className={styles.sectionTitle}>
            Highlights
          </h2>
          <Column gap={2} fullWidth>
            {packageData.highlights.map((highlight, index) => (
              <HighlightItem key={index} text={highlight} />
            ))}
          </Column>
        </div>
      </Column>
    </div>
  );
};
