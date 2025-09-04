"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Section, Column } from "@/components/layout";
import { SectionTitle, Button } from "@/components/atoms";
import { useFerryStore } from "@/store/FerryStore";
import { useFerryFlow } from "@/hooks/queries/useFerryStore";
import { SeatLayoutComponent } from "@/components/molecules/SeatLayout/SeatLayout";
import {
  UnifiedFerryResult,
  SeatLayout,
  Seat,
} from "@/types/FerryBookingSession.types";
import {
  ArrowLeft,
  Clock,
  Calendar,
  MapPin,
  Users,
  Ship,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { getAmenityIcon } from "@/utils/amenityIconMapping";
import styles from "./page.module.css";

export default function FerryBookingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  // Client state from Zustand
  const {
    selectedFerry,
    selectedClass,
    selectedSeats,
    searchParams: ferrySearchParams,
    selectClass,
    selectSeats,
    createBookingSession,
  } = useFerryStore();

  // Server state from React Query
  const {
    ferries: searchResults,
    isSearching: isLoading,
  } = useFerryFlow();

  const [ferry, setFerry] = useState<UnifiedFerryResult | null>(null);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);
  const [seatLayout, setSeatLayout] = useState<SeatLayout | null>(null);
  const [loadingSeatLayout, setLoadingSeatLayout] = useState(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [seatPreference, setSeatPreference] = useState<"manual" | "auto">(
    "auto"
  ); // For operators supporting both

  // Set correct seat preference based on ferry capabilities
  useEffect(() => {
    if (ferry) {
      // Green Ocean only supports manual selection
      if (
        ferry.operator === "greenocean" ||
        !ferry.features.supportsAutoAssignment
      ) {
        setSeatPreference("manual");
      }
      // Sealink and others default to auto
      else if (ferry.features.supportsAutoAssignment) {
        setSeatPreference("auto");
      }
    }
  }, [ferry]);

  useEffect(() => {
    const ferryId = params.id as string;
    const classId = searchParams.get("class");

    // Find ferry from search results or selected ferry
    let currentFerry = selectedFerry;
    if (!currentFerry && searchResults && searchResults.length > 0) {
      currentFerry = searchResults.find((f: UnifiedFerryResult) => f.id === ferryId) || null;
    }

    if (currentFerry) {
      setFerry(currentFerry);

      // Auto-select class if provided in URL
      if (classId && currentFerry.classes.length > 0) {
        const targetClass = currentFerry.classes.find((c) => c.id === classId);
        if (targetClass) {
          selectClass(targetClass);
          setCurrentClassId(classId);

          // Load seat layout only if operator requires manual selection (Green Ocean)
          // For Sealink, only load when user specifically chooses manual
          if (
            currentFerry.operator === "greenocean" &&
            currentFerry.features.supportsSeatSelection
          ) {
            loadSeatLayout(classId);
          }
        }
      }
    }
  }, [params.id, searchParams, selectedFerry, searchResults, selectClass]);

  // Update store when local seat selection changes
  useEffect(() => {
    if (selectedSeatIds.length > 0 && seatLayout) {
      // Convert seat IDs to Seat objects
      const selectedSeatObjects = selectedSeatIds
        .map((seatId) => {
          const seat = seatLayout.seats.find((s) => s.id === seatId);
          return seat!; // We know it exists since we selected it
        })
        .filter(Boolean);

      selectSeats(selectedSeatObjects);
    }
  }, [selectedSeatIds, selectSeats, seatLayout]);

  const handleClassSelection = async (classData: { id: string; name: string; price: number; availableSeats: number; amenities: string[] }) => {
    selectClass(classData);
    setCurrentClassId(classData.id);
    // Clear previous seat selection when changing class
    setSelectedSeatIds([]);

    // Load seat layout only for Green Ocean (always required)
    // For Sealink, only load when manual preference is selected
    if (
      ferry?.operator === "greenocean" &&
      ferry.features.supportsSeatSelection
    ) {
      await loadSeatLayout(classData.id);
    }
  };

  const loadSeatLayout = async (classId: string, forceRefresh = false) => {
    if (!ferry) return;

    setLoadingSeatLayout(true);
    try {
      const response = await fetch("/api/ferry/seat-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: ferry.operatorData.originalResponse.routeId,
          ferryId: ferry.operatorFerryId,
          classId,
          travelDate: ferry.schedule.date,
          operator: ferry.operator,
          forceRefresh, // Add cache-busting parameter
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSeatLayout(data.data.seatLayout);
        console.log(
          `🪑 Seat layout updated: ${
            data.data.seatLayout.seats.length
          } total seats, available: ${
            data.data.seatLayout.seats.filter(
              (s: Seat) => s.status === "available"
            ).length
          }`
        );
      } else {
        console.error("Failed to load seat layout");
      }
    } catch (error) {
      console.error("Error loading seat layout:", error);
    } finally {
      setLoadingSeatLayout(false);
    }
  };

  const handleSeatSelection = (seatId: string) => {
    // Calculate total passengers (adults + children, infants typically don't need seats)
    const totalPassengers =
      ferrySearchParams.adults + ferrySearchParams.children;

    setSelectedSeatIds((prev) => {
      if (prev.includes(seatId)) {
        // Deselect seat
        return prev.filter((id) => id !== seatId);
      } else {
        // Select seat - check if we've reached the passenger limit
        if (prev.length >= totalPassengers) {
          // Replace the first selected seat with the new one (FIFO)
          return [...prev.slice(1), seatId];
        } else {
          // Add the new seat
          return [...prev, seatId];
        }
      }
    });
  };

  const handleProceedToCheckout = () => {
    const totalPassengers =
      ferrySearchParams.adults + ferrySearchParams.children;

    // For Green Ocean (manual selection required)
    if (
      ferry?.operator === "greenocean" ||
      (ferry?.features.supportsSeatSelection &&
        !ferry?.features.supportsAutoAssignment)
    ) {
      if (selectedSeatIds.length === 0) {
        alert("Please select your seats before proceeding to checkout.");
        return;
      }
      if (selectedSeatIds.length !== totalPassengers) {
        alert(
          `Please select ${totalPassengers} seat(s) for your ${totalPassengers} passenger(s).`
        );
        return;
      }
    }

    // For Sealink (manual selection chosen)
    if (
      ferry?.features.supportsSeatSelection &&
      ferry?.features.supportsAutoAssignment &&
      seatPreference === "manual"
    ) {
      if (selectedSeatIds.length === 0) {
        alert("Please select your seats before proceeding to checkout.");
        return;
      }
      if (selectedSeatIds.length !== totalPassengers) {
        alert(
          `Please select ${totalPassengers} seat(s) for your ${totalPassengers} passenger(s).`
        );
        return;
      }
    }

    // For auto-assignment (Makruzz always, Sealink when auto preference)
    // No seat validation needed - seats will be auto-assigned

    // Update selected seats in store based on preference
    if (
      seatPreference === "manual" &&
      selectedSeatIds.length > 0 &&
      seatLayout
    ) {
      // Convert seat IDs to Seat objects
      const selectedSeatObjects = selectedSeatIds
        .map((id) => seatLayout.seats.find((seat) => seat.id === id))
        .filter((seat): seat is Seat => seat !== undefined);

      selectSeats(selectedSeatObjects);
    } else {
      // Clear seats for auto-assignment
      selectSeats([]);
    }

    createBookingSession();
    router.push("/checkout?type=ferry");
  };

  // Add function to refresh seat layout after returning from booking
  const refreshSeatLayout = () => {
    if (currentClassId) {
      loadSeatLayout(currentClassId, true); // Force refresh
    }
  };

  // Listen for when user returns to this page (e.g., after booking)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentClassId) {
        // Page became visible - refresh seat layout
        console.log("🔄 Page visible again, refreshing seat layout...");
        refreshSeatLayout();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [currentClassId]);

  const handleBackToResults = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <h2>Loading ferry details...</h2>
            <p>Please wait while we prepare your booking options.</p>
          </div>
        </div>
      </main>
    );
  }

  if (!ferry) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <AlertCircle className={styles.errorIcon} size={48} />
            <h1>Ferry Not Found</h1>
            <p>The ferry you're looking for could not be found.</p>
            <Button variant="primary" onClick={handleBackToResults}>
              Back to Search Results
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header Section */}
        <header className={styles.pageHeader}>
          <Button
            variant="secondary"
            onClick={handleBackToResults}
            className={styles.backButton}
          >
            <ArrowLeft size={16} />
            Back to Results
          </Button>

          <div className={styles.ferryHeaderInfo}>
            <div className={styles.ferryTitle}>
              <Ship className={styles.ferryIcon} size={24} />
              <h1>{ferry.ferryName}</h1>
              <span className={styles.operatorBadge}>{ferry.operator}</span>
            </div>

            <div className={styles.journeyDetails}>
              <div className={styles.journeyItem}>
                <MapPin size={16} />
                <span>
                  {ferry.route.from.name} → {ferry.route.to.name}
                </span>
              </div>
              <div className={styles.journeyItem}>
                <Clock size={16} />
                <span>
                  {ferry.schedule.departureTime} - {ferry.schedule.arrivalTime}
                </span>
              </div>
              <div className={styles.journeyItem}>
                <Calendar size={16} />
                <span>{ferry.schedule.date}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Two Column Layout */}
        <div className={styles.twoColumnLayout}>
          {/* Left Column - Selection Options */}
          <div className={styles.leftColumn}>
            {/* Class Selection */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Choose your <span className={styles.highlight}>class</span>
              </h2>

              <div className={styles.classGrid}>
                {ferry.classes.map((ferryClass, index) => (
                  <div
                    key={ferryClass.id}
                    className={`${styles.classCard} ${
                      selectedClass?.id === ferryClass.id ? styles.selected : ""
                    }`}
                    onClick={() => handleClassSelection(ferryClass)}
                  >
                    <div className={styles.classCardHeader}>
                      <div className={styles.classInfo}>
                        <h3 className={styles.className}>{ferryClass.name}</h3>
                        <div className={styles.seatsInfo}>
                          <Users size={14} />
                          <span>
                            {ferryClass.availableSeats} seats available
                          </span>
                        </div>
                      </div>
                      <div className={styles.classPricing}>
                        <div className={styles.classPrice}>
                          ₹{ferryClass.price}
                        </div>
                        <div className={styles.priceLabel}>per person</div>
                      </div>
                    </div>

                    {ferryClass.amenities &&
                      ferryClass.amenities.length > 0 && (
                        <div className={styles.amenitiesContainer}>
                          {ferryClass.amenities
                            .slice(0, 4)
                            .map((amenity, i) => {
                              const amenityMapping = getAmenityIcon(amenity);
                              const IconComponent = amenityMapping.icon;
                              return (
                                <div key={i} className={styles.amenityItem}>
                                  <IconComponent
                                    size={14}
                                    className={amenityMapping.color}
                                  />
                                  <span>{amenity}</span>
                                </div>
                              );
                            })}
                          {ferryClass.amenities.length > 4 && (
                            <div className={styles.moreAmenities}>
                              +{ferryClass.amenities.length - 4} more
                            </div>
                          )}
                        </div>
                      )}

                    {selectedClass?.id === ferryClass.id && (
                      <div className={styles.selectedIndicator}>
                        <CheckCircle size={16} />
                        <span>Selected</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Seat Selection - Show for operators that support manual selection */}
            {selectedClass && ferry.features.supportsSeatSelection && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Select your <span className={styles.highlight}>seats</span>
                </h2>

                {/* Seat Preference Options (only for operators supporting both manual AND auto) */}
                {ferry.features.supportsAutoAssignment &&
                  ferry.features.supportsSeatSelection && (
                    <div className={styles.seatPreferenceContainer}>
                      <h4>Seat Selection Preference</h4>
                      <div className={styles.seatPreferenceOptions}>
                        <label className={styles.radioOption}>
                          <input
                            type="radio"
                            name="seatPreference"
                            value="auto"
                            checked={seatPreference === "auto"}
                            onChange={(e) =>
                              setSeatPreference(e.target.value as "auto")
                            }
                          />
                          <span>Auto-assign best available seats</span>
                        </label>
                        <label className={styles.radioOption}>
                          <input
                            type="radio"
                            name="seatPreference"
                            value="manual"
                            checked={seatPreference === "manual"}
                            onChange={(e) => {
                              setSeatPreference(e.target.value as "manual");
                              if (e.target.value === "manual") {
                                loadSeatLayout(currentClassId!);
                              }
                            }}
                          />
                          <span>Choose specific seats</span>
                        </label>
                      </div>
                    </div>
                  )}

                <div className={styles.seatSelectionContainer}>
                  {loadingSeatLayout && (
                    <div className={styles.seatLoading}>
                      <div className={styles.spinner} />
                      <p>Loading seat layout...</p>
                    </div>
                  )}

                  {seatLayout &&
                    !loadingSeatLayout &&
                    seatPreference === "manual" && (
                      <div className={styles.seatLayoutWrapper}>
                        <SeatLayoutComponent
                          seatLayout={seatLayout}
                          // Pass layout_config separately if it exists, otherwise let component handle it
                          layout_config={seatLayout.layout_config}
                          selectedSeats={selectedSeatIds}
                          onSeatSelect={handleSeatSelection}
                          maxSeats={
                            ferrySearchParams.adults +
                            ferrySearchParams.children
                          }
                          className={styles.seatLayout}
                          onRefreshLayout={refreshSeatLayout}
                          isLoading={loadingSeatLayout}
                          ferryInfo={{
                            name: ferry.ferryName,
                            route: `${ferry.route.from.name} → ${ferry.route.to.name}`,
                            departureTime: ferry.schedule.departureTime,
                            estimatedDuration: ferry.schedule.duration || "N/A",
                          }}
                        />

                        <div className={styles.seatLegend}>
                          <div className={styles.legendItem}>
                            <div
                              className={`${styles.legendSeat} ${styles.available}`}
                            />
                            <span>Available</span>
                          </div>
                          <div className={styles.legendItem}>
                            <div
                              className={`${styles.legendSeat} ${styles.selected}`}
                            />
                            <span>Selected</span>
                          </div>
                          <div className={styles.legendItem}>
                            <div
                              className={`${styles.legendSeat} ${styles.occupied}`}
                            />
                            <span>Occupied</span>
                          </div>
                        </div>
                      </div>
                    )}

                  {seatPreference === "auto" &&
                    ferry.features.supportsAutoAssignment &&
                    selectedClass && (
                      <div className={styles.autoAssignMessage}>
                        <AlertCircle size={20} />
                        <div>
                          <h4>Seats will be auto-assigned</h4>
                          <p>
                            Don't worry! We'll assign you the best available
                            seats for your selected class.
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              </section>
            )}

            {/* Auto-Assignment Only Message - Show for operators that only support auto-assignment */}
            {selectedClass &&
              !ferry.features.supportsSeatSelection &&
              ferry.features.supportsAutoAssignment && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    Seat <span className={styles.highlight}>Assignment</span>
                  </h2>

                  <div className={styles.autoAssignMessage}>
                    <AlertCircle size={20} />
                    <div>
                      <h4>Seats will be auto-assigned</h4>
                      <p>
                        {ferry.operator === "makruzz"
                          ? "Makruzz ferries use automatic seat assignment. We'll assign you the best available seats for your selected class."
                          : "We'll assign you the best available seats for your selected class."}
                      </p>
                    </div>
                  </div>
                </section>
              )}
          </div>

          {/* Right Column - Booking Summary */}
          <div className={styles.rightColumn}>
            <div className={styles.summarySticky}>
              <section className={styles.bookingSummary}>
                <h3 className={styles.summaryTitle}>Booking Summary</h3>

                <div className={styles.summaryContent}>
                  <div className={styles.summarySection}>
                    <h4>Journey Details</h4>
                    <div className={styles.summaryDetails}>
                      <div className={styles.summaryRow}>
                        <span>Ferry</span>
                        <span>{ferry.ferryName}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Route</span>
                        <span>
                          {ferry.route.from.name} → {ferry.route.to.name}
                        </span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Date</span>
                        <span>{ferry.schedule.date}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Time</span>
                        <span>
                          {ferry.schedule.departureTime} -{" "}
                          {ferry.schedule.arrivalTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedClass && (
                    <div className={styles.summarySection}>
                      <h4>Selected Options</h4>
                      <div className={styles.summaryDetails}>
                        <div className={styles.summaryRow}>
                          <span>Class</span>
                          <span>{selectedClass.name}</span>
                        </div>
                        <div className={styles.summaryRow}>
                          <span>Passengers</span>
                          <span>
                            {ferrySearchParams.adults > 0 &&
                              `${ferrySearchParams.adults} Adult${
                                ferrySearchParams.adults > 1 ? "s" : ""
                              }`}
                            {ferrySearchParams.children > 0 &&
                              `, ${ferrySearchParams.children} Child${
                                ferrySearchParams.children > 1 ? "ren" : ""
                              }`}
                            {ferrySearchParams.infants > 0 &&
                              `, ${ferrySearchParams.infants} Infant${
                                ferrySearchParams.infants > 1 ? "s" : ""
                              }`}
                          </span>
                        </div>
                        <div className={styles.summaryRow}>
                          <span>Seats</span>
                          <span>
                            {selectedSeatIds.length > 0
                              ? `Seat ${selectedSeatIds.join(", ")}`
                              : "Auto-assigned"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedClass && (
                    <div className={styles.pricingSection}>
                      <h4>Price Breakdown</h4>
                      <div className={styles.pricingDetails}>
                        <div className={styles.pricingRow}>
                          <span>
                            Base Fare (
                            {ferrySearchParams.adults +
                              ferrySearchParams.children}{" "}
                            passengers)
                          </span>
                          <span>
                            ₹
                            {selectedClass.price *
                              (ferrySearchParams.adults +
                                ferrySearchParams.children)}
                          </span>
                        </div>
                        {ferry.pricing.portFee && (
                          <div className={styles.pricingRow}>
                            <span>Port Fee</span>
                            <span>
                              ₹
                              {ferry.pricing.portFee *
                                (ferrySearchParams.adults +
                                  ferrySearchParams.children)}
                            </span>
                          </div>
                        )}
                        {ferry.pricing.taxes && (
                          <div className={styles.pricingRow}>
                            <span>Taxes</span>
                            <span>
                              ₹
                              {ferry.pricing.taxes *
                                (ferrySearchParams.adults +
                                  ferrySearchParams.children)}
                            </span>
                          </div>
                        )}
                        <div className={styles.totalRow}>
                          <span>Total Amount</span>
                          <span>
                            ₹
                            {(selectedClass.price +
                              (ferry.pricing.portFee || 0) +
                              (ferry.pricing.taxes || 0)) *
                              (ferrySearchParams.adults +
                                ferrySearchParams.children)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedClass && (
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleProceedToCheckout}
                    className={styles.checkoutButton}
                  >
                    Proceed to Checkout
                  </Button>
                )}

                {!selectedClass && (
                  <div className={styles.selectionPrompt}>
                    <AlertCircle size={20} />
                    <span>Please select a class to continue</span>
                  </div>
                )}
              </section>

              {/* Trust Indicators */}
              <div className={styles.trustIndicators}>
                <div className={styles.trustItem}>
                  <CheckCircle size={16} />
                  <span>Instant Confirmation</span>
                </div>
                <div className={styles.trustItem}>
                  <CheckCircle size={16} />
                  <span>Secure Payment</span>
                </div>
                <div className={styles.trustItem}>
                  <CheckCircle size={16} />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
