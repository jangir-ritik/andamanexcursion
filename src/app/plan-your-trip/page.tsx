"use client";

import { LargeCardSection } from "@/components/sectionBlocks/common";
import { TripPlanningForm } from "./components/TripPlanningForm";
import { Container } from "@/components/layout";
import andamanCallingImage from "@public/images/homepage/andamanCalling/image.png";
import styles from "./page.module.css";

function page() {
  return (
    <Container noPadding className={styles.container}>
      <TripPlanningForm />
      <LargeCardSection
        content={{
          subtitle: "Water Adventures In Andaman",
          title: "Dive Beneath Waves, Discover Hidden Worlds",
          ctaText: "View Details",
          ctaHref: "/activities",
          image: andamanCallingImage.src,
          imageAlt: "Plan Your Trip",
        }}
      />
    </Container>
  );
}

export default page;
