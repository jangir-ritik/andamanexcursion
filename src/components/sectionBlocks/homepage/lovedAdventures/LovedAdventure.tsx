import { Column, Section } from "@/components/layout";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { Row } from "@/components/layout";
import React from "react";
import { MediumCard } from "@/components/molecules";
import fishing from "@public/images/homepage/lovedAdventures/fishing.png";
import liveVolcano from "@public/images/homepage/lovedAdventures/liveVolcano.png";
import { Heart, Star } from "lucide-react";
import styles from "./LovedAdventure.module.css";

function LovedAdventure() {
  return (
    <Section>
      <Row fullWidth>
        <Column fullWidth gap="var(--gap-6)">
          <SectionTitle
            text="Our most Loved Adventures"
            specialWord="Loved Adventures"
            className={styles.sectionTitle}
          />
          <Row gap="var(--gap-3)" fullWidth>
            <MediumCard
              badge="Most Viewed"
              badgeIcon={<Star fill="#000" stroke="#000" />}
              title="Fishing"
              description="Set sail with local fishermen and experience the thrill of fishing as the sun rises over crystal-clear waters."
              image={fishing.src}
              imageAlt="Fishing"
              href="/adventures/fishing"
            />
            <MediumCard
              badge="Customer's Favourite"
              badgeIcon={<Heart fill="#000" stroke="#000" />}
              title="Live Volcano"
              description="Experience the raw power of nature as you witness the volcanic activity up close."
              image={liveVolcano.src}
              imageAlt="Live Volcano"
              href="/adventures/volcano"
            />
          </Row>
        </Column>
      </Row>
    </Section>
  );
}

export default LovedAdventure;
