import React from "react";
import Image from "next/image";
import { Column, Row, Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { partnersContent } from "./Partners.content";

export const Partners = () => {
  return (
    <Section id="partners" aria-labelledby="partners-title">
      <Column fullWidth gap="var(--space-12)" alignItems="center">
        <SectionTitle
          text={partnersContent.title}
          specialWord={partnersContent.specialWord}
          id="partners-title"
        />
        <Row
          justifyContent="between"
          alignItems="center"
          fullWidth
          gap="var(--space-8)"
          wrap
        >
          {partnersContent.partners.map((partner, index) => (
            <Image
              key={index}
              src={partner}
              alt={`${partnersContent.partnersAlt[index]} - Partner logo`}
              width={150}
              height={60}
              style={{ height: "auto", objectFit: "contain" }}
            />
          ))}
        </Row>
      </Column>
    </Section>
  );
};
