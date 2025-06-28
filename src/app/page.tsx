import { HeroTitle } from "@/components/atoms/HeroTitle";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import styles from "./page.module.css";
import { BookingForm } from "@/components/organisms/BookingForm";
import { DescriptionText } from "@/components/atoms/DescriptionText";
import { Row } from "@/components/layout/Row";
import { Column } from "@/components/layout/Column";
import { Section } from "@/components/layout";
import { ImageContainer } from "@/components/atoms/ImageContainer";
import heroImage from "@public/images/placeholder.png";
import { Button } from "@/components/atoms/Button/Button";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <Section spacing="4" noPadding id="hero">
        <Column gap="var(--gap-4)" fullWidth>
          <Row justifyContent="between" alignItems="center" fullWidth>
            <HeroTitle primaryText="Explore" secondaryText="Andaman!" />
            <DescriptionText
              text="Uncover pristine beaches, hidden adventures, and unforgettable sunsets across the Andaman Islands."
              className={styles.descriptionText}
              align="right"
            />
          </Row>

          <ImageContainer
            src={heroImage}
            alt="Beautiful Andaman Islands"
            aspectRatio="banner"
            priority
            fullWidth
          />

          <BookingForm />
        </Column>
      </Section>

      {/* Packages Section */}
      <Section spacing="5" id="packages">
        <Column gap="var(--gap-5)" fullWidth>
          <Row justifyContent="between" alignItems="center" fullWidth>
            <SectionTitle
              specialWord="Packages"
              text="Our Perfectly Designed Packages for You!"
            />
            <Row justifyContent="end">
              <Button>View All</Button>
            </Row>
          </Row>

          {/* Package cards will go here */}
          <Row gap={3} fullWidth wrap>
            {/* Package cards content */}
            <p>Package cards will be added here</p>
          </Row>
        </Column>
      </Section>
    </>
  );
}
