import { Section, Column, Row } from "@/components/layout";
import type { BannerProps } from "./Banner.types";
import { HeroTitle, DescriptionText, ImageContainer } from "@/components/atoms";
import { cn } from "@/utils/cn";

import styles from "./Banner.module.css";
import { UnifiedSearchingForm } from "@/components/organisms";

export const Banner = ({ className, id = "hero", content }: BannerProps) => {
  return (
    <Section
      noPadding
      id={id}
      className={cn(styles.sectionContainer, className)}
      aria-labelledby="hero-title"
    >
      <Column
        gap="var(--space-8)"
        fullWidth
        responsive
        responsiveAlignItems="start"
        responsiveGap="var(--space-4)"
        alignItems="center"
      >
        <Row
          justifyContent="between"
          alignItems="center"
          gap="var(--space-4)"
          fullWidth
          wrap
        >
          {content.title && (
            <HeroTitle
              primaryText={content.title}
              secondaryText={content.subtitle || ""}
              id="hero-title"
            />
          )}
          {content.description && (
            <DescriptionText
              text={content.description || ""}
              className={`${styles.descriptionText} ${styles.heroDescription}`}
              align="right"
            />
          )}
        </Row>
        <ImageContainer
          className={styles.heroImage}
          src={content.image}
          alt={content.image?.alt || ""}
          aspectRatio="banner"
          priority
          fullWidth
        />

        <UnifiedSearchingForm initialTab={content.initialTab} />
      </Column>
    </Section>
  );
};
