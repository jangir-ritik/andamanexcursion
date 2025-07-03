"use client";

import { DescriptionText } from "@/components/atoms/DescriptionText/DescriptionText";
import { SectionTitle } from "@/components/atoms/SectionTitle/SectionTitle";
import { Column, Row, Section } from "@/components/layout";
import React from "react";
import styles from "./WhyChooseUs.module.css";
import { Chip } from "@/components/atoms/Chip/Chip";
import { ImageContainer } from "@/components/atoms/ImageContainer/ImageContainer";
import { whyChooseUsContent } from "./WhyChooseUs.content";
import { InlineLink } from "@/components/atoms/InlineLink/InlineLink";

export const WhyChooseUs = () => {
  return (
    <Section
      className={styles.whyChooseUsSection}
      id="why-choose-us"
      aria-labelledby="why-choose-us-title"
    >
      <Column gap="var(--gap-5)" className={styles.sectionContainer}>
        <Row fullWidth alignItems="center" justifyContent="between">
          <SectionTitle
            className={styles.sectionTitle}
            text={whyChooseUsContent.title}
            specialWord={whyChooseUsContent.specialWord}
            id="why-choose-us-title"
          />
          <DescriptionText
            text={whyChooseUsContent.description}
            align="right"
            className={styles.headerDescription}
          />
        </Row>

        <Row
          fullWidth
          alignItems="center"
          justifyContent="between"
          gap="var(--gap-10)"
          className={styles.contentRow}
        >
          <Column
            alignItems="start"
            gap="var(--gap-4)"
            className={styles.pointsColumn}
          >
            {whyChooseUsContent.points.map((item) => (
              <div key={item.id} className={styles.pointItem}>
                <h3 className={styles.pointTitle} id={`point-title-${item.id}`}>
                  {item.title}
                </h3>
                <p
                  className={styles.pointDescription}
                  aria-labelledby={`point-title-${item.id}`}
                >
                  {item.description}
                </p>
              </div>
            ))}
            <InlineLink
              href={whyChooseUsContent.ctaHref}
              ariaLabel={`${whyChooseUsContent.ctaText} about why choose Andaman Excursion`}
              icon="arrow-up-right"
              color="primary"
              className={styles.ctaLink}
            >
              {whyChooseUsContent.ctaText}
            </InlineLink>
          </Column>

          <Column
            className={styles.imageContainer}
            alignItems="end"
            gap="var(--gap-4)"
          >
            <ImageContainer
              src={whyChooseUsContent.image}
              alt="Features of Andaman Excursion services showing beautiful beaches and activities"
              className={styles.featureImage}
            />
            <div className={styles.customerSatisfactionChip} aria-hidden="true">
              <Chip
                icon="/icons/misc/smilie.svg"
                text="Customer Satisfaction"
              />
            </div>

            <div className={styles.personalizedServiceChip} aria-hidden="true">
              <Chip icon="/icons/misc/star.svg" text="Personalized Service" />
            </div>

            <div className={styles.localExpertsChip} aria-hidden="true">
              <Chip icon="/icons/misc/crown.svg" text="Local Experts" />
            </div>
          </Column>
        </Row>
      </Column>
    </Section>
  );
};
