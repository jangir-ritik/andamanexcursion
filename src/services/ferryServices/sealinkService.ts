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
  pClass: SealinkSeat[];
  bClass: SealinkSeat[];
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
    process.env.SEALINK_API_URL ||
    "http://api.dev.gonautika.com:8012/getTripData";
  private static readonly USERNAME = process.env.SEALINK_USERNAME;
  private static readonly TOKEN = process.env.SEALINK_TOKEN;

  static async searchTrips(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    // Check if route is supported
    if (
      !LocationMappingService.isRouteSupported(
        "sealink",
        params.from,
        params.to
      )
    ) {
      console.log(
        `Sealink does not support route: ${params.from} → ${params.to}`
      );
      return [];
    }

    // Check cache first
    const cacheKey = FerryCache.generateKey(params, "sealink");
    const cached = FerryCache.get(cacheKey);
    if (cached) {
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

      console.log(`Sealink request body:`, requestBody);
      console.log(`Sealink URL: ${this.BASE_URL}getTripData`);

      const response = await fetch(`${this.BASE_URL}getTripData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`Sealink response status: ${response.status}`);
      console.log(
        `Sealink response headers:`,
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Sealink error response:`, errorText);
        throw new Error(`Sealink API error: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log(`Sealink raw response:`, responseText);

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error(`Sealink JSON parse error:`, parseError);
        console.error(`Raw response that failed to parse:`, responseText);
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
        throw new Error(`Sealink API error: ${response.err}`);
      }

      const results = this.transformToUnified(response.data, params);
      console.log(
        `Sealink found ${response.data.length} trips, transformed to ${results.length} unified results`
      );

      // Cache the results
      FerryCache.set(cacheKey, results);

      return results;
    } catch (error) {
      console.error("Error searching Sealink:", error);
      throw error;
    }
  }

  private static transformToUnified(
    data: SealinkTripData[],
    params: FerrySearchParams
  ): UnifiedFerryResult[] {
    return data.map((trip) => {
      const classes: FerryClass[] = [];

      // Add Luxury class if available
      if (trip.pClass && trip.pClass.length > 0) {
        const availableSeats = trip.pClass.filter(
          (seat) => !seat.isBlocked && !seat.isBooked
        ).length;

        classes.push({
          id: `${trip.id}-luxury`,
          name: "Luxury",
          price: trip.fares.pBaseFare,
          availableSeats,
          amenities: ["AC", "Comfortable Seating", "Refreshments"],
        });
      }

      // Add Royal class if available
      if (trip.bClass && trip.bClass.length > 0) {
        const availableSeats = trip.bClass.filter(
          (seat) => !seat.isBlocked && !seat.isBooked
        ).length;

        classes.push({
          id: `${trip.id}-royal`,
          name: "Royal",
          price: trip.fares.bBaseFare,
          availableSeats,
          amenities: ["AC", "Premium Seating", "Priority Boarding", "Meal"],
        });
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
          totalSeats: trip.pClass.length + trip.bClass.length,
          availableSeats: totalAvailableSeats,
          lastUpdated: new Date().toISOString(),
        },
        pricing: {
          baseFare: Math.min(...classes.map((c) => c.price)),
          taxes: 0, // Sealink doesn't specify separate taxes
          portFee: 0,
          total: Math.min(...classes.map((c) => c.price)),
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
