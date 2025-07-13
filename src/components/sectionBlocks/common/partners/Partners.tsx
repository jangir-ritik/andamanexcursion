import React from "react";
import Image from "next/image";
import { Column, Row, Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { PartnersProps } from "./Partners.types";
import styles from "./Partners.module.css";

export const Partners = ({ content }: PartnersProps) => {
  const { title, specialWord, partners, partnersAlt } = content;

  return (
    <Section id="partners" aria-labelledby="partners-title">
      <Column
        fullWidth
        gap="var(--space-12)"
        alignItems="center"
        responsive
        responsiveAlignItems="start"
        responsiveGap="var(--space-4)"
      >
        <SectionTitle
          text={title}
          specialWord={specialWord}
          id="partners-title"
        />
        <div className={styles.partnersGrid}>
          {partners.map((partner, index) => (
            <div key={index} className={styles.partnerLogo}>
              <Image
                src={partner}
                alt={`${partnersAlt[index]} - Partner logo`}
                width={150}
                height={60}
                style={{ objectFit: "contain" }}
              />
            </div>
          ))}
        </div>
      </Column>
    </Section>
  );
};
