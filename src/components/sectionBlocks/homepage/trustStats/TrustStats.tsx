import React from "react";
import { Row, Section, Column } from "@/components/layout";
import { StatCard } from "@/components/molecules/StatCard";
import { trustStatsContent } from "./TrustStats.content";
import styles from "./TrustStats.module.css";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import curlyArrow from "@public/graphics/curlyArrowOrange.svg";
import Image from "next/image";

export const TrustStats = () => {
  return (
    <Section
      spacing="5"
      className={styles.trustStatsSection}
      aria-labelledby="trust-stats-title"
      fullBleed
    >
      <Row
        fullWidth
        justifyContent="between"
        alignItems="center"
        wrap
        className={styles.mainRow}
      >
        <SectionTitle
          specialWord={trustStatsContent.title.specialWord}
          text={trustStatsContent.title.text}
        />
        <Image
          src={curlyArrow}
          alt="curly arrow"
          className={styles.curlyArrow}
        />

        <Row
          gap="var(--gap-1)"
          justifyContent="between"
          alignItems="center"
          wrap
          className={styles.statsContainer}
        >
          {trustStatsContent.stats.map((stat, index) => (
            <React.Fragment key={`stat-${index}`}>
              <StatCard
                value={stat.value}
                description={stat.description}
                icon={stat.icon as "users" | "ferry" | "island"}
              />
              {index !== trustStatsContent.stats.length - 1 && (
                <div className={styles.divider} aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </Row>
      </Row>
    </Section>
  );
};

export default TrustStats;
