import { HeroTitle } from "@/components/atoms/HeroTitle";
import styles from "./page.module.css";
import { BookingForm } from "@/components/organisms/BookingForm";
import { DescriptionText } from "@/components/atoms/DescriptionText";
import { Row } from "@/components/layout/Row";
import { Column } from "@/components/layout/Column";

export default function Home() {
  return (
    <div className={styles.container}>
      <Column gap="var(--section-gap)" fullWidth>
        <Row justifyContent="between" alignItems="center" fullWidth>
          <HeroTitle primaryText="Explore" secondaryText="Andaman!" />
          <DescriptionText
            text="Uncover pristine beaches, hidden adventures, and unforgettable sunsets across the Andaman Islands."
            className={styles.descriptionText}
            align="right"
          />
        </Row>
        <BookingForm />
      </Column>
    </div>
  );
}
