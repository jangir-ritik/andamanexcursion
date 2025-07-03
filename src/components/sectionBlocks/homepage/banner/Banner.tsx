import { Section } from "@/components/layout/Section/Section";
import { Column } from "@/components/layout/Column/Column";
import { Row } from "@/components/layout/Row/Row";
import { HeroTitle } from "@/components/atoms/HeroTitle/HeroTitle";
import { DescriptionText } from "@/components/atoms/DescriptionText/DescriptionText";
import { BookingForm } from "@/components/organisms/BookingForm/BookingForm";
import { ImageContainer } from "@/components/atoms/ImageContainer/ImageContainer";
import styles from "./Banner.module.css";
import { content } from "./Banner.content";
import type { BannerProps  } from "./Banner.types";

export const Banner = ({ className, id = "hero" }: BannerProps = {}) => {
  return (
    <Section
      noPadding
      id={id}
      className={`${styles.sectionContainer} ${className || ""}`}
      aria-labelledby="hero-title"
    >
      <Column gap="var(--gap-4)" fullWidth>
        <Row
          justifyContent="between"
          alignItems="center"
          gap="var(--gap-2)"
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
