import React from "react";
import { Section, Column, Grid } from "@/components/layout";
import {
  SectionTitle,
  DescriptionText,
  ImageContainer,
} from "@/components/atoms";
import { SmallCard } from "@/components/molecules/Cards";
import { activityCategoryService } from "@/services/payload/collections/navigation";
import { BookingForm } from "@/components/organisms";
import styles from "./page.module.css";
import { Media } from "@payload-types";

// Import hero image
import activitiesHeroImage from "@public/media/activities-hero.png";

const ActivitiesPage = async () => {
  // Fetch active activity categories
  const categories = await activityCategoryService.getAll();

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <Section noPadding id="hero">
        <Column gap="var(--space-8)" fullWidth>
          <ImageContainer
            src={activitiesHeroImage.src}
            alt="Explore water activities in Andaman Islands"
            aspectRatio="banner"
            priority
            fullWidth
          />
          <BookingForm initialTab="activities" />
        </Column>
      </Section>

      {/* Activity Categories Section */}
      <Section id="activity-categories" noPadding>
        <Column
          gap={3}
          alignItems="start"
          justifyContent="start"
          fullWidth
          responsive
          responsiveGap="var(--space-4)"
          responsiveAlignItems="start"
        >
          <SectionTitle
            text="Explore the Best Water Activities in Andaman"
            specialWord="Activities"
            id="activities-title"
          />
          <DescriptionText text="From snorkeling in coral gardens to jet skiing across blue horizons, your adventure begins here. Choose your adventure category to discover all available activities." />

          <Grid
            columns={{ desktop: 3, tablet: 2, mobile: 1 }}
            gap={3}
            role="grid"
            ariaLabel="Activity categories"
          >
            {categories.map((category) => (
              <SmallCard
                key={category.id}
                image={category.icon as Media}
                imageAlt={`${category.name} activities`}
                title={category.name}
                description={
                  category.description ||
                  `Discover amazing ${category.name.toLowerCase()} experiences in Andaman`
                }
                href={`/activities/search?activityType=${category.slug}`}
              />
            ))}
          </Grid>
        </Column>
      </Section>
    </main>
  );
};

export default ActivitiesPage;
