import { DescriptionText } from "@/components/atoms/DescriptionText";
import { ImageContainer } from "@/components/atoms/ImageContainer";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { Column, Row, Section } from "@/components/layout";
import styles from "./Story.module.css";
import React from "react";
import { storyContent } from "./Story.content";

function Story() {
  return (
    <Section fullBleed backgroundColor="light" spacing="5">
      <Column gap="var(--gap-6)" fullWidth className={styles.sectionContainer}>
        <Row fullWidth alignItems="center" justifyContent="between">
          <SectionTitle
            text={storyContent.title}
            specialWord={storyContent.specialWord}
          />
          <DescriptionText text={storyContent.description} align="center" />
        </Row>
        <Row fullWidth justifyContent="center" alignItems="center">
          <ImageContainer
            src={storyContent.image}
            alt={storyContent.imageAlt}
            className={styles.image}
          />
        </Row>
      </Column>
    </Section>
  );
}

export default Story;
