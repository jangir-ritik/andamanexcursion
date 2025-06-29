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
  fullBleed?: boolean;
  ariaLabelledby?: string;
}

export const Section = ({
  children,
  className = "",
  id,
  backgroundColor = "white",
  spacing = "0",
  fullWidth = false,
  noPadding = false,
  fullBleed = false,
  ariaLabelledby,
}: SectionProps) => {
  const sectionClasses = [
    styles.section,
    styles[`bg-${backgroundColor}`],
    styles[`spacing-${spacing}`],
    noPadding && styles.noPadding,
    fullBleed && styles.fullBleed,
    className,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <section
      className={sectionClasses}
      id={id}
      aria-labelledby={ariaLabelledby}
    >
      <Column
        fullWidth={fullWidth || fullBleed}
        className={fullBleed ? styles.fullBleedContent : styles.content}
      >
        {children}
      </Column>
    </section>
  );
};
