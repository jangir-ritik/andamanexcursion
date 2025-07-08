import React from "react";
import { LovedAdventuresProps } from "./LovedAdventures.types";
import styles from "./LovedAdventures.module.css";
import { Heart, Star } from "lucide-react";
import { Column, Row, Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms";
import { MediumCard } from "@/components/molecules/Cards";

export function LovedAdventures({ content }: LovedAdventuresProps) {
  const { title, specialWord, adventures } = content;

  return (
    <Section id="loved-adventures" aria-labelledby="loved-adventures-title">
      <Row fullWidth>
        <Column fullWidth gap="var(--space-12)">
          <SectionTitle
            text={title}
            specialWord={specialWord}
            className={styles.sectionTitle}
            id="loved-adventures-title"
          />
          <Row gap="var(--space-6)" fullWidth>
            {adventures.map((adventure, index) => (
              <MediumCard
                key={index}
                badge={adventure.badge}
                badgeIcon={
                  adventure.badgeIconType === "Star" ? (
                    <Star
                      fill="var(--color-black)"
                      stroke="var(--color-black)"
                      aria-hidden="true"
                    />
                  ) : adventure.badgeIconType === "Heart" ? (
                    <Heart
                      fill="var(--color-black)"
                      stroke="var(--color-black)"
                      aria-hidden="true"
                    />
                  ) : null
                }
                title={adventure.title}
                description={adventure.description}
                image={adventure.image.src}
                imageAlt={adventure.image.alt}
                href={adventure.href}
              />
            ))}
          </Row>
        </Column>
      </Row>
    </Section>
  );
}
