import React from "react";
import { Section } from "@/components/layout/Section/Section";
import { Column } from "@/components/layout/Column/Column";
import { Row } from "@/components/layout/Row/Row";
import { SectionTitle } from "@/components/atoms/SectionTitle/SectionTitle";
import { Button } from "@/components/atoms/Button/Button";
import { SmallCard } from "@/components/molecules/Cards/SmallCard/SmallCard";
import { packages } from "./Packages.content";

export const Packages = () => {
  return (
    <Section id="packages" aria-labelledby="packages-title">
      <Column gap="var(--space-10)" fullWidth>
        <Row
          justifyContent="between"
          alignItems="center"
          gap="var(--space-4)"
          fullWidth
        >
          <SectionTitle
            specialWord="Packages"
            text="Our Perfectly Designed Packages for You!"
            id="packages-title"
          />
          <Row justifyContent="end">
            <Button href="/packages" ariaLabel="View all packages" showArrow>
              View All
            </Button>
          </Row>
        </Row>

        {/* Package cards */}
        <Row gap="var(--space-8)" justifyContent="between" wrap>
          {packages.map((item, index) => (
            <SmallCard
              key={index}
              image={item.image.src}
              imageAlt={item.imageAlt}
              title={item.title}
              duration={item.duration}
              price={item.price}
              href={item.href}
            />
          ))}
        </Row>
      </Column>
    </Section>
  );
};
