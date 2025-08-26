"use client";
import React, { Suspense, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Section, Column, Row } from "@/components/layout";
import styles from "./page.module.css";
import { Button } from "@/components/atoms";
import { useBoat } from "@/store/BoatStore";
import { useBoatFormOptions, useBoatsByRoute } from "@/hooks/queries/useBoats";
import { SearchSummary } from "@/components/molecules/BookingResults";
import { BoatResults } from "@/components/molecules/BookingResults/BoatResults";
import { BoatCartSummary } from "@/components/molecules/BookingResults/BoatCartSummary";
import { UnifiedSearchingForm } from "@/components/organisms";

// Component for cart content with empty state
const BoatCartContent = () => {
  const { cart } = useBoat();

  // Optimized scroll handler
  const handleAddMore = useCallback(() => {
    const formElement = document.getElementById("booking-form-section");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <p className={styles.emptyCartText}>No boats selected yet</p>
        <p className={styles.emptyCartSubtext}>
          Use the form to search and add boat trips
        </p>
      </div>
    );
  }

  return (
    <BoatCartSummary
      cart={cart}
      onAddMore={handleAddMore}
      onCheckout={() => {
        // Navigate to checkout
        window.location.href = "/checkout";
      }}
    />
  );
};

// Component that handles search params and displays results
const BoatSearchContent = () => {
  const searchParams = useSearchParams();
  const { searchParams: currentParams, updateSearchParams } = useBoat();
  const initializedRef = React.useRef(false);

  // Memoize search params extraction to avoid re-computation
  const urlSearchParams = useMemo(() => {
    const fromLocation = searchParams.get("fromLocation");
    const toLocation = searchParams.get("toLocation");
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const adults = parseInt(searchParams.get("adults") || "2", 10);
    const children = parseInt(searchParams.get("children") || "0", 10);

    return {
      fromLocation,
      toLocation,
      date: date || new Date().toISOString().split("T")[0],
      time: time || "",
      adults,
      children,
    };
  }, [searchParams]);

  // Load search params from URL on mount only once
  useEffect(() => {
    if (initializedRef.current) return;

    const { fromLocation, toLocation, ...restParams } = urlSearchParams;

    // Trigger search if we have fromLocation
    if (fromLocation) {
      const params = {
        fromLocation,
        toLocation: toLocation || "",
        ...restParams,
      };

      updateSearchParams(params);
      initializedRef.current = true;
    }
  }, [urlSearchParams, updateSearchParams]);

  // Fetch boat data
  const {
    boatRoutes,
    fromLocations,
    isLoading: isLoadingBoatOptions,
  } = useBoatFormOptions();

  const { data: availableBoatsForRoute = [], isLoading: isLoadingBoats } =
    useBoatsByRoute(currentParams.toLocation);

  // Memoize display names to prevent unnecessary re-computations
  const displayNames = useMemo(() => {
    const fromLocationName = fromLocations.find(
      (location) => location.slug === currentParams.fromLocation
    )?.name;

    const selectedRoute = boatRoutes.data?.find(
      (route) => route.id === currentParams.toLocation
    );
    const toLocationName = selectedRoute?.toLocation;

    return {
      fromLocationName,
      toLocationName,
    };
  }, [
    currentParams.fromLocation,
    currentParams.toLocation,
    fromLocations,
    boatRoutes.data,
  ]);

  // Memoize total passengers calculation
  const totalPassengers = useMemo(
    () => currentParams.adults + currentParams.children,
    [currentParams.adults, currentParams.children]
  );

  // Get available boats for the selected route
  const availableBoats = useMemo(() => {
    if (!currentParams.toLocation) return [];

    const selectedRoute = boatRoutes.data?.find(
      (route) => route.id === currentParams.toLocation
    );
    if (!selectedRoute) return [];

    // Transform route data to match Boat.route interface
    const routeData = {
      id: selectedRoute.id,
      from:
        typeof selectedRoute.fromLocation === "string"
          ? selectedRoute.fromLocation
          : selectedRoute.fromLocation.name,
      to: selectedRoute.toLocation,
      fare: selectedRoute.fare,
      timing:
        selectedRoute.availableTimings
          ?.map((t) => t.departureTime)
          .filter(Boolean) || [],
      minTimeAllowed: selectedRoute.duration || "Full day",
      description: selectedRoute.description || undefined,
    };

    // If we have boats for this route, return them
    if (availableBoatsForRoute.length > 0) {
      return availableBoatsForRoute.map((boat) => ({
        id: boat.id,
        route: routeData,
        name: boat.name,
        description:
          boat.boatInfo?.description || selectedRoute.description || undefined,
        fare: boat.pricing?.basePrice || selectedRoute.fare,
        timing:
          selectedRoute.availableTimings
            ?.map((t) => t.departureTime)
            .filter(Boolean) || [],
        minTimeAllowed: selectedRoute.duration || "Full day",
        capacity: boat.boatInfo?.capacity || 50,
        operator: boat.boatInfo?.operator || "Andaman Excursion",
      }));
    }

    // Fallback: create a boat from the route data
    return [
      {
        id: selectedRoute.id,
        route: routeData,
        name: selectedRoute.name,
        description: selectedRoute.description || undefined,
        fare: selectedRoute.fare,
        timing:
          selectedRoute.availableTimings
            ?.map((t) => t.departureTime)
            .filter(Boolean) || [],
        minTimeAllowed: selectedRoute.duration || "Full day",
        capacity: 50, // Default capacity
        operator: "Andaman Excursion",
      },
    ];
  }, [currentParams.toLocation, boatRoutes.data, availableBoatsForRoute]);

  return (
    <Column gap="var(--space-6)" fullWidth>
      {/* Search Summary & Results Container */}
      <Section className={styles.resultsSection}>
        <Column gap="var(--space-4)" fullWidth>
          {/* Search Summary */}
          {currentParams.fromLocation && (
            <SearchSummary
              loading={isLoadingBoatOptions || isLoadingBoats}
              resultCount={availableBoats.length}
              activity={`${displayNames.fromLocationName} to ${displayNames.toLocationName}`}
              activityName=""
              location=""
              locationName=""
              date={currentParams.date}
              time={currentParams.time}
              passengers={totalPassengers}
              type="boat"
            />
          )}

          {/* Boat Results */}
          <BoatResults
            searchParams={currentParams}
            boats={availableBoats}
            loading={isLoadingBoatOptions || isLoadingBoats}
          />
        </Column>
      </Section>
    </Column>
  );
};

