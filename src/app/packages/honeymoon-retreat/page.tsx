"use client";

import React from "react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Row } from "@/components/layout/Row";
import { Column } from "@/components/layout/Column";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { DescriptionText } from "@/components/atoms/DescriptionText";
import { SmallCard } from "@/components/molecules/Cards/SmallCard";
import { FAQ } from "@/components/sectionBlocks/common/faq";
import styles from "./page.module.css";

const HoneymoonRetreatPage = () => {
  const packages = [
    {
      id: "romantic-sunset",
      title: "Romantic Sunset Cruise",
      image: "/images/homepage/perfectlyDesignedPackages/honeymoonWhispers.png",
      imageAlt: "Romantic Sunset Cruise",
      duration: "3 Days / 2 Nights",
      price: "₹15,999",
      href: "/packages/honeymoon-retreat/romantic-sunset",
    },
    {
      id: "private-beach",
      title: "Private Beach Getaway",
      image: "/images/homepage/perfectlyDesignedPackages/honeymoonWhispers.png",
      imageAlt: "Private Beach Getaway",
      duration: "5 Days / 4 Nights",
      price: "₹24,999",
      href: "/packages/honeymoon-retreat/private-beach",
    },
    {
      id: "luxury-island",
      title: "Luxury Island Hopping",
      image: "/images/homepage/perfectlyDesignedPackages/honeymoonWhispers.png",
      imageAlt: "Luxury Island Hopping",
      duration: "7 Days / 6 Nights",
      price: "₹35,999",
      href: "/packages/honeymoon-retreat/luxury-island",
    },
  ];

  // Package-specific FAQ content
  const packageFAQContent = {
    title: "Honeymoon Package FAQ",
    specialWord: "FAQ",
    items: [
      {
        question: "What accommodations are included in the honeymoon package?",
        answer:
          "Our honeymoon package includes luxury accommodations at 4-5 star resorts on Havelock and Neil Islands, with special romantic setups and ocean view rooms where available.",
      },
      {
        question: "Are romantic dinners included in the package?",
        answer:
          "Yes, the package includes two special candlelit dinners - one on the beach and one at a premium restaurant, with customized menus and complimentary wine.",
      },
      {
        question: "What activities are included for couples?",
        answer:
          "The package includes couples' activities such as a private sunset cruise, couples' spa treatments, guided snorkeling tours, and a professional photoshoot at scenic locations.",
      },
      {
        question: "Is airport/port transfer included?",
        answer:
          "Yes, all transfers between airports, hotels, and ferry ports are included with private air-conditioned vehicles and priority boarding on ferries where possible.",
      },
      {
        question: "Can we customize the honeymoon package?",
        answer:
          "Absolutely! We can customize any aspect of the package to suit your preferences, whether it's adding more adventure activities, extending your stay, or arranging special surprises.",
      },
    ],
  };

  return (
    <main className={styles.main}>
      <Section className={styles.packagesSection}>
        <Container>
          <Column gap="var(--gap-4)">
            <SectionTitle
              text="Honeymoon Retreat Packages"
              specialWord="Honeymoon"
              className={styles.title}
            />
            <DescriptionText
              text="Create unforgettable memories with your loved one in the breathtaking Andaman Islands. Our honeymoon packages are designed to give you the perfect romantic getaway."
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

      {/* Reusable FAQ component with package-specific content */}
      <FAQ
        title={packageFAQContent.title}
        specialWord={packageFAQContent.specialWord}
        items={packageFAQContent.items}
        className={styles.faqSection}
      />
    </main>
  );
};

export default HoneymoonRetreatPage;

// Yes I like the honeymoon packages FAQ implementation
// Now replace the curernt FAQ implementation on homepage and packages page with this updated API
// Move scubadiving, andamanCalling and testimonials components to common (make sure to extract any context out and put in the respective content file of that endpoint
