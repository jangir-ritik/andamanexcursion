import React from "react";
import { scubaDivingContent } from "./ScubaDiving.content";
import type { ScubaDivingProps } from "./ScubaDiving.types";
import { Section } from "@/components/layout";
import { LargeCard } from "@/components/molecules/Cards";

export const ScubaDiving = ({
  className,
  id = "scuba-diving",
}: ScubaDivingProps = {}) => {
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
};
