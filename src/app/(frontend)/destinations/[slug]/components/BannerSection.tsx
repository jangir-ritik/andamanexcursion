import React from "react";
import { Column, Section } from "@/components/layout";
import { ImageContainer } from "@/components/atoms";

interface BannerSectionProps {
  image: string;
  imageAlt: string;
}

export const BannerSection: React.FC<BannerSectionProps> = ({
  image,
  imageAlt,
}) => {
  return (
    <Section>
      <Column gap="var(--space-8)" fullWidth>
        <ImageContainer
          src={image}
          alt={imageAlt}
          aspectRatio="banner"
          priority
          fullWidth
        />
      </Column>
    </Section>
  );
};
