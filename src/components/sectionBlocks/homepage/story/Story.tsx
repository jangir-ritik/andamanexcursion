import React from "react";
import { Column, Row, Section } from "@/components/layout";
import {
  DescriptionText,
  ImageContainer,
  SectionTitle,
} from "@/components/atoms";
import styles from "./Story.module.css";
import { StoryProps } from "./Story.types";

export const Story = ({ content }: StoryProps) => {
  const { title, specialWord, description, image, imageAlt } = content;

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
            text={title}
            specialWord={specialWord}
            id="story-title"
          />
          <DescriptionText text={description} align="center" />
        </Row>
        <Row fullWidth justifyContent="center" alignItems="center">
          <ImageContainer
            src={image}
            alt={imageAlt}
            className={styles.image}
          />
        </Row>
      </Column>
    </Section>
  );
};
