import { DescriptionText, SectionTitle } from "@/components/atoms";
import { Column, Grid, Section } from "@/components/layout";
import { SmallCard } from "@/components/molecules/Cards";
import React from "react";
import { Media } from "@payload-types";
import { TopActivitiesProps } from "./TopActivities.types";

export function TopActivities({ content }: TopActivitiesProps) {
  return (
    <Section id="activities" noPadding>
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
          text={content.title}
          specialWord={content.specialWord}
          id="activities-title"
        />
        <DescriptionText text={content.description} />
        <Grid
          columns={{ desktop: 3, tablet: 2, mobile: 1 }}
          gap={3}
          role="grid"
          ariaLabel="Available water activities"
        >
          {content.activities.map((activity) => {
            // Get the first category slug for navigation
            const categorySlug =
              Array.isArray(activity.coreInfo.category) &&
              activity.coreInfo.category.length > 0
                ? typeof activity.coreInfo.category[0] === "string"
                  ? activity.coreInfo.category[0]
                  : activity.coreInfo.category[0].slug
                : "water-activities"; // fallback

            return (
              <SmallCard
                key={activity.id}
                image={activity.media.featuredImage as Media}
                title={activity.title}
                description={activity.coreInfo.description}
                href={`/activities/search?activityType=${categorySlug}`}
                duration={activity.coreInfo.duration}
                price={activity.coreInfo.basePrice}
              />
            );
          })}
        </Grid>
      </Column>
    </Section>
  );
}
