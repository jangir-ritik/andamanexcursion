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
          {content.activities.map((activity) => (
            <SmallCard
              key={activity.id}
              image={activity.media.featuredImage as Media}
              title={activity.title}
              description={activity.coreInfo.description}
              href={`/activities/search`}
            />
          ))}
        </Grid>
      </Column>
    </Section>
  );
}
