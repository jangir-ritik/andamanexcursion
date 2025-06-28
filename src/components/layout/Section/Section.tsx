import React from "react";
import styles from "./Section.module.css";
import { Column } from "../Column";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  backgroundColor?: "white" | "light" | "primary" | "secondary";
  spacing?: "0" | "4" | "5" | "10";
  fullWidth?: boolean;
  noPadding?: boolean;
}

export const Section = ({
  children,
  className = "",
  id,
  backgroundColor = "white",
  spacing = "0",
  fullWidth = false,
  noPadding = false,
}: SectionProps) => {
  const sectionClasses = [
    styles.section,
    styles[`bg-${backgroundColor}`],
    styles[`spacing-${spacing}`],
    noPadding && styles.noPadding,
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <section className={sectionClasses} id={id}>
      <Column fullWidth={fullWidth} className={styles.content}>
        {children}
      </Column>
    </section>
  );
};
