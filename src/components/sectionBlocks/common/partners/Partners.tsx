import React from "react";
import Image from "next/image";
import { Column, Row, Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { PartnersProps } from "./Partners.types";

export const Partners = ({ content }: PartnersProps) => {
  const { title, specialWord, partners, partnersAlt } = content;

  return (
    <Section id="partners" aria-labelledby="partners-title">
      <Column fullWidth gap="var(--space-12)" alignItems="center">
        <SectionTitle
          text={title}
          specialWord={specialWord}
          id="partners-title"
        />
        <Row
          justifyContent="between"
          alignItems="center"
          fullWidth
          gap="var(--space-8)"
          wrap
        >
          {partners.map((partner, index) => (
            <Image
              key={index}
              src={partner}
              alt={`${partnersAlt[index]} - Partner logo`}
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
