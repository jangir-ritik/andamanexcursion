import React from "react";
import type { LargeCardSectionProps } from "./LargeCardSection.types";
import { Section } from "@/components/layout";
import { LargeCard } from "@/components/molecules/Cards";

export const LargeCardSection = ({
  className,
  id = "large-card-section",
  ariaLabel = "Large Card Section",
  subtitle,
  title,
  image,
  imageAlt,
  ctaText,
  ctaHref,
}: LargeCardSectionProps) => {
  return (
    <Section id={id} aria-label={ariaLabel} className={className}>
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
