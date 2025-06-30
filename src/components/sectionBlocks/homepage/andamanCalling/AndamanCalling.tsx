import { Section } from "@/components/layout";
import { LargeCard } from "@/components/molecules";
import React from "react";
import andamanCallingImage from "@public/images/homepage/andamanCalling/image.png";
import styles from "./AndamanCalling.module.css";

function AndamanCalling() {
  return (
    <Section className={styles.andamanCalling}>
      <LargeCard
        image={andamanCallingImage.src}
        imageAlt="Andaman Calling"
        title="Andaman is Calling, Are You Ready?"
        ctaHref="/packages"
        ctaText="Explore Packages"
      />
    </Section>
  );
}

export default AndamanCalling;
