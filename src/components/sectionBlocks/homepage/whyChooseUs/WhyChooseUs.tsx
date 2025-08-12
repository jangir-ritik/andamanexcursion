"use client";

import React from "react";
import { Column, Row, Section } from "@/components/layout";
import {
  DescriptionText,
  SectionTitle,
  Chip,
  ImageContainer,
  InlineLink,
} from "@/components/atoms";
import styles from "./WhyChooseUs.module.css";
import { WhyChooseUsProps } from "./WhyChooseUs.types";

export const WhyChooseUs = ({ content }: WhyChooseUsProps) => {
  const {
    title,
    specialWord,
    description,
    points,
    ctaHref,
    ctaText,
    image,
    imageAlt,
  } = content;

  return (
    <Section
      className={styles.whyChooseUsSection}
      id="why-choose-us"
      aria-labelledby="why-choose-us-title"
    >
      <Column
        gap="var(--space-10)"
        className={styles.sectionContainer}
        responsive
        responsiveAlignItems="start"
        responsiveGap="var(--space-4)"
      >
        <Row
          fullWidth
          alignItems="center"
          justifyContent="between"
          responsive
          responsiveAlignItems="start"
        >
          <SectionTitle
            className={styles.sectionTitle}
            text={title}
            specialWord={specialWord}
            id="why-choose-us-title"
          />
          <DescriptionText
            text={description}
            align="right"
            className={styles.headerDescription}
          />
        </Row>

        <Row
          fullWidth
          alignItems="center"
          justifyContent="between"
          gap="var(--space-20)"
          className={styles.contentRow}
          responsive
          responsiveAlignItems="start"
          responsiveGap="var(--space-4)"
        >
          <Column
            alignItems="start"
            gap="var(--space-8)"
            className={styles.pointsColumn}
            responsive
            responsiveAlignItems="start"
            responsiveGap="var(--space-4)"
          >
            {points.map((item) => (
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
              href={ctaHref}
              ariaLabel={`${ctaText} about why choose Andaman Excursion`}
              icon="arrow-up-right"
              color="primary"
              className={styles.ctaLink}
            >
              {ctaText}
            </InlineLink>
          </Column>

          <Column
            className={styles.imageContainer}
            alignItems="end"
            gap="var(--space-8)"
            responsive
            responsiveAlignItems="end"
            responsiveGap="var(--space-4)"
          >
            <ImageContainer
              src={image}
              alt={imageAlt}
              className={styles.featureImage}
            />
            <div className={styles.customerSatisfactionChip} aria-hidden="true">
              <Chip
                icon="/icons/misc/smilie.svg"
                text="Customer Satisfaction"
                className={styles.chip}
              />
            </div>

            <div className={styles.personalizedServiceChip} aria-hidden="true">
              <Chip
                icon="/icons/misc/star.svg"
                text="Personalized Service"
                className={styles.chip}
              />
            </div>

            <div className={styles.localExpertsChip} aria-hidden="true">
              <Chip
                icon="/icons/misc/crown.svg"
                text="Local Experts"
                className={styles.chip}
              />
            </div>
          </Column>
        </Row>
      </Column>
    </Section>
  );
};
