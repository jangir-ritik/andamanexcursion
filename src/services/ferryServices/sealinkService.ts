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
        id: `sealink-${trip.id}`,
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
          supportsSeatSelection: true,
          supportsAutoAssignment: true,
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
}
