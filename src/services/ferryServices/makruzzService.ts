import {
  FerrySearchParams,
  UnifiedFerryResult,
  FerryClass,
} from "@/types/FerryBookingSession.types";
import { FerryApiService } from "./ferryApiService";
import { FerryCache } from "@/utils/ferryCache";
import { LocationMappingService } from "./locationMappingService";

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
  private static readonly USERNAME =
    process.env.MAKRUZZ_USERNAME || "ae@makruzz.com";
  private static readonly PASSWORD = process.env.MAKRUZZ_PASSWORD || "andexc";
  private static authToken: string | null = null;
  private static tokenExpiry: Date | null = null;

  static async searchTrips(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    // Check if route is supported
    if (
      !LocationMappingService.isRouteSupported(
        "makruzz",
        params.from,
        params.to
      )
    ) {
      console.log(
        `Makruzz does not support route: ${params.from} → ${params.to}`
      );
      return [];
    }

    // Check cache first
    const cacheKey = FerryCache.generateKey(params, "makruzz");
    const cached = FerryCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Ensure we're authenticated
    await this.ensureAuthenticated();
    console.log(
      `🔑 Makruzz: Using token: ${
        this.authToken ? this.authToken.substring(0, 10) + "..." : "NULL"
      }`
    );

    const apiCall = async (): Promise<MakruzzScheduleResponse> => {
      // Use centralized location mapping
      const fromLocation = LocationMappingService.getMakruzzLocation(
        params.from
      );
      const toLocation = LocationMappingService.getMakruzzLocation(params.to);

      const requestBody = {
        data: {
          trip_type: "single_trip",
          from_location: fromLocation,
          to_location: toLocation,
          travel_date: params.date, // Already in YYYY-MM-DD format
          no_of_passenger: params.adults.toString(),
        },
      };

      console.log(`Makruzz request body:`, requestBody);
      console.log(`Makruzz URL: ${this.BASE_URL}schedule_search`);

      // Create headers with the authentication token
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "AndamanExcursion/1.0",
      };

      // Add the authentication header as specified in the API docs
      if (this.authToken) {
        headers["Mak_Authorization"] = this.authToken;
      }

      console.log(
        `📤 Makruzz: Sending search request with Mak_Authorization header: ${
          this.authToken ? "YES" : "NO"
        }`
      );
      console.log(`📤 Makruzz: Headers:`, headers);
      console.log(
        `📤 Makruzz: Request body:`,
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch(`${this.BASE_URL}schedule_search`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody), // No token in body, only in header
      });

      console.log(`Makruzz response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Makruzz error response:`, errorText);
        throw new Error(`Makruzz API error: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log(`Makruzz raw response:`, responseText);

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error(`Makruzz JSON parse error:`, parseError);
        throw new Error(
          `Makruzz API returned invalid JSON: ${responseText.substring(
            0,
            100
          )}...`
        );
      }
    };

    try {
      const response = await FerryApiService.callWithRetry(apiCall, "Makruzz");

      if (response.code !== "200") {
        throw new Error(`Makruzz API error: ${response.msg}`);
      }

      const results = this.transformToUnified(response.data, params);
      console.log(
        `Makruzz found ${response.data.length} schedules, transformed to ${results.length} unified results`
      );

      // Cache results
      FerryCache.set(cacheKey, results);

      return results;
    } catch (error) {
      console.error("Error searching Makruzz:", error);
      throw error;
    }
  }

  private static async ensureAuthenticated(): Promise<void> {
    // Check if token is still valid (assuming 1 hour validity)
    if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      console.log(
        `🔑 Makruzz: Using cached token (expires: ${this.tokenExpiry})`
      );
      return;
    }

    console.log(`🔑 Makruzz: Authenticating with username: ${this.USERNAME}`);

    const loginCall = async (): Promise<MakruzzLoginResponse> => {
      const response = await fetch(`${this.BASE_URL}login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "AndamanExcursion/1.0",
        },
        body: JSON.stringify({
          data: {
            username: this.USERNAME,
            password: this.PASSWORD,
          },
        }),
      });

      console.log(`Makruzz login response status: ${response.status}`);
      console.log(
        `Makruzz login response headers:`,
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Makruzz login error response:`, errorText);
        throw new Error(
          `Makruzz login failed: ${response.status} - ${errorText}`
        );
      }

      const responseText = await response.text();
      console.log(`Makruzz login raw response:`, responseText);

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error(`Makruzz login JSON parse error:`, parseError);
        console.error(`Raw response that failed to parse:`, responseText);
        throw new Error(
          `Makruzz login returned invalid JSON: ${responseText.substring(
            0,
            100
          )}...`
        );
      }
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

      console.log(
        `✅ Makruzz: Successfully authenticated, token: ${
          this.authToken ? this.authToken.substring(0, 10) + "..." : "NULL"
        }`
      );
      console.log(`✅ Makruzz: Token expires at: ${this.tokenExpiry}`);
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
            name: LocationMappingService.getDisplayName(params.from),
            code: this.getLocationCode(schedule.source_location_id),
          },
          to: {
            name: LocationMappingService.getDisplayName(params.to),
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
          authToken: this.authToken || undefined,
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

  private static getLocationCode(locationId: string): string {
    return LocationMappingService.getPortCode(locationId);
  }
}
