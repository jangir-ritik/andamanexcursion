import {
  FerrySearchParams,
  UnifiedFerryResult,
  FerryClass,
  SeatLayout,
} from "@/types/FerryBookingSession.types";
import { FerryApiService } from "./ferryApiService";
import { FerryCache } from "@/utils/ferryCache";

interface SealinkTripData {
  id: string;
  tripId: number;
  vesselID: number;
  aTime: { hour: number; minute: number };
  dTime: { hour: number; minute: number };
  from: string;
  to: string;
  pClass: Array<{
    isBlocked: number;
    isBooked: number;
    number: string;
    tier: string;
  }>;
  bClass: Array<{
    isBlocked: number;
    isBooked: number;
    number: string;
    tier: string;
  }>;
  fares: {
    pBaseFare: number;
    bBaseFare: number;
    infantFare: number;
  };
}

interface SealinkApiResponse {
  err: null | any;
  data: SealinkTripData[];
}

export class SealinkService {
  private static readonly BASE_URL =
    process.env.SEALINK_API_URL || "https://api.gonautika.com:8012/";
  private static readonly USERNAME = process.env.SEALINK_USERNAME;
  private static readonly TOKEN = process.env.SEALINK_TOKEN;

  static async searchTrips(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    // Check cache first
    const cacheKey = FerryCache.generateKey(params, "sealink");
    const cached = FerryCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const apiCall = async (): Promise<SealinkApiResponse> => {
      const requestBody = {
        date: this.formatDate(params.date), // Convert to dd-mm-yyyy
        from: this.mapLocationToSealink(params.from),
        to: this.mapLocationToSealink(params.to),
        userName: this.USERNAME,
        token: this.TOKEN,
      };

      const response = await fetch(`${this.BASE_URL}getTripData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Sealink API error: ${response.status}`);
      }

      return response.json();
    };

    try {
      const response = await FerryApiService.callWithRetry(apiCall, "Sealink");

      if (response.err) {
        throw new Error(`Sealink API error: ${response.err}`);
      }

      const unifiedResults = this.transformToUnified(response.data, params);

      // Cache results
      FerryCache.set(cacheKey, unifiedResults);

      return unifiedResults;
    } catch (error) {
      console.error("Sealink search failed:", error);
      throw error;
    }
  }

  private static transformToUnified(
    data: SealinkTripData[],
    params: FerrySearchParams
  ): UnifiedFerryResult[] {
    return data.map((trip) => {
      const ferryName = trip.vesselID === 1 ? "Sealink" : "Nautika";

      // Transform classes
      const classes: FerryClass[] = [];

      // Luxury class (pClass)
      if (trip.pClass.length > 0) {
        classes.push({
          id: "luxury",
          name: "Luxury",
          price: trip.fares.pBaseFare,
          availableSeats: trip.pClass.filter(
            (seat) => seat.isBooked === 0 && seat.isBlocked === 0
          ).length,
          amenities: ["AC", "Comfortable Seating"],
          seatLayout: this.createSeatLayout(trip.pClass, "L"),
        });
      }

      // Royal class (bClass)
      if (trip.bClass.length > 0) {
        classes.push({
          id: "royal",
          name: "Royal",
          price: trip.fares.bBaseFare,
          availableSeats: trip.bClass.filter(
            (seat) => seat.isBooked === 0 && seat.isBlocked === 0
          ).length,
          amenities: ["AC", "Premium Seating", "Priority Boarding"],
          seatLayout: this.createSeatLayout(trip.bClass, "R"),
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
        ferryName,
        route: {
          from: { name: trip.from, code: this.getPortCode(trip.from) },
          to: { name: trip.to, code: this.getPortCode(trip.to) },
          fromCode: this.getPortCode(trip.from),
          toCode: this.getPortCode(trip.to),
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

  private static mapLocationToSealink(location: string): string {
    const locationMap: Record<string, string> = {
      "port-blair": "Port Blair",
      havelock: "Swaraj Dweep",
      neil: "Shaheed Dweep",
    };
    return locationMap[location] || location;
  }

  private static getPortCode(location: string): string {
    const codeMap: Record<string, string> = {
      "Port Blair": "PB",
      "Swaraj Dweep": "HL",
      "Shaheed Dweep": "NL",
    };
    return codeMap[location] || location.substring(0, 2).toUpperCase();
  }
}
