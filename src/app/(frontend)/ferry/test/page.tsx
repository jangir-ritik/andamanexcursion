"use client";
import React, { useState } from "react";
import { Section, Column } from "@/components/layout";
import { Button } from "@/components/atoms";
import { FerryCard } from "@/components/molecules/Cards/FerryCard";
import styles from "./page.module.css";
import { LocationMappingService } from "@/services/ferryServices/locationMappingService";

const mockFerryData = {
  ferryName: "Makruzz Gold",
  rating: 4.5,
  departureTime: "08:30",
  departureLocation: "Port Blair",
  arrivalTime: "10:00",
  arrivalLocation: "Havelock Island",
  price: 1725,
  totalPrice: 2085,
  seatsLeft: 150,
  ferryClasses: [
    {
      type: "Premium",
      price: 1725,
      totalPrice: 2085,
      seatsLeft: 150,
      amenities: [
        { icon: "/icons/ac.svg", label: "AC" },
        { icon: "/icons/seat.svg", label: "Comfortable Seating" },
        { icon: "/icons/food.svg", label: "Refreshments" },
      ],
    },
  ],
  ferryImages: ["/images/ferry/makruzz-1.jpg"],
  onChooseSeats: (classType: string) => {
    alert(`Selected ${classType} class - this would navigate to booking page`);
  },
};

