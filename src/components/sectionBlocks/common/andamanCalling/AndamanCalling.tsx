import { Section } from "@/components/layout";
import { LargeCard } from "@/components/molecules";
import React from "react";
import styles from "./AndamanCalling.module.css";
import { andamanCallingContent } from "./AndamanCalling.content";
import type { AndamanCallingProps } from "./AndamanCalling.types";

export const AndamanCalling = ({
  className,
  id = "andaman-calling",
}: AndamanCallingProps = {}) => {
  const { image, imageAlt, title, ctaHref, ctaText } = andamanCallingContent;

  return (
    <Section
      className={`${styles.andamanCalling} ${className || ""}`}
      id={id}
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
};
