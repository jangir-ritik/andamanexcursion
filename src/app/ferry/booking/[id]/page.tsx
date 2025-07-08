"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Section, Column, Row } from "@/components/layout";
import styles from "../page.module.css";
import { SectionTitle, Button } from "@/components/atoms";
import { FerryCard } from "@/components/molecules/Cards";
import { Partners } from "@/components/sectionBlocks/common";
import { fetchFerryDetails } from "@/services/ferryService";
import { FerryCardProps } from "@/components/molecules/Cards/FerryCard/FerryCard.types";
import { content } from "../../page.content";

export default function FerryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ferryId = params.id as string;
  const [ferry, setFerry] = useState<FerryCardProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFerryDetails() {
      setLoading(true);
      const data = await fetchFerryDetails(ferryId);
      setFerry(data);
      setLoading(false);
    }

    loadFerryDetails();
  }, [ferryId]);

  const handleChooseSeats = (classType: string) => {
    console.log(`Selected ${classType} class for ferry ${ferry?.ferryName}`);
    // Implement seat selection logic
    // For now, let's just show an alert
    alert(
      `You selected ${classType} class on ${ferry?.ferryName}. Seat selection will be available soon!`
    );
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <Section>
          <Column gap="var(--space-10)" fullWidth>
            <h1>Loading ferry details...</h1>
          </Column>
        </Section>
      </main>
    );
  }

  if (!ferry) {
    return (
      <main className={styles.main}>
        <Section>
          <Column gap="var(--space-10)" fullWidth>
            <h1>Ferry not found</h1>
            <Button href="/ferry/booking" variant="primary">
              Back to all ferries
            </Button>
          </Column>
        </Section>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Section id="ferry-details" aria-labelledby="ferry-details-title">
        <Column gap="var(--space-10)" fullWidth>
          <Row
            justifyContent="between"
            alignItems="center"
            gap="var(--space-4)"
            fullWidth
          >
            <SectionTitle
              specialWord={ferry.ferryName}
              text={`${ferry.departureLocation} to ${ferry.arrivalLocation}`}
              id="ferry-details-title"
            />
          </Row>

          <FerryCard
            ferryName={ferry.ferryName}
            rating={ferry.rating}
            departureTime={ferry.departureTime}
            departureLocation={ferry.departureLocation}
            arrivalTime={ferry.arrivalTime}
            arrivalLocation={ferry.arrivalLocation}
            price={ferry.price}
            totalPrice={ferry.totalPrice}
            seatsLeft={ferry.seatsLeft}
            ferryClasses={ferry.ferryClasses}
            onChooseSeats={handleChooseSeats}
          />

          <div className={styles.backButtonContainer}>
            <Button href="/ferry/booking" variant="outline">
              Back to all ferries
            </Button>
          </div>
        </Column>
      </Section>

      <Partners content={content.partners} />
    </main>
  );
}
