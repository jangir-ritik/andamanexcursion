import { Section } from "@/components/layout";
import { LargeCard } from "@/components/molecules";
import React from "react";
import { scubaDivingContent } from "./ScubaDiving.content";
import { ScubaDivingProps } from "./ScubaDiving.types";

function ScubaDiving({
  className,
  id = "scuba-diving",
}: ScubaDivingProps = {}) {
  const { subtitle, title, image, imageAlt, ctaText, ctaHref } =
    scubaDivingContent;

  return (
    <Section id={id} aria-label="Scuba Diving Experience" className={className}>
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
