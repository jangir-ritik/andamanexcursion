import { HeroTitle } from "@/components/atoms/HeroTitle";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import styles from "./page.module.css";
import { BookingForm } from "@/components/organisms/BookingForm";
import { DescriptionText } from "@/components/atoms/DescriptionText";
import { Row } from "@/components/layout/Row";
import { Column } from "@/components/layout/Column";
import { Section } from "@/components/layout";
import { ImageContainer } from "@/components/atoms/ImageContainer";
import { SmallCard, MediumCard, LargeCard } from "@/components/molecules/Cards";
import heroImage from "@public/images/placeholder.png";
import { Button } from "@/components/atoms/Button/Button";
import Link from "next/link";

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

          {/* Package cards */}
          <div className={styles.cardsContainer}>
            <SmallCard
              image="/images/placeholder.png"
              imageAlt="Serene Shores"
              title="Serene Shores"
              duration="3 Days, 4 Nights"
              price="Starting @₹1,520"
            />

            <Link href="/activities/fishing" style={{ textDecoration: "none" }}>
              <MediumCard
                image="/images/placeholder.png"
                imageAlt="Fishing Experience"
                title="Fishing"
                description="Set sail with local fishermen and experience the thrill of fishing as the sun rises over crystal-clear waters."
                badge="Most Viewed"
                badgeIcon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
                      fill="#000000"
                    />
                  </svg>
                }
              />
            </Link>

            <LargeCard
              image="/images/placeholder.png"
              imageAlt="Scuba Diving Experience"
              subtitle="Scuba Diving"
              title="Dive Beneath Waves, Discover Hidden Worlds"
              description="Explore vibrant coral reefs and encounter exotic marine life in the crystal-clear waters of the Andaman Sea."
              ctaText="View Details"
              ctaHref="/activities/scuba-diving"
            />
          </div>
        </Column>
      </Section>
    </>
  );
}
