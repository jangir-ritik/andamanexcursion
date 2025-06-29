import { Section } from "@/components/layout";
import { LargeCard } from "@/components/molecules";
import React from "react";
import scubaDiving from "@public/images/homepage/scubaDivingCTA/diver.png";

function ScubaDiving() {
  return (
    <Section>
      <LargeCard
        subtitle="Scuba Diving"
        title="Dive Beneath Waves, Discover Hidden Worlds"
        // description="Dive Beneath Waves, Discover Hidden Worlds"
        image={scubaDiving.src}
        imageAlt="Scuba Diving"
        ctaText="View Details"
        ctaHref="/scuba-diving"
      />
    </Section>
  );
}

export default ScubaDiving;