export default function FerryTestPage() {
  const [apiStatus, setApiStatus] = useState<{
    sealink: string;
    makruzz: string;
    greenocean: string;
  } | null>(null);

  const testAPIHealth = async () => {
    try {
      const response = await fetch("/api/ferry/health");
      const data = await response.json();
      setApiStatus({
        sealink: data.operators.sealink.status,
        makruzz: data.operators.makruzz.status,
        greenocean: data.operators.greenocean.status,
      });
    } catch (error) {
      console.error("Failed to check API health:", error);
    }
  };

  const testFerrySearch = async () => {
    try {
      const response = await fetch("/api/ferry/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "port-blair",
          to: "havelock",
          date: "2025-08-05", // Updated to use a date similar to the successful manual test
          adults: 2,
          children: 0,
          infants: 0,
        }),
      });

      const data = await response.json();
      console.log("Ferry search results:", data);
      alert(
        `Search completed! Found ${
          data.results?.length || 0
        } ferries. Check console for details.`
      );
    } catch (error) {
      console.error("Ferry search failed:", error);
      alert("Ferry search failed - check console for details");
    }
  };

  const testWithMockData = () => {
    // Simulate successful ferry search results
    const mockSearchResults = {
      results: [
        {
          id: "sealink-mock-1",
          operator: "sealink",
          operatorFerryId: "mock-1",
          ferryName: "Nautika",
          route: {
            from: { name: "Port Blair", code: "PB" },
            to: { name: "Havelock Island", code: "HL" },
            fromCode: "PB",
            toCode: "HL",
          },
          schedule: {
            departureTime: "08:00",
            arrivalTime: "09:30",
            duration: "1h 30m",
            date: "2024-12-25",
          },
          classes: [
            {
              id: "luxury",
              name: "Luxury",
              price: 1200,
              availableSeats: 45,
              amenities: ["AC", "Comfortable Seating", "Refreshments"],
            },
            {
              id: "royal",
              name: "Royal",
              price: 1500,
              availableSeats: 20,
              amenities: ["AC", "Premium Seating", "Priority Boarding", "Meal"],
            },
          ],
          availability: {
            totalSeats: 65,
            availableSeats: 65,
            lastUpdated: new Date().toISOString(),
          },
          pricing: {
            baseFare: 1200,
            taxes: 0,
            portFee: 0,
            total: 1200,
            currency: "INR",
          },
          features: {
            supportsSeatSelection: true,
            supportsAutoAssignment: true,
            hasAC: true,
            hasWiFi: true,
          },
          operatorData: {
            originalResponse: {},
            bookingEndpoint: "mock",
            authToken: "mock",
          },
          isActive: true,
        },
      ],
      errors: [],
      searchParams: {
        from: "port-blair",
        to: "havelock",
        date: "2024-12-25",
        adults: 2,
        children: 0,
        infants: 0,
      },
      timestamp: new Date().toISOString(),
    };

    console.log("Mock ferry search results:", mockSearchResults);
    alert(
      `Mock data: Found ${mockSearchResults.results.length} ferry! Check console for full details.`
    );
  };

  const testSealinkHTTP = async () => {
    try {
      console.log("🔗 Testing Sealink with HTTP URL");
      const response = await fetch("/api/ferry/sendlink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: "05-08-2025",
          from: "Port Blair",
          to: "Swaraj Dweep",
          userName: "excursion",
          token:
            "U2FsdGVkX19DpqycMA+j5m2HBDkk0f/Tcy96UW+6gTyYhw7Y2LCavxW3nczGgDcoAbieWlIk49YwdKUnc5wIMw==",
        }),
      });

      const data = await response.json();
      console.log("✅ Sealink HTTP test response:", data);
      alert(
        `Sealink HTTP test: ${data.err ? "FAILED" : "SUCCESS"} - Found ${
          data.data?.length || 0
        } trips`
      );
    } catch (error) {
      console.error("❌ Sealink HTTP test failed:", error);
      alert("Sealink HTTP test failed - check console");
    }
  };

  const testGreenOceanAPI = async () => {
    try {
      console.log("🌊 Testing Green Ocean API directly");

      // Test the route-details endpoint directly
      const requestBody = {
        from_id: 1, // Port Blair
        dest_to: 2, // Havelock
        number_of_adults: 1,
        number_of_infants: 0,
        travel_date: "05-08-2025",
        public_key: "public-HGTBlexrva",
        hash_string: "test_hash", // We'll generate proper hash in the service
      };

      console.log("Green Ocean test request:", requestBody);

      const response = await fetch("/api/ferry/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "port-blair",
          to: "havelock",
          date: "2025-08-05",
          adults: 1,
          children: 0,
          infants: 0,
        }),
      });

      const data = await response.json();
      console.log("✅ Green Ocean test response:", data);

      // Check specifically for Green Ocean results
      const greenOceanResults =
        data.results?.filter((r: any) => r.operator === "greenocean") || [];
      const greenOceanError = data.errors?.find(
        (e: any) => e.operator === "greenocean"
      );

      if (greenOceanResults.length > 0) {
        alert(
          `✅ Green Ocean SUCCESS: Found ${greenOceanResults.length} results`
        );
      } else if (greenOceanError) {
        alert(`❌ Green Ocean ERROR: ${greenOceanError.error}`);
      } else {
        alert("🤷 Green Ocean: No results or errors reported");
      }
    } catch (error) {
      console.error("❌ Green Ocean test failed:", error);
      alert("Green Ocean test failed - check console");
    }
  };

  const testLocationMappings = () => {
    console.log("🗺️ Testing Location Mappings:");

    const locations = ["port-blair", "havelock", "neil", "baratang"];

    locations.forEach((location) => {
      LocationMappingService.debugLocation(location);
    });

    alert("Location mappings logged to console - check developer tools");
  };

  return (
    <main className={styles.main}>
      <Section>
        <Column gap="var(--space-8)">
          <div className={styles.header}>
            <h1>🧪 Ferry System Test Page</h1>
            <p>Test ferry components and API connectivity</p>
          </div>

          <div className={styles.testSection}>
            <h2>🔌 API Health Check</h2>
            <Button onClick={testAPIHealth} variant="secondary">
              Check API Status
            </Button>

            {apiStatus && (
              <div className={styles.apiStatus}>
                <div
                  className={`${styles.status} ${styles[apiStatus.sealink]}`}
                >
                  Sealink: {apiStatus.sealink}
                </div>
                <div
                  className={`${styles.status} ${styles[apiStatus.makruzz]}`}
                >
                  Makruzz: {apiStatus.makruzz}
                </div>
                <div
                  className={`${styles.status} ${styles[apiStatus.greenocean]}`}
                >
                  Green Ocean: {apiStatus.greenocean}
                </div>
              </div>
            )}
          </div>

          <div className={styles.testSection}>
            <h2>🚢 Ferry Search Test</h2>
            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                flexWrap: "wrap",
              }}
            >
              <Button onClick={testFerrySearch} variant="primary">
                Test Ferry Search API
              </Button>
              <Button onClick={testWithMockData} variant="secondary">
                Test with Mock Data
              </Button>
              <Button onClick={testSealinkHTTP} variant="primary">
                Test Sealink HTTP
              </Button>
              <Button onClick={testGreenOceanAPI} variant="secondary">
                Test Green Ocean API
              </Button>
              <Button onClick={testLocationMappings} variant="outline">
                Debug Location Mappings
              </Button>
            </div>
          </div>

          <div className={styles.testSection}>
            <h2>🎨 Ferry Card Component</h2>
            <p>
              This shows how ferry cards will look when API data is available:
            </p>
            <FerryCard {...mockFerryData} />
          </div>

          <div className={styles.instructions}>
            <h3>🛠️ Next Steps</h3>
            <ol>
              <li>Check API status above</li>
              <li>If APIs are failing, we need to verify credentials</li>
              <li>Test ferry search to see actual error messages</li>
              <li>Ferry card component is working and ready for real data</li>
            </ol>
          </div>
        </Column>
      </Section>
    </main>
  );
}
