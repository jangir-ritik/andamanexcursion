"use client";

import { DescriptionText } from "@/components/atoms/DescriptionText";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { Column, Row, Section } from "@/components/layout";
import React from "react";
import styles from "./WhyChooseUs.module.css";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Chip } from "@/components/atoms/Chip";
import { ImageContainer } from "@/components/atoms/ImageContainer";
import { whyChooseUsContent } from "./WhyChooseUs.content";

function WhyChooseUs() {
  return (
    <Section className={styles.whyChooseUsSection}>
      <Column gap="var(--gap-5)" className={styles.sectionContainer}>
        <Row fullWidth alignItems="center" justifyContent="between">
          <SectionTitle
            className={styles.sectionTitle}
            text={whyChooseUsContent.title}
            specialWord={whyChooseUsContent.specialWord}
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
                <h3 className={styles.pointTitle}>{item.title}</h3>
                <p className={styles.pointDescription}>{item.description}</p>
              </div>
            ))}
            <Link href={whyChooseUsContent.ctaHref} className={styles.ctaLink}>
              {whyChooseUsContent.ctaText}
              <ArrowUpRight />
            </Link>
          </Column>

          <Column
            className={styles.imageContainer}
            alignItems="end"
            gap="var(--gap-4)"
          >
            <ImageContainer
              src={whyChooseUsContent.image}
              alt={whyChooseUsContent.imageAlt}
              className={styles.featureImage}
            />
            <div className={styles.customerSatisfactionChip}>
              <Chip
                icon="/icons/misc/smilie.svg"
                text="Customer Satisfaction"
              />
            </div>

            <div className={styles.personalizedServiceChip}>
              <Chip icon="/icons/misc/star.svg" text="Personalized Service" />
            </div>

            <div className={styles.localExpertsChip}>
              <Chip icon="/icons/misc/crown.svg" text="Local Experts" />
            </div>
          </Column>
        </Row>
      </Column>
    </Section>
  );
}

export default WhyChooseUs;
