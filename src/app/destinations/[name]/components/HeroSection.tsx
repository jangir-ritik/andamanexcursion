import React from "react";
import { Column, Section } from "@/components/layout";
import { DescriptionText } from "@/components/atoms";
import styles from "../page.module.css";

interface HeroSectionProps {
  destinationName: string;
  description: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  destinationName,
  description,
}) => {
  return (
    <Section className={styles.section}>
      <Column fullWidth className={styles.titleContainer}>
        <h1 className={styles.title}>
          Escape to <br />
          <span className={styles.highlight}>{destinationName}</span>
        </h1>
      </Column>
      <Column>
        <DescriptionText text={description} className={styles.description} />
      </Column>
    </Section>
  );
};
