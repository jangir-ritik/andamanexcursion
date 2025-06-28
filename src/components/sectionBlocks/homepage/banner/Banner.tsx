import { Section } from "@/components/layout/Section/Section";
import { Column } from "@/components/layout/Column/Column";
import { Row } from "@/components/layout/Row/Row";
import { HeroTitle } from "@/components/atoms/HeroTitle/HeroTitle";
import { DescriptionText } from "@/components/atoms/DescriptionText/DescriptionText";
import { BookingForm } from "@/components/organisms/BookingForm/BookingForm";
import { ImageContainer } from "@/components/atoms/ImageContainer/ImageContainer";
import styles from "./Banner.module.css";
import { content } from "./Banner.content";

export const Banner = () => {
  return (
    <Section noPadding id="hero">
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