// Main page component
export default function BoatSearchPage() {
  return (
    <main className={styles.main}>
      {/* Management Section - Cart + Booking Form */}
      <Section
        ariaLabelledby="management-section"
        id="booking-form-section"
        className={styles.managementSection}
      >
        <Column gap="var(--space-6)" fullWidth alignItems="start">
          {/* Top - Booking Form */}
          <h1 className={styles.sectionHeading}>Your Boat Trips</h1>
          <Row gap="var(--space-3)" className={styles.formColumn}>
            <UnifiedSearchingForm
              variant="embedded"
              initialTab="local-boat"
              className={styles.bookingForm}
            />
          </Row>
          {/* Bottom - Your Boat Cart */}
          <Row gap="var(--space-3)" fullWidth className={styles.cartColumn}>
            <Suspense
              fallback={
                <div className={styles.cartLoading}>Loading cart...</div>
              }
            >
              <BoatCartContent />
            </Suspense>
          </Row>
        </Column>
      </Section>

      {/* Search Results Section */}
      <Section
        id="search-results"
        aria-labelledby="search-results-content"
        className={styles.contentArea}
      >
        <Suspense
          fallback={
            <div className={styles.loadingFallback}>
              <div className={styles.spinner} />
              <p>Loading your boat search...</p>
            </div>
          }
        >
          <BoatSearchContent />
        </Suspense>
      </Section>
    </main>
  );
}
