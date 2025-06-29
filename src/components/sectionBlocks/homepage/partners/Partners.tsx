import { SectionTitle } from "@/components/atoms/SectionTitle";
import { Column, Row, Section } from "@/components/layout";
import Image from "next/image";
import React from "react";
import { partnersContent } from "./Partners.content";

function Partners() {
  return (
    <Section>
      <Column fullWidth gap="var(--gap-6)" alignItems="center">
        <SectionTitle
          text={partnersContent.title}
          specialWord={partnersContent.specialWord}
        />
        <Row
          justifyContent="between"
          alignItems="center"
          fullWidth
          gap="var(--gap-4)"
          wrap
        >
          {partnersContent.partners.map((partner, index) => (
            <Image
              key={index}
              src={partner}
              alt={partnersContent.partnersAlt[index]}
            />
          ))}
        </Row>
      </Column>
    </Section>
  );
}

export default Partners;
