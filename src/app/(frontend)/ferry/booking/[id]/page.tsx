"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Section, Column, Row } from "@/components/layout";
import { SectionTitle, Button } from "@/components/atoms";
import { useFerryStore } from "@/store/FerryStore";
import { UnifiedFerryResult } from "@/types/FerryBookingSession.types";
import styles from "./page.module.css";

export default function FerryBookingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    selectedFerry,
    selectedClass,
    selectedSeats,
    selectClass,
    selectSeats,
    createBookingSession,
    searchResults,
    isLoading,
  } = useFerryStore();

  const [ferry, setFerry] = useState<UnifiedFerryResult | null>(null);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);

  useEffect(() => {
    const ferryId = params.id as string;
    const classId = searchParams.get("class");

    // Find ferry from search results or selected ferry
    let currentFerry = selectedFerry;
    if (!currentFerry && searchResults.length > 0) {
      currentFerry = searchResults.find((f) => f.id === ferryId) || null;
    }

    if (currentFerry) {
      setFerry(currentFerry);

      // Auto-select class if provided in URL
      if (classId && currentFerry.classes.length > 0) {
        const targetClass = currentFerry.classes.find((c) => c.id === classId);
        if (targetClass) {
          selectClass(targetClass);
          setCurrentClassId(classId);
        }
      }
    }
  }, [params.id, searchParams, selectedFerry, searchResults, selectClass]);

  const handleClassSelection = (classData: any) => {
    selectClass(classData);
    setCurrentClassId(classData.id);
  };

  const handleSeatSelection = (seats: any[]) => {
    selectSeats(seats);
  };

  const handleProceedToCheckout = () => {
    createBookingSession();
    router.push("/checkout?type=ferry");
  };

  const handleBackToResults = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <main className={styles.main}>
        <Section className={styles.loadingSection}>
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading ferry details...</p>
          </div>
        </Section>
      </main>
    );
  }

  if (!ferry) {
    return (
      <main className={styles.main}>
        <Section className={styles.errorSection}>
          <div className={styles.error}>
            <h1>Ferry Not Found</h1>
            <p>The ferry you're looking for could not be found.</p>
            <Button variant="primary" onClick={handleBackToResults}>
              Back to Search Results
            </Button>
          </div>
        </Section>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      {/* Ferry Header */}
      <Section className={styles.ferryHeader}>
        <Column gap="var(--space-4)">
          <Button
            variant="secondary"
            onClick={handleBackToResults}
            className={styles.backButton}
          >
            ← Back to Results
          </Button>

          <div className={styles.ferryInfo}>
            <h1 className={styles.ferryName}>{ferry.ferryName}</h1>
            <div className={styles.routeInfo}>
              <span className={styles.route}>
                {ferry.route.from.name} → {ferry.route.to.name}
              </span>
              <span className={styles.schedule}>
                {ferry.schedule.departureTime} - {ferry.schedule.arrivalTime}
              </span>
              <span className={styles.duration}>
                ({ferry.schedule.duration})
              </span>
            </div>
            <div className={styles.operator}>
              Operated by <strong>{ferry.operator}</strong>
            </div>
          </div>
        </Column>
      </Section>

      {/* Class Selection */}
      <Section>
        <Column gap="var(--space-8)">
          <SectionTitle text="Choose your class" specialWord="class" />

          <div className={styles.classGrid}>
            {ferry.classes.map((ferryClass, index) => (
              <div
                key={ferryClass.id}
                className={`${styles.classCard} ${
                  selectedClass?.id === ferryClass.id ? styles.selected : ""
                }`}
                onClick={() => handleClassSelection(ferryClass)}
              >
                <div className={styles.classHeader}>
                  <h3 className={styles.className}>{ferryClass.name}</h3>
                  <div className={styles.classPrice}>₹{ferryClass.price}</div>
                </div>

                <div className={styles.classInfo}>
                  <div className={styles.seatsAvailable}>
                    {ferryClass.availableSeats} seats available
                  </div>

                  {ferryClass.amenities && ferryClass.amenities.length > 0 && (
                    <div className={styles.amenities}>
                      {ferryClass.amenities.map((amenity, i) => (
                        <span key={i} className={styles.amenity}>
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Column>
      </Section>

      {/* Seat Selection (if applicable) */}
      {selectedClass && ferry.features.supportsSeatSelection && (
        <Section>
          <Column gap="var(--space-8)">
            <SectionTitle text="Select your seats" specialWord="seats" />

            <div className={styles.seatSelection}>
              <p className={styles.seatInfo}>
                Seat selection will be available here for {ferry.operator}{" "}
                ferries. This feature is coming soon!
              </p>
            </div>
          </Column>
        </Section>
      )}

      {/* Booking Summary */}
      {selectedClass && (
        <Section className={styles.bookingSummary}>
          <div className={styles.summaryCard}>
            <h3>Booking Summary</h3>

            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span>Ferry:</span>
                <span>{ferry.ferryName}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Route:</span>
                <span>
                  {ferry.route.from.name} → {ferry.route.to.name}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>Date:</span>
                <span>{ferry.schedule.date}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Time:</span>
                <span>
                  {ferry.schedule.departureTime} - {ferry.schedule.arrivalTime}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>Class:</span>
                <span>{selectedClass.name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Seats:</span>
                <span>
                  {selectedSeats.length > 0
                    ? selectedSeats.length
                    : "Auto-assigned"}
                </span>
              </div>
              <div className={styles.summaryRowTotal}>
                <span>Total Price:</span>
                <span>₹{ferry.pricing.total}</span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleProceedToCheckout}
              className={styles.checkoutButton}
              size="large"
            >
              Proceed to Checkout
            </Button>
          </div>
        </Section>
      )}
    </main>
  );
}
