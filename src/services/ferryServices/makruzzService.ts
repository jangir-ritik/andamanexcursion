import {
  FerrySearchParams,
  UnifiedFerryResult,
  FerryClass,
} from "@/types/FerryBookingSession.types";
import { FerryApiService } from "./ferryApiService";
import { FerryCache } from "@/utils/ferryCache";

interface MakruzzLoginResponse {
  data: {
    token: string;
    agent_data: {
      agent_name: string;
      business_name: string;
      business_email: string;
      agent_contact: string;
    };
  };
  msg: string;
  code: string;
}

interface MakruzzScheduleData {
  id: string;
  source_location_id: string;
  destination_location_id: string;
  departure_time: string;
  arrival_time: string;
  from_date: string;
  to_date: string;
  ship_title: string;
  ship_class_title: string;
  total_seat: string;
  ship_class_price: string;
  seat: number;
  "cgst%": number;
  cgst_amount: number;
  "ugst%": number;
  ugst_amount: number;
  psf: number;
  commision: string;
}

interface MakruzzScheduleResponse {
  data: MakruzzScheduleData[];
  msg: string;
  code: string;
}

export class MakruzzService {
  private static readonly BASE_URL =
    process.env.MAKRUZZ_API_URL || "https://staging.makruzz.com/booking_api/";
  private static readonly USERNAME = process.env.MAKRUZZ_USERNAME;
  private static readonly PASSWORD = process.env.MAKRUZZ_PASSWORD;
  private static authToken: string | null = null;
  private static tokenExpiry: Date | null = null;

  static async searchTrips(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    // Check cache first
    const cacheKey = FerryCache.generateKey(params, "makruzz");
    const cached = FerryCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Ensure we have a valid token
    await this.ensureAuthenticated();

    const apiCall = async (): Promise<MakruzzScheduleResponse> => {
      const requestBody = {
        data: {
          trip_type: "single_trip",
          from_location: this.mapLocationToMakruzz(params.from),
          to_location: this.mapLocationToMakruzz(params.to),
          travel_date: params.date, // Already in yyyy-mm-dd format
          no_of_passenger: (params.adults + params.children).toString(),
        },
      };

      const response = await fetch(`${this.BASE_URL}search_schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Makruzz API error: ${response.status}`);
      }

      return response.json();
    };

    try {
      const response = await FerryApiService.callWithRetry(apiCall, "Makruzz");

      if (response.code !== "200") {
        throw new Error(`Makruzz API error: ${response.msg}`);
      }

      const unifiedResults = this.transformToUnified(response.data, params);

      // Cache results
      FerryCache.set(cacheKey, unifiedResults);

      return unifiedResults;
    } catch (error) {
      console.error("Makruzz search failed:", error);
      throw error;
    }
  }

  private static async ensureAuthenticated(): Promise<void> {
    // Check if token is still valid (assuming 1 hour validity)
    if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return;
    }

    const loginCall = async (): Promise<MakruzzLoginResponse> => {
      const response = await fetch(`${this.BASE_URL}agent_login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            username: this.USERNAME,
            password: this.PASSWORD,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Makruzz login failed: ${response.status}`);
      }

      return response.json();
    };

    try {
      const loginResponse = await FerryApiService.callWithRetry(
        loginCall,
        "Makruzz-Login"
      );

      if (loginResponse.code !== "200") {
        throw new Error(`Makruzz login error: ${loginResponse.msg}`);
      }

      this.authToken = loginResponse.data.token;
      this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    } catch (error) {
      console.error("Makruzz authentication failed:", error);
      throw error;
    }
  }

  private static transformToUnified(
    data: MakruzzScheduleData[],
    params: FerrySearchParams
  ): UnifiedFerryResult[] {
    return data.map((schedule) => {
      // Create classes based on ship class
      const classes: FerryClass[] = [
        {
          id: schedule.id,
          name: schedule.ship_class_title,
          price: parseFloat(schedule.ship_class_price),
          availableSeats: schedule.seat,
          amenities: this.getAmenitiesForClass(schedule.ship_class_title),
          // Makruzz uses auto-assignment, no seat layout
        },
      ];

      const totalPrice =
        parseFloat(schedule.ship_class_price) +
        schedule.cgst_amount +
        schedule.ugst_amount +
        schedule.psf;

      return {
        id: `makruzz-${schedule.id}`,
        operator: "makruzz" as const,
        operatorFerryId: schedule.id,
        ferryName: schedule.ship_title,
        route: {
          from: {
            name: this.getLocationName(schedule.source_location_id),
            code: this.getLocationCode(schedule.source_location_id),
          },
          to: {
            name: this.getLocationName(schedule.destination_location_id),
            code: this.getLocationCode(schedule.destination_location_id),
          },
          fromCode: this.getLocationCode(schedule.source_location_id),
          toCode: this.getLocationCode(schedule.destination_location_id),
        },
        schedule: {
          departureTime: this.formatTime(schedule.departure_time),
          arrivalTime: this.formatTime(schedule.arrival_time),
          duration: this.calculateDuration(
            schedule.departure_time,
            schedule.arrival_time
          ),
          date: params.date,
        },
        classes,
        availability: {
          totalSeats: parseInt(schedule.total_seat),
          availableSeats: schedule.seat,
          lastUpdated: new Date().toISOString(),
        },
        pricing: {
          baseFare: parseFloat(schedule.ship_class_price),
          taxes: schedule.cgst_amount + schedule.ugst_amount,
          portFee: schedule.psf,
          total: totalPrice,
          currency: "INR" as const,
        },
        features: {
          supportsSeatSelection: false, // Makruzz uses auto-assignment
          supportsAutoAssignment: true,
          hasAC: true,
          hasWiFi: schedule.ship_title.toLowerCase().includes("gold"),
        },
        operatorData: {
          originalResponse: schedule,
          bookingEndpoint: `${this.BASE_URL}save_passengers`,
          authToken: this.authToken,
        },
        isActive: true,
      };
    });
  }

  private static getAmenitiesForClass(className: string): string[] {
    const baseAmenities = ["AC", "Comfortable Seating"];

    if (className.toLowerCase().includes("premium")) {
      return [...baseAmenities, "Priority Boarding", "Refreshments"];
    }

    if (className.toLowerCase().includes("deluxe")) {
      return [
        ...baseAmenities,
        "Premium Seating",
        "Priority Boarding",
        "Meal",
        "WiFi",
      ];
    }

    return baseAmenities;
  }

  private static formatTime(time: string): string {
    // Convert "08:00:00" to "08:00"
    return time.substring(0, 5);
  }

  private static calculateDuration(departure: string, arrival: string): string {
    const depTime = new Date(`2000-01-01T${departure}`);
    const arrTime = new Date(`2000-01-01T${arrival}`);

    const diffMs = arrTime.getTime() - depTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours}h ${minutes}m`;
  }

  private static mapLocationToMakruzz(location: string): string {
    const locationMap: Record<string, string> = {
      "port-blair": "1",
      havelock: "2",
      neil: "3",
      baratang: "4",
    };
    return locationMap[location] || "1";
  }

  private static getLocationName(locationId: string): string {
    const nameMap: Record<string, string> = {
      "1": "Port Blair",
      "2": "Swaraj Deep (Havelock)",
      "3": "Shaheed Deep (Neil Island)",
      "4": "Baratang",
    };
    return nameMap[locationId] || "Unknown";
  }

  private static getLocationCode(locationId: string): string {
    const codeMap: Record<string, string> = {
      "1": "PB",
      "2": "HL",
      "3": "NL",
      "4": "BT",
    };
    return codeMap[locationId] || "??";
  }
}
