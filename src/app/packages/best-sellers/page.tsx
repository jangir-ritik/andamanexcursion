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

const BestSellersPage = () => {
  const packages = [
    {
      id: "andaman-explorer",
      title: "Andaman Explorer",
      image: "/images/homepage/perfectlyDesignedPackages/sereneShores.png",
      imageAlt: "Andaman Explorer Package",
      duration: "5 Days / 4 Nights",
      price: "₹18,999",
      href: "/packages/best-sellers/andaman-explorer",
    },
    {
      id: "island-hopping",
      title: "Island Hopping Adventure",
      image: "/images/homepage/perfectlyDesignedPackages/sereneShores.png",
      imageAlt: "Island Hopping Adventure Package",
      duration: "6 Days / 5 Nights",
      price: "₹22,999",
      href: "/packages/best-sellers/island-hopping",
    },
    {
      id: "scuba-special",
      title: "Scuba Diving Special",
      image: "/images/homepage/perfectlyDesignedPackages/sereneShores.png",
      imageAlt: "Scuba Diving Special Package",
      duration: "4 Days / 3 Nights",
      price: "₹20,999",
      href: "/packages/best-sellers/scuba-special",
    },
    {
      id: "beach-retreat",
      title: "Beach Retreat",
      image: "/images/homepage/perfectlyDesignedPackages/sereneShores.png",
      imageAlt: "Beach Retreat Package",
      duration: "3 Days / 2 Nights",
      price: "₹14,999",
      href: "/packages/best-sellers/beach-retreat",
    },
  ];

  return (
    <main>
      <Section className={styles.packagesSection}>
        <Container>
          <Column gap="var(--gap-4)">
            <SectionTitle
              text="Our Best Selling Packages"
              specialWord="Best Selling"
              className={styles.title}
            />
            <DescriptionText
              text="Discover our most popular packages loved by travelers. These carefully curated experiences offer the best of the Andaman Islands at great value."
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

export default BestSellersPage;
