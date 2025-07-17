import React from "react";
import { Column, Section } from "@/components/layout";
import { ImageContainer, SectionTitle } from "@/components/atoms";
import { PartnerIteration, PartnersProps } from "./Partners.types";
import styles from "./Partners.module.css";

export const Partners = ({ content }: PartnersProps) => {
  const { title, specialWord, partners } = content;

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
          {partners.map((partner: PartnerIteration, index) => (
            <div key={index} className={styles.partnerLogo}>
              <ImageContainer
                src={partner.partner}
                alt={`${partner.alt[index]} - Partner logo`}
                aspectRatio="square"
                fullWidth
              />
            </div>
          ))}
        </div>
      </Column>
    </Section>
  );
};
