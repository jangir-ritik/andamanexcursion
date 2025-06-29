import { DescriptionText } from "@/components/atoms/DescriptionText";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { Column, Row, Section } from "@/components/layout";
import { Carousel } from "@/components/molecules/Carousel";
import {
  packageCarouselContent,
  sectionContent,
} from "./PackageCarousel.content";
import styles from "./PackageCarousel.module.css";
import React from "react";

function PackageCarousel() {
  return (
    <Section className={styles.packageCarouselSection}>
      <Column fullWidth gap="var(--gap-5)">
        <Row fullWidth justifyContent="between">
          <SectionTitle specialWord="Package" text={sectionContent.title} />
          <DescriptionText text={sectionContent.description} align="right" />
        </Row>
        <Row fullWidth>
          <Carousel slides={packageCarouselContent.slides} />
        </Row>
      </Column>
    </Section>
  );
}

export default PackageCarousel;
