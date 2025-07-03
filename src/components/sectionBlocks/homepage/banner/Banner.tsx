import { content } from "./Banner.content";
import { Section, Column, Row } from "@/components/layout";
import type { BannerProps } from "./Banner.types";
import { HeroTitle, DescriptionText, ImageContainer } from "@/components/atoms";
import { BookingForm } from "@/components/organisms";

import styles from "./Banner.module.css";

export const Banner = ({ className, id = "hero" }: BannerProps = {}) => {
  return (
    <Section
      noPadding
      id={id}
      className={`${styles.sectionContainer} ${className || ""}`}
      aria-labelledby="hero-title"
    >
      <Column gap="var(--space-8)" fullWidth>
        <Row
          justifyContent="between"
          alignItems="center"
          gap="var(--space-4)"
          fullWidth
          wrap
        >
          <HeroTitle
            primaryText={content.title}
            secondaryText={content.subtitle}
            id="hero-title"
          />
          <DescriptionText
            text={content.description}
            className={`${styles.descriptionText} ${styles.heroDescription}`}
            align="right"
          />
        </Row>

        <ImageContainer
          src={content.image}
          alt={content.imageAlt}
          aspectRatio="banner"
          priority
          fullWidth
        />

        <BookingForm />
      </Column>
    </Section>
  );
};
