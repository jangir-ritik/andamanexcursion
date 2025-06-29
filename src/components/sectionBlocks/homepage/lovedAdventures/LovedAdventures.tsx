import { Column, Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { Row } from "@/components/layout";
import React from "react";
import { MediumCard } from "@/components/molecules";
import {
  BadgeIconType,
  lovedAdventuresContent,
} from "./LovedAdventures.content";
import styles from "./LovedAdventures.module.css";
import { Heart, Star } from "lucide-react";

export function LovedAdventures() {
  const { title, specialWord, adventures } = lovedAdventuresContent;

  // Render badge icons based on type
  const getBadgeIcon = (iconType: BadgeIconType) => {
    switch (iconType) {
      case "Star":
        return <Star fill="#000" stroke="#000" />;
      case "Heart":
        return <Heart fill="#000" stroke="#000" />;
      default:
        return null;
    }
  };

  return (
    <Section>
      <Row fullWidth>
        <Column fullWidth gap="var(--gap-6)">
          <SectionTitle
            text={title}
            specialWord={specialWord}
            className={styles.sectionTitle}
          />
          <Row gap="var(--gap-3)" fullWidth>
            {adventures.map((adventure, index) => (
              <MediumCard
                key={index}
                badge={adventure.badge}
                badgeIcon={getBadgeIcon(adventure.badgeIconType)}
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
