import { Section } from "@/components/layout";
import { LargeCard } from "@/components/molecules";
import React from "react";
import styles from "./AndamanCalling.module.css";
import { andamanCallingContent } from "./AndamanCalling.content";

function AndamanCalling() {
  const { image, imageAlt, title, ctaHref, ctaText } = andamanCallingContent;

  return (
    <Section
      className={styles.andamanCalling}
      id="andaman-calling"
      aria-label="Andaman travel call to action"
    >
      <LargeCard
        image={image}
        imageAlt={imageAlt}
        title={title}
        ctaHref={ctaHref}
        ctaText={ctaText}
      />
    </Section>
  );
}

export default AndamanCalling;
