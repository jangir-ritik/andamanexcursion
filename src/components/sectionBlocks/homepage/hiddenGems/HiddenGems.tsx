import { DescriptionText } from "@/components/atoms/DescriptionText";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { Column, Row, Section } from "@/components/layout";
import React from "react";
import styles from "./HiddenGems.module.css";
import { Button } from "@/components/atoms/Button/Button";
import Image from "next/image";
import { hiddenGemsContent } from "./HiddenGems.content";
import Link from "next/link";

function HiddenGems() {
  const { title, specialWord, description, ctaText, ctaHref, images } =
    hiddenGemsContent;

  return (
    <Section
      backgroundColor="light"
      spacing="5"
      fullBleed
      className={styles.hiddenGemsSection}
      id="hidden-gems"
      aria-labelledby="hidden-gems-title"
    >
      <Row
        justifyContent="between"
        fullWidth
        className={styles.hiddenGemsRow}
        wrap
        gap="var(--gap-10)"
      >
        <Column gap="var(--gap-4)" alignItems="start">
          <SectionTitle
            text={title}
            specialWord={specialWord}
            className={styles.sectionTitle}
            id="hidden-gems-title"
          />
          <DescriptionText text={description} />
          <Link href={ctaHref}>
            <Button showArrow>{ctaText}</Button>
          </Link>
        </Column>
        <Column>
          <Row gap="var(--gap-3)">
            <Column fullWidth>
              <Image src={images.island1.src} alt={images.island1.alt} />
            </Column>
            <Column fullWidth fullHeight gap="var(--gap-3)">
              <Image src={images.island2.src} alt={images.island2.alt} />
              <Image src={images.island3.src} alt={images.island3.alt} />
            </Column>
          </Row>
        </Column>
      </Row>
    </Section>
  );
}

export default HiddenGems;
