"use client";

import React from "react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Row } from "@/components/layout/Row";
import { Column } from "@/components/layout/Column";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { DescriptionText } from "@/components/atoms/DescriptionText";
import { SmallCard } from "@/components/molecules/Cards/SmallCard";
import styles from "./page.module.css";

const FamilyToursPage = () => {
  const packages = [
    {
      id: "family-adventure",
      title: "Family Adventure Package",
      image: "/images/homepage/perfectlyDesignedPackages/familyFiesta.png",
      imageAlt: "Family Adventure Package",
      duration: "6 Days / 5 Nights",
      price: "₹25,999",
      href: "/packages/family-tours/family-adventure",
    },
    {
      id: "kids-special",
      title: "Kids Special Package",
      image: "/images/homepage/perfectlyDesignedPackages/familyFiesta.png",
      imageAlt: "Kids Special Package",
      duration: "4 Days / 3 Nights",
      price: "₹19,999",
      href: "/packages/family-tours/kids-special",
    },
    {
      id: "multi-generation",
      title: "Multi-Generation Family Package",
      image: "/images/homepage/perfectlyDesignedPackages/familyFiesta.png",
      imageAlt: "Multi-Generation Family Package",
      duration: "7 Days / 6 Nights",
      price: "₹32,999",
      href: "/packages/family-tours/multi-generation",
    },
    {
      id: "educational-tour",
      title: "Educational Family Tour",
      image: "/images/homepage/perfectlyDesignedPackages/familyFiesta.png",
      imageAlt: "Educational Family Tour",
      duration: "5 Days / 4 Nights",
      price: "₹22,999",
      href: "/packages/family-tours/educational-tour",
    },
  ];

  return (
    <main>
      <Section className={styles.packagesSection}>
        <Container>
          <Column gap="var(--gap-4)">
            <SectionTitle
              text="Family Tour Packages"
              specialWord="Family"
              className={styles.title}
            />
            <DescriptionText
              text="Create lasting memories with your family in the beautiful Andaman Islands. Our family packages are designed with activities for all ages to enjoy together."
              align="center"
            />
            <Row gap="var(--gap-4)" className={styles.packagesGrid}>
              {packages.map((pkg) => (
                <SmallCard
                  key={pkg.id}
                  title={pkg.title}
                  image={pkg.image}
                  imageAlt={pkg.imageAlt}
                  duration={pkg.duration}
                  price={pkg.price}
                  href={pkg.href}
                />
              ))}
            </Row>
          </Column>
        </Container>
      </Section>
    </main>
  );
};

export default FamilyToursPage;
