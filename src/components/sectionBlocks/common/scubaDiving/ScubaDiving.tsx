import { Section } from "@/components/layout";
import { LargeCard } from "@/components/molecules";
import React from "react";
import { scubaDivingContent } from "./ScubaDiving.content";
import { ScubaDivingProps } from "@/types/components/sectionBlocks";

function ScubaDiving({ className }: ScubaDivingProps = {}) {
  const { subtitle, title, image, imageAlt, ctaText, ctaHref } =
    scubaDivingContent;

  return (
    <Section
      id="scuba-diving"
      aria-label="Scuba Diving Experience"
      className={className}
    >
      <LargeCard
        subtitle={subtitle}
        title={title}
        image={image}
        imageAlt={imageAlt}
        ctaText={ctaText}
        ctaHref={ctaHref}
      />
    </Section>
  );
}

export default ScubaDiving;
