import { Column, Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms/SectionTitle/SectionTitle";
import { Row } from "@/components/layout";
import React from "react";
import {
  BadgeIconType,
  lovedAdventuresContent,
} from "./LovedAdventures.content";
import styles from "./LovedAdventures.module.css";
import { Heart, Star } from "lucide-react";
import { MediumCard } from "@/components/molecules/Cards/MediumCard";
import { LovedAdventuresProps } from "./LovedAdventures.types";

export function LovedAdventures({ className }: LovedAdventuresProps = {}) {
  const { title, specialWord, adventures } = lovedAdventuresContent;

  // Render badge icons based on type
  const getBadgeIcon = (iconType: BadgeIconType) => {
    switch (iconType) {
      case "Star":
        return (
          <Star
            fill="var(--color-black)"
            stroke="var(--color-black)"
            aria-hidden="true"
          />
        );
      case "Heart":
        return (
          <Heart
            fill="var(--color-black)"
            stroke="var(--color-black)"
            aria-hidden="true"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Section
      id="loved-adventures"
      aria-labelledby="loved-adventures-title"
      className={className}
    >
      <Row fullWidth>
        <Column fullWidth gap="var(--gap-6)">
          <SectionTitle
            text={title}
            specialWord={specialWord}
            className={styles.sectionTitle}
            id="loved-adventures-title"
          />
          <Row gap="var(--gap-3)" fullWidth>
            {adventures.map((adventure, index) => (
              <MediumCard
                key={index}
                badge={adventure.badge}
                badgeIcon={getBadgeIcon(
                  adventure.badgeIconType as BadgeIconType
                )}
                title={adventure.title}
                description={adventure.description}
                image={adventure.image.src}
                imageAlt={adventure.imageAlt}
                href={adventure.href}
              />
            ))}
          </Row>
        </Column>
      </Row>
    </Section>
  );
}
