import { FerryApiService } from "./ferryApiService";
import { FerryCache } from "@/utils/ferryCache";
import {
  FerrySearchParams,
  UnifiedFerryResult,
  FerryClass,
  SeatLayout,
} from "@/types/FerryBookingSession.types";
import { LocationMappingService } from "./locationMappingService";

interface SealinkTripData {
  id: string;
  tripId: number;
  vesselID: number;
  aTime: { hour: number; minute: number };
  dTime: { hour: number; minute: number };
  from: string;
  to: string;
  pClass: Record<string, SealinkSeat>; // Object with seat keys, not array
  bClass: Record<string, SealinkSeat>; // Object with seat keys, not array
  fares: {
    pBaseFare: number;
    bBaseFare: number;
    infantFare: number;
  };
}

interface SealinkSeat {
  isBlocked: number;
  isBooked: number;
  number: string;
  tier: string;
}

interface SealinkApiResponse {
  err: null | string;
  data: SealinkTripData[];
}

export class SealinkService {
  private static readonly BASE_URL =
    process.env.SEALINK_API_URL || "http://api.dev.gonautika.com:8012/";
  private static readonly USERNAME = process.env.SEALINK_USERNAME;
  private static readonly TOKEN = process.env.SEALINK_TOKEN;

  // Cache for storing trip data by unified ferry ID
  private static tripDataCache = new Map<string, SealinkTripData>();

  /**
   * Debug method to show cached trip IDs
   */
  static getCachedTripIds(): string[] {
    return Array.from(this.tripDataCache.keys());
  }

  /**
   * Debug method to clear trip cache
   */
  static clearTripCache(): void {
    this.tripDataCache.clear();
    console.log("🗑️ Sealink: Trip cache cleared");
  }

