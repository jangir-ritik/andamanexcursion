import React from "react";
import styles from "./SectionTitle.module.css";
import { SectionTitleProps } from "@/types/components/atoms/sectionTitle";

export const SectionTitle = ({ text, className }: SectionTitleProps) => {
  const titleClasses = [styles.sectionTitle, className || ""].join(" ").trim();

  return (
    <div className={titleClasses}>
      <h2 className={styles.title}>{text}</h2>
      <div className={styles.underline}></div>
    </div>
  );
};
