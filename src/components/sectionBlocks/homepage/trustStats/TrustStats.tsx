import React from "react";
import { Row, Section } from "@/components/layout";
import { StatCard } from "@/components/molecules/Cards";
import { trustStatsContent } from "./TrustStats.content";
import styles from "./TrustStats.module.css";
import { SectionTitle } from "@/components/atoms";
import curlyArrow from "@public/graphics/curlyArrowOrange.svg";
import Image from "next/image";

export const TrustStats = () => {
  return (
    <Section
      spacing="5"
      className={styles.trustStatsSection}
      aria-labelledby="trust-stats-title"
      id="trust-stats"
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
          id="trust-stats-title"
        />
        <Image
          src={curlyArrow}
          alt=""
          className={styles.curlyArrow}
          aria-hidden="true"
        />

        <Row
          gap="var(--space-2)"
          justifyContent="between"
          alignItems="center"
          wrap
          className={styles.statsContainer}
        >
          {trustStatsContent.stats.map((stat, index) => (
            <React.Fragment key={`stat-${index}`}>
              <StatCard
                label={stat.label}
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