  static async searchTrips(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    console.log(
      `🚢 Sealink Service: Starting search for ${params.from} → ${params.to} on ${params.date}`
    );

    // Validate credentials
    if (!this.USERNAME || !this.TOKEN) {
      console.error(`❌ Sealink credentials missing:`);
      console.error(`   USERNAME: ${this.USERNAME ? "✅ Set" : "❌ Missing"}`);
      console.error(`   TOKEN: ${this.TOKEN ? "✅ Set" : "❌ Missing"}`);
      throw new Error("Sealink credentials not configured");
    }

    // Check if route is supported
    if (
      !LocationMappingService.isRouteSupported(
        "sealink",
        params.from,
        params.to
      )
    ) {
      console.log(
        `❌ Sealink does not support route: ${params.from} → ${params.to}`
      );
      return [];
    }

    // Check cache first
    const cacheKey = FerryCache.generateKey(params, "sealink");
    const cached = FerryCache.get(cacheKey);
    if (cached) {
      console.log(`📦 Sealink: Using cached results for ${cacheKey}`);
      return cached;
    }

    const apiCall = async (): Promise<SealinkApiResponse> => {
      // Convert date format from YYYY-MM-DD to DD-MM-YYYY
      const [year, month, day] = params.date.split("-");
      const sealinkDate = `${day}-${month}-${year}`;

      // Use centralized location mapping
      const fromLocation = LocationMappingService.getSealinkLocation(
        params.from
      );
      const toLocation = LocationMappingService.getSealinkLocation(params.to);

      const requestBody = {
        date: sealinkDate,
        from: fromLocation,
        to: toLocation,
        userName: this.USERNAME,
        token: this.TOKEN,
      };

      const fullUrl = `${this.BASE_URL}getTripData`;
      console.log(`🔗 Sealink API URL: ${fullUrl}`);
      console.log(`📝 Sealink request body:`, {
        ...requestBody,
        token: this.TOKEN ? `${this.TOKEN.substring(0, 10)}...` : "MISSING",
      });

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "AndamanExcursion/1.0",
          Accept: "application/json",
          Origin: "https://andamanexcursion.com", // Add origin header
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`📊 Sealink response status: ${response.status}`);
      console.log(
        `📋 Sealink response headers:`,
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Sealink error response:`, errorText);
        throw new Error(`Sealink API error: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log(`📨 Sealink raw response:`, responseText);

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ Sealink JSON parse error:`, parseError);
        console.error(`📄 Raw response that failed to parse:`, responseText);
        throw new Error(
          `Sealink API returned invalid JSON: ${responseText.substring(
            0,
            100
          )}...`
        );
      }
    };

    try {
      const response = await FerryApiService.callWithRetry(apiCall, "Sealink");

      if (response.err) {
        console.error(`❌ Sealink API returned error: ${response.err}`);
        throw new Error(`Sealink API error: ${response.err}`);
      }

      console.log(
        `✅ Sealink API success: Found ${response.data?.length || 0} trips`
      );
      const results = this.transformToUnified(response.data, params);
      console.log(
        `🔄 Sealink transformation: ${response.data.length} trips → ${results.length} unified results`
      );

      // Cache the results
      FerryCache.set(cacheKey, results);

      return results;
    } catch (error) {
      console.error("💥 Error searching Sealink:", error);
      throw error;
    }
  }

  private static transformToUnified(
    data: SealinkTripData[],
    params: FerrySearchParams
  ): UnifiedFerryResult[] {
    return data.map((trip) => {
      console.log("🚢 Raw Sealink trip data:", JSON.stringify(trip, null, 2));

      // Create unified ferry ID
      const unifiedFerryId = `sealink-${trip.id}`;

      // Store trip data in cache for later seat layout retrieval
      this.tripDataCache.set(unifiedFerryId, trip);
      console.log(`💾 Sealink: Cached trip data for ${unifiedFerryId}`);
      console.log(`🔍 Sealink: Original trip.id from API: "${trip.id}"`);
      console.log(`🔍 Sealink: Generated unified ID: "${unifiedFerryId}"`);

      // Convert objects to arrays for processing
      const pClassSeats = trip.pClass ? Object.values(trip.pClass) : [];
      const bClassSeats = trip.bClass ? Object.values(trip.bClass) : [];

      console.log(`📊 pClass seats count: ${pClassSeats.length}`);
      console.log(`📊 bClass seats count: ${bClassSeats.length}`);

      const classes: FerryClass[] = [];

      // Debug: Show sample seats from each class
      if (pClassSeats.length > 0) {
        console.log(`🔍 Sample pClass seats:`, pClassSeats.slice(0, 3));
      }
      if (bClassSeats.length > 0) {
        console.log(`🔍 Sample bClass seats:`, bClassSeats.slice(0, 3));
      }

      // Add Luxury class (pClass) if available
      if (pClassSeats.length > 0) {
        const availableSeats = pClassSeats.filter(
          (seat) => seat.isBlocked !== 1 && seat.isBooked !== 1
        ).length;

        console.log(
          `✨ Luxury class: ${
            pClassSeats.length
          } total seats, ${availableSeats} available, price: ${
            trip.fares?.pBaseFare || "N/A"
          }`
        );

        if (trip.fares?.pBaseFare) {
          classes.push({
            id: `${trip.id}-luxury`,
            name: "Luxury",
            price: trip.fares.pBaseFare,
            availableSeats,
            amenities: ["AC", "Comfortable Seating", "Refreshments"],
          });
        }
      }

      // Add Royal class (bClass) if available
      if (bClassSeats.length > 0) {
        const availableSeats = bClassSeats.filter(
          (seat) => seat.isBlocked !== 1 && seat.isBooked !== 1
        ).length;

        console.log(
          `👑 Royal class: ${
            bClassSeats.length
          } total seats, ${availableSeats} available, price: ${
            trip.fares?.bBaseFare || "N/A"
          }`
        );

        if (trip.fares?.bBaseFare) {
          classes.push({
            id: `${trip.id}-royal`,
            name: "Royal",
            price: trip.fares.bBaseFare,
            availableSeats,
            amenities: ["AC", "Premium Seating", "Priority Boarding", "Meal"],
          });
        }
      }

      console.log(
        `🎯 Sealink ferry ${trip.vesselID === 1 ? "Sealink" : "Nautika"} has ${
          classes.length
        } classes available`
      );

      // If no classes were created, let's investigate why
      if (classes.length === 0) {
        console.log(`❌ No classes created for trip ${trip.id}:`);
        console.log(`   - pClass exists: ${!!trip.pClass}`);
        console.log(`   - bClass exists: ${!!trip.bClass}`);
        console.log(`   - pClass seats count: ${pClassSeats.length}`);
        console.log(`   - bClass seats count: ${bClassSeats.length}`);
        console.log(`   - pBaseFare: ${trip.fares?.pBaseFare}`);
        console.log(`   - bBaseFare: ${trip.fares?.bBaseFare}`);
        console.log(`   - fares object:`, trip.fares);
      }

      const totalAvailableSeats = classes.reduce(
        (sum, cls) => sum + cls.availableSeats,
        0
      );

      return {
        id: unifiedFerryId,
        operator: "sealink" as const,
        operatorFerryId: trip.id,
        ferryName: trip.vesselID === 1 ? "Sealink" : "Nautika",
        route: {
          from: {
            name: trip.from,
            code: this.getLocationCode(trip.from),
          },
          to: {
            name: trip.to,
            code: this.getLocationCode(trip.to),
          },
          fromCode: this.getLocationCode(trip.from),
          toCode: this.getLocationCode(trip.to),
        },
        schedule: {
          departureTime: this.formatTime(trip.dTime),
          arrivalTime: this.formatTime(trip.aTime),
          duration: this.calculateDuration(trip.dTime, trip.aTime),
          date: params.date,
        },
        classes,
        availability: {
          totalSeats: pClassSeats.length + bClassSeats.length,
          availableSeats: totalAvailableSeats,
          lastUpdated: new Date().toISOString(),
        },
        pricing: {
          baseFare:
            classes.length > 0
              ? Math.min(...classes.map((c) => c.price))
              : trip.fares?.pBaseFare || trip.fares?.bBaseFare || 0,
          taxes: 0, // Sealink doesn't specify separate taxes
          portFee: 0,
          total:
            classes.length > 0
              ? Math.min(...classes.map((c) => c.price))
              : trip.fares?.pBaseFare || trip.fares?.bBaseFare || 0,
          currency: "INR" as const,
        },
        features: {
          supportsSeatSelection: true, // Sealink supports manual seat selection
          supportsAutoAssignment: true, // AND auto-assignment
          hasAC: true,
          hasWiFi: trip.vesselID === 2, // Nautika has WiFi
        },
        operatorData: {
          originalResponse: trip,
          bookingEndpoint: `${this.BASE_URL}bookSeats`,
          authToken: this.TOKEN,
        },
        isActive: true,
      };
    });
  }

  /**
   * Get seat layout for Sealink ferries
   * Now uses cached trip data instead of re-searching
   */
  static async getSeatLayout(
    ferryId: string, // This is the unified ferry ID (e.g., "sealink-12345")
    classId: string,
    travelDate: string
  ): Promise<SeatLayout> {
    try {
      console.log(
        `🪑 Sealink: Getting seat layout for ferry ${ferryId}, class ${classId}`
      );

      // Debug: Show all cached trip IDs
      const cachedIds = Array.from(this.tripDataCache.keys());
      console.log(`🔍 Sealink: Currently cached trip IDs:`, cachedIds);
      console.log(`🔍 Sealink: Looking for trip ID:`, ferryId);

      // First, check if we have cached trip data
      const cachedTripData = this.tripDataCache.get(ferryId);
      if (cachedTripData) {
        console.log(`✅ Sealink: Found cached trip data for ${ferryId}`);
        return this.extractSeatLayoutFromTripData(cachedTripData, classId);
      }

      // Check if there's a similar ID (maybe with slight differences)
      const similarIds = cachedIds.filter((id) => {
        const requestedBase = ferryId.replace("sealink-", "");
        const cachedBase = id.replace("sealink-", "");
        // Check if IDs are very similar (might be minor character differences)
        return (
          requestedBase.length === cachedBase.length &&
          requestedBase.substring(0, -2) === cachedBase.substring(0, -2)
        );
      });

      if (similarIds.length > 0) {
        console.log(`⚠️ Sealink: Found similar cached IDs:`, similarIds);
        console.log(`⚠️ Sealink: Using similar ID instead: ${similarIds[0]}`);
        const similarTripData = this.tripDataCache.get(similarIds[0]);
        if (similarTripData) {
          return this.extractSeatLayoutFromTripData(similarTripData, classId);
        }
      }

      console.log(
        `🔍 Sealink: No cached data for ${ferryId}, attempting to find through search...`
      );

      // If no cached data, try to find the trip through search
      // Try common Sealink routes
      const commonRoutes = [
        { from: "port-blair", to: "havelock" },
        { from: "havelock", to: "port-blair" },
        { from: "port-blair", to: "neil" },
        { from: "neil", to: "port-blair" },
      ];

      const baseParams = {
        date: travelDate,
        adults: 1,
        children: 0,
        infants: 0,
      };

      let foundTrip: UnifiedFerryResult | null = null;

      // Try common routes first (most Sealink trips are on these routes)
      for (const route of commonRoutes) {
        try {
          console.log(
            `🔍 Sealink: Searching ${route.from} → ${route.to} for trip ${ferryId}`
          );
          const searchParams: FerrySearchParams = { ...baseParams, ...route };

          // Force a fresh search by temporarily clearing cache
          const cacheKey = FerryCache.generateKey(searchParams, "sealink");
          const originalCached = FerryCache.get(cacheKey);

          const results = await this.searchTrips(searchParams);
          foundTrip = results.find((result) => result.id === ferryId) || null;

          if (foundTrip) {
            console.log(
              `✅ Sealink: Found trip ${ferryId} on route ${route.from} → ${route.to}`
            );
            break;
          }
        } catch (error) {
          console.log(
            `❌ Sealink: Route ${route.from} → ${route.to} search failed:`,
            error
          );
          // Continue searching other routes
        }
      }

      // If still not found, check the cached trip data again (might have been populated by recent search)
      if (!foundTrip) {
        const recentCachedData = this.tripDataCache.get(ferryId);
        if (recentCachedData) {
          console.log(
            `✅ Sealink: Found trip data in recent cache for ${ferryId}`
          );
          return this.extractSeatLayoutFromTripData(recentCachedData, classId);
        }
      }

      if (!foundTrip) {
        console.log(
          `❌ Sealink: Trip ${ferryId} not found on common routes for ${travelDate}`
        );
        throw new Error(
          `Sealink trip ${ferryId} not found for ${travelDate}. This could happen if:
          1. The trip is no longer available for the selected date
          2. The trip has been rescheduled to a different time
          3. The ferry service is temporarily suspended
          
          Please try searching for trips again to see current availability.`
        );
      }

      return this.extractSeatLayoutFromTrip(foundTrip, classId);
    } catch (error) {
      console.error("❌ Sealink: Error getting seat layout:", error);
      throw new Error(
        `Failed to get Sealink seat layout: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Extract seat layout from cached trip data
   */
  private static extractSeatLayoutFromTripData(
    tripData: SealinkTripData,
    classId: string
  ): SeatLayout {
    // Determine which class seats to use based on classId
    let seats: any[];
    let tier: string;

    if (classId.includes("luxury") || classId.includes("L")) {
      seats = Object.values(tripData.pClass || {});
      tier = "L";
    } else {
      seats = Object.values(tripData.bClass || {});
      tier = "R";
    }

    if (!seats || seats.length === 0) {
      throw new Error(`No seats available for class ${classId}`);
    }

    console.log(
      `🪑 Sealink: Creating seat layout for ${seats.length} seats in class ${classId}`
    );
    return this.createSeatLayout(seats, tier);
  }

  /**
   * Extract seat layout from trip data (fallback method)
   */
  private static extractSeatLayoutFromTrip(
    trip: UnifiedFerryResult,
    classId: string
  ): SeatLayout {
    // Extract original trip data
    const tripData = trip.operatorData.originalResponse as SealinkTripData;
    return this.extractSeatLayoutFromTripData(tripData, classId);
  }

  private static createSeatLayout(seats: any[], tier: string): SeatLayout {
    return {
      rows: Math.ceil(seats.length / 4), // Assume 4 seats per row
      seatsPerRow: 4,
      seats: seats.map((seat, index) => ({
        id: seat.number,
        number: seat.number,
        status:
          seat.isBooked === 1
            ? "booked"
            : seat.isBlocked === 1
            ? "blocked"
            : "available",
        type: index % 4 === 0 || index % 4 === 3 ? "window" : "aisle",
        position: {
          row: Math.floor(index / 4) + 1,
          column: (index % 4) + 1,
        },
      })),
    };
  }

  private static formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }

  private static formatTime(time: { hour: number; minute: number }): string {
    return `${time.hour.toString().padStart(2, "0")}:${time.minute
      .toString()
      .padStart(2, "0")}`;
  }

  private static calculateDuration(
    departure: { hour: number; minute: number },
    arrival: { hour: number; minute: number }
  ): string {
    const depMinutes = departure.hour * 60 + departure.minute;
    const arrMinutes = arrival.hour * 60 + arrival.minute;
    const diffMinutes = arrMinutes - depMinutes;

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours}h ${minutes}m`;
  }

  private static getPortCode(location: string): string {
    return LocationMappingService.getPortCode(location);
  }

  private static getLocationCode(locationName: string): string {
    const codeMap: Record<string, string> = {
      "Port Blair": "PB",
      "Swaraj Dweep": "HL",
      "Shaheed Dweep": "NL",
      Baratang: "BT",
    };
    return codeMap[locationName] || "??";
  }

  /**
   * Book seats using Sealink API following the provided documentation
   */
  static async bookSeats(bookingData: {
    id: string;
    tripId: number;
    vesselID: number;
    from: string;
    to: string;
    bookingTS: number;
    paxDetail: {
      email: string;
      phone: string;
      gstin: string;
      pax: Array<{
        name: string;
        age: number;
        gender: string;
        nationality: string;
        photoId: string;
        expiry: string;
        seat: string;
        tier: string;
      }>;
      infantPax: any[];
    };
    userData: {
      apiUser: {
        userName: string;
        agency: string;
        token: string;
        walletBalance: number;
      };
    };
    paymentData: {
      gstin: string;
    };
    token: string;
    userName: string;
  }): Promise<{
    seatStatus: boolean;
    pnr: string;
    index: number;
    requestData: any;
  }> {
    try {
      console.log("🎫 Sealink: Creating seat booking...", {
        tripId: bookingData.tripId,
        passengers: bookingData.paxDetail.pax.length,
        seats: bookingData.paxDetail.pax.map((p) => p.seat),
      });

      // Validate credentials
      if (!this.USERNAME || !this.TOKEN) {
        throw new Error("Sealink credentials not configured");
      }

      const apiCall = async () => {
        const requestBody = [
          {
            id: bookingData.id,
            tripId: bookingData.tripId,
            vesselID: bookingData.vesselID,
            from: bookingData.from,
            to: bookingData.to,
            bookingTS: bookingData.bookingTS,
            paxDetail: bookingData.paxDetail,
            userData: {
              apiUser: {
                userName: this.USERNAME,
                agency: bookingData.userData.apiUser.agency,
                token: this.TOKEN,
                walletBalance: bookingData.userData.apiUser.walletBalance,
              },
            },
            paymentData: bookingData.paymentData,
            token: this.TOKEN,
            userName: this.USERNAME,
          },
        ];

        console.log(
          "📝 Sealink booking request:",
          JSON.stringify(requestBody, null, 2)
        );

        const response = await fetch(`${this.BASE_URL}bookSeats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Sealink booking error response:", errorText);
          throw new Error(
            `Sealink booking API error: ${response.status} - ${errorText}`
          );
        }

        const responseText = await response.text();
        console.log("📨 Sealink booking raw response:", responseText);

        try {
          const result = JSON.parse(responseText);
          return Array.isArray(result) ? result[0] : result;
        } catch (parseError) {
          console.error("❌ Sealink booking JSON parse error:", parseError);
          throw new Error(
            `Sealink API returned invalid JSON: ${responseText.substring(
              0,
              100
            )}...`
          );
        }
      };

      const response = await FerryApiService.callWithRetry(
        apiCall,
        "Sealink-BookSeats"
      );

      if (response.seatStatus) {
        console.log("✅ Sealink booking successful:", response);
        return {
          seatStatus: response.seatStatus,
          pnr: response.pnr,
          index: response.index || 0,
          requestData: response.requestData,
        };
      } else {
        console.error("❌ Sealink booking failed:", response);
        throw new Error(`Sealink booking failed: ${JSON.stringify(response)}`);
      }
    } catch (error) {
      console.error("🚨 Sealink booking error:", error);
      throw error;
    }
  }
}
