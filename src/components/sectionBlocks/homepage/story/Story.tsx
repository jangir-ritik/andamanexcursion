import React from "react";
import { Column, Row, Section } from "@/components/layout";
import {
  DescriptionText,
  ImageContainer,
  SectionTitle,
} from "@/components/atoms";
import { storyContent } from "./Story.content";
import styles from "./Story.module.css";

export const Story = () => {
  return (
    <Section
      fullBleed
      backgroundColor="light"
      spacing="5"
      id="our-story"
      aria-labelledby="story-title"
    >
      <Column
        gap="var(--space-12)"
        fullWidth
        className={styles.sectionContainer}
      >
        <Row fullWidth alignItems="center" justifyContent="between">
          <SectionTitle
            text={storyContent.title}
            specialWord={storyContent.specialWord}
            id="story-title"
          />
          <DescriptionText text={storyContent.description} align="center" />
        </Row>
        <Row fullWidth justifyContent="center" alignItems="center">
          <ImageContainer
            src={storyContent.image}
            alt="Scenic view of Andaman Islands coastline with pristine beaches and crystal clear waters"
            className={styles.image}
          />
        </Row>
      </Column>
    </Section>
  );
};
