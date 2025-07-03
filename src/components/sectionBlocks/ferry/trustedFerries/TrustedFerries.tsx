import React from "react";
import { Section, Column, Row } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { SmallCard } from "@/components/molecules/Cards";
import { ferries } from "./TrustedFerries.content";

export const TrustedFerries = () => {
  return (
    <Section id="trusted-ferries" aria-labelledby="trusted-ferries-title">
      <Column gap="var(--space-10)" fullWidth>
        <Row
          justifyContent="between"
          alignItems="center"
          gap="var(--space-4)"
          fullWidth
        >
          <SectionTitle
            specialWord="Trusted Ferries"
            text="Our Most Trusted Ferries"
            id="trusted-ferries-title"
          />
          <Row justifyContent="end"></Row>
        </Row>

        {/* Package cards */}
        <Row gap="var(--space-8)" justifyContent="between" wrap>
          {ferries.map((item, index) => (
            <SmallCard
              key={index}
              image={item.image.src}
              imageAlt={item.imageAlt}
              title={item.title}
              rating={item.rating}
              price={item.price}
              href={item.href}
            />
          ))}
        </Row>
      </Column>
    </Section>
  );
};
