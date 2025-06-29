import { DescriptionText } from "@/components/atoms/DescriptionText";
import { SectionTitle } from "@/components/atoms/SectionTitle";
import { Column, Row, Section } from "@/components/layout";
import React from "react";
import styles from "./HiddenGems.module.css";
import { Button } from "@/components/atoms/Button/Button";
import Image from "next/image";
import island1 from "@public/images/homepage/hiddenGems/hiddenGems1.png";
import island2 from "@public/images/homepage/hiddenGems/hiddenGems2.png";
import island3 from "@public/images/homepage/hiddenGems/hiddenGems3.png";

function HiddenGems() {
  return (
    <Section
      backgroundColor="light"
      spacing="5"
      fullBleed
      className={styles.hiddenGemsSection}
    >
      <Row
        justifyContent="between"
        fullWidth
        className={styles.hiddenGemsRow}
        wrap
        gap="var(--gap-10)"
      >
        <Column gap="var(--gap-4)" alignItems="start">
          <SectionTitle
            text="Discover Andaman's Hidden Gems!"
            specialWord="Hidden Gems!"
            className={styles.sectionTitle}
          />
          <DescriptionText text="Step off the beaten path and uncover untouched islands, secret beaches, and serene waters that most tourists never see." />
          <Button showArrow>Book Now</Button>
        </Column>
        <Column>
          <Row gap="var(--gap-3)">
            <Column fullWidth>
              <Image src={island1} alt="island" />
            </Column>
            <Column fullWidth fullHeight gap="var(--gap-3)">
              <Image src={island2} alt="island" />
              <Image src={island3} alt="island" />
            </Column>
          </Row>
        </Column>
      </Row>
    </Section>
  );
}

export default HiddenGems;
