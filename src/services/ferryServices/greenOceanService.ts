import {
  FerrySearchParams,
  UnifiedFerryResult,
  FerryClass,
  SeatLayout,
} from "@/types/FerryBookingSession.types";
import { FerryApiService } from "./ferryApiService";
import { FerryCache } from "@/utils/ferryCache";
import { LocationMappingService } from "./locationMappingService";
import * as crypto from "crypto";

interface GreenOceanRouteData {
  departure: string;
  arraival: string; // Note: API has typo "arraival" instead of "arrival"
  arrival?: string; // Optional fallback in case they fix the typo
  ferry_name: string;
  ferry_id: number;
  class_name: string;
  class_id: number;
  route_id: number;
  seat_available: number;
  adult_seat_rate: number;
  infant_seat_rate: number;
  port_fee: number;
  port_fee_infant: number;
  port_fee_status: number;
  is_port_fee_included: number;
  gst_status: number;
  cgst: number;
  ugst: number;
}

interface GreenOceanRouteResponse {
  status: string;
  message: string;
  data: Record<string, GreenOceanRouteData[]>;
}

interface GreenOceanSeat {
  seat_no: string;
  seat_numbering: string;
  status: "available" | "booked";
}

interface GreenOceanSeatLayoutResponse {
  status: string;
  message: string;
  data: {
    layout: GreenOceanSeat[];
  };
}

export class GreenOceanService {
  private static readonly BASE_URL =
    process.env.GREEN_OCEAN_API_URL ||
    "https://tickets.greenoceanseaways.com/test-v-1.0-api/";
  private static readonly PUBLIC_KEY = process.env.GREEN_OCEAN_PUBLIC_KEY;
  private static readonly PRIVATE_KEY = process.env.GREEN_OCEAN_PRIVATE_KEY;

  static async searchTrips(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    // Check if route is supported
    if (
      !LocationMappingService.isRouteSupported(
        "greenocean",
        params.from,
        params.to
      )
    ) {
      console.log(
        `Green Ocean does not support route: ${params.from} → ${params.to}`
      );
      return [];
    }

    // Check cache first
    const cacheKey = FerryCache.generateKey(params, "greenocean");
    const cached = FerryCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const apiCall = async (): Promise<GreenOceanRouteResponse> => {
      // Use centralized location mapping
      const fromId = LocationMappingService.getGreenOceanLocation(params.from);
      const toId = LocationMappingService.getGreenOceanLocation(params.to);
      const travelDate = this.formatDate(params.date);

      // Create request data object first
      const requestData = {
        from_id: fromId,
        dest_to: toId,
        number_of_adults: params.adults,
        number_of_infants: params.infants,
        travel_date: travelDate,
        public_key: this.PUBLIC_KEY,
      };

      // Generate hash according to Green Ocean documentation
      const hashString = this.generateHash(requestData);
      console.log(`Green Ocean generated hash: ${hashString}`);

      // Add hash to request data
      const requestBody = {
        ...requestData,
        hash_string: hashString,
      };

      console.log(`Green Ocean request body:`, requestBody);
      // Fixed: Add v1/ prefix to the endpoint
      console.log(`Green Ocean URL: ${this.BASE_URL}v1/route-details`);

      const response = await fetch(`${this.BASE_URL}v1/route-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`Green Ocean response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Green Ocean error response:`, errorText);
        throw new Error(
          `Green Ocean API error: ${response.status} - ${errorText}`
        );
      }

      const responseText = await response.text();
      console.log(`Green Ocean raw response:`, responseText);

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error(`Green Ocean JSON parse error:`, parseError);
        throw new Error(
          `Green Ocean API returned invalid JSON: ${responseText.substring(
            0,
            100
          )}...`
        );
      }
    };

    try {
      const response = await FerryApiService.callWithRetry(
        apiCall,
        "GreenOcean"
      );

      if (response.status !== "success") {
        throw new Error(`Green Ocean API error: ${response.message}`);
      }

      const results = await this.transformToUnified(response.data, params);
      console.log(
        `Green Ocean found routes, transformed to ${results.length} unified results`
      );

      // Cache results
      FerryCache.set(cacheKey, results);

      return results;
    } catch (error) {
      console.error("Error searching Green Ocean:", error);
      throw error;
    }
  }

  static async getSeatLayout(
    routeId: number,
    ferryId: number,
    classId: number,
    travelDate: string
  ): Promise<SeatLayout> {
    const apiCall = async (): Promise<GreenOceanSeatLayoutResponse> => {
      // Format travel date for the API
      const formattedDate = this.formatDate(travelDate);

      // Get location IDs for the hash (you might need to pass these as parameters)
      const fromId = 1; // You'll need to get this from the route context
      const toId = 2; // You'll need to get this from the route context

      const requestData = {
        from_id: fromId,
        dest_to: toId,
        ship_id: ferryId, // Note: API expects ship_id in request body
        ferry_id: ferryId, // But we use ferry_id for hash generation
        route_id: routeId,
        class_id: classId,
        travel_date: formattedDate,
        public_key: this.PUBLIC_KEY,
        bootstrap_css: true,
        html_response: false,
      };

      const hashString = this.generateSeatLayoutHash(requestData);

      const requestBody = {
        from_id: requestData.from_id,
        dest_to: requestData.dest_to,
        ship_id: requestData.ship_id, // Use ship_id in the actual request
        route_id: requestData.route_id,
        class_id: requestData.class_id,
        travel_date: requestData.travel_date,
        public_key: requestData.public_key,
        bootstrap_css: requestData.bootstrap_css,
        html_response: requestData.html_response,
        hash_string: hashString,
      };

      // Fixed: Add v1/ prefix to the endpoint
      const response = await fetch(`${this.BASE_URL}v1/seat-layout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Green Ocean seat layout error response:`, errorText);
        throw new Error(
          `Green Ocean seat layout API error: ${response.status} - ${errorText}`
        );
      }

      return response.json();
    };

    const response = await FerryApiService.callWithRetry(
      apiCall,
      "GreenOcean-SeatLayout"
    );

    if (response.status !== "success") {
      throw new Error(`Green Ocean seat layout error: ${response.message}`);
    }

    return this.transformSeatLayout(response.data.layout);
  }

  // Fixed: Proper hash generation following PHP example
  private static generateHash(requestData: any): string {
    // Hash sequence as per documentation
    const hashSequence =
      "from_id|dest_to|number_of_adults|number_of_infants|travel_date|public_key";
    const sequenceArray = hashSequence.split("|");

    let hashString = "";

    // Build hash string according to sequence
    sequenceArray.forEach((key) => {
      const value = requestData[key];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          hashString += value.join(",");
        } else {
          hashString += value.toString();
        }
      }
      hashString += "|";
    });

    // Add private key at the end
    hashString += this.PRIVATE_KEY;

    console.log(`Green Ocean hash string: ${hashString}`);

    // Create SHA512 hash and convert to lowercase
    const hash = crypto.createHash("sha512");
    hash.update(hashString, "utf-8");
    const generatedHash = hash.digest("hex").toLowerCase();

    return generatedHash;
  }

  private static async transformToUnified(
    data: Record<string, GreenOceanRouteData[]>,
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    const results: UnifiedFerryResult[] = [];

    for (const [routeId, routes] of Object.entries(data)) {
      // Group routes by ferry and departure time
      const ferryGroups = new Map<string, GreenOceanRouteData[]>();

      routes.forEach((route) => {
        const key = `${route.ferry_id}-${route.departure}`;
        if (!ferryGroups.has(key)) {
          ferryGroups.set(key, []);
        }
        ferryGroups.get(key)!.push(route);
      });

      for (const [ferryKey, ferryRoutes] of ferryGroups) {
        const primaryRoute = ferryRoutes[0];

        // Create classes from the different class types for this ferry
        const classes: FerryClass[] = [];
        let totalAvailableSeats = 0;

        for (const route of ferryRoutes) {
          // Get seat layout for this class
          let seatLayout: SeatLayout | undefined;
          try {
            seatLayout = await this.getSeatLayout(
              route.route_id,
              route.ferry_id,
              route.class_id,
              this.formatDate(params.date)
            );
          } catch (error) {
            console.warn(
              `Failed to get seat layout for ${route.class_name}:`,
              error
            );
          }

          const classPrice =
            route.adult_seat_rate +
            (route.port_fee_status ? route.port_fee : 0);

          classes.push({
            id: route.class_id.toString(),
            name: route.class_name,
            price: classPrice,
            availableSeats: route.seat_available,
            amenities: this.getAmenitiesForClass(route.class_name),
            seatLayout,
          });

          totalAvailableSeats += route.seat_available;
        }

        const minPrice = Math.min(...classes.map((c) => c.price));
        const primaryClass = classes[0];

        results.push({
          id: `greenocean-${routeId}-${primaryRoute.ferry_id}`,
          operator: "greenocean" as const,
          operatorFerryId: primaryRoute.ferry_id.toString(),
          ferryName: primaryRoute.ferry_name,
          route: {
            from: {
              name: LocationMappingService.getDisplayName(params.from),
              code: LocationMappingService.getPortCode(params.from),
            },
            to: {
              name: LocationMappingService.getDisplayName(params.to),
              code: LocationMappingService.getPortCode(params.to),
            },
            fromCode: LocationMappingService.getPortCode(params.from),
            toCode: LocationMappingService.getPortCode(params.to),
          },
          schedule: {
            departureTime: this.formatTime(primaryRoute.departure),
            // Handle the API typo: "arraival" instead of "arrival"
            arrivalTime: this.formatTime(
              primaryRoute.arraival || primaryRoute.arrival || ""
            ),
            duration: this.calculateDuration(
              primaryRoute.departure,
              primaryRoute.arraival || primaryRoute.arrival || ""
            ),
            date: params.date,
          },
          classes,
          availability: {
            totalSeats: totalAvailableSeats,
            availableSeats: totalAvailableSeats,
            lastUpdated: new Date().toISOString(),
          },
          pricing: {
            baseFare: primaryRoute.adult_seat_rate,
            taxes: 0, // Green Ocean doesn't seem to have separate taxes
            portFee: primaryRoute.port_fee_status ? primaryRoute.port_fee : 0,
            total: minPrice,
            currency: "INR" as const,
          },
          features: {
            supportsSeatSelection: true,
            supportsAutoAssignment: false,
            hasAC: true,
          },
          operatorData: {
            originalResponse: { routeId, routes: ferryRoutes },
            bookingEndpoint: `${this.BASE_URL}v1/book-ticket`,
          },
          isActive: true,
        });
      }
    }

    return results;
  }

  private static transformSeatLayout(seats: GreenOceanSeat[]): SeatLayout {
    // Estimate rows based on seat numbering (assuming seats are numbered systematically)
    const maxSeatNumber = Math.max(
      ...seats.map((s) => parseInt(s.seat_no) || 0)
    );
    const estimatedRows = Math.ceil(maxSeatNumber / 4); // Assume 4 seats per row

    return {
      rows: estimatedRows,
      seatsPerRow: 4,
      seats: seats.map((seat, index) => ({
        id: seat.seat_no,
        number: seat.seat_numbering,
        status: seat.status === "booked" ? "booked" : "available",
        type: this.determineSeatType(seat.seat_numbering),
        position: {
          row: Math.floor(index / 4) + 1,
          column: (index % 4) + 1,
        },
      })),
    };
  }

  private static determineSeatType(
    seatNumber: string
  ): "window" | "aisle" | "middle" {
    // Simple heuristic based on seat numbering pattern
    const lastChar = seatNumber.charAt(seatNumber.length - 1).toUpperCase();
    if (lastChar === "A" || lastChar === "F") return "window";
    if (lastChar === "C" || lastChar === "D") return "aisle";
    return "middle";
  }

  private static getAmenitiesForClass(className: string): string[] {
    const baseAmenities = ["AC"];

    if (className.toLowerCase().includes("economy")) {
      return [...baseAmenities, "Basic Seating"];
    }

    if (className.toLowerCase().includes("premium")) {
      return [...baseAmenities, "Comfortable Seating", "More Legroom"];
    }

    if (className.toLowerCase().includes("royal")) {
      return [
        ...baseAmenities,
        "Premium Seating",
        "Priority Boarding",
        "Refreshments",
      ];
    }

    return baseAmenities;
  }

  private static generateSeatLayoutHash(requestData: any): string {
    // Hash sequence as per PHP example for seat layout
    const hashSequence =
      "from_id|dest_to|ship_id|route_id|class_id|travel_date|public_key";
    const sequenceArray = hashSequence.split("|");

    let hashString = "";

    sequenceArray.forEach((key) => {
      // Map ferry_id to ship_id for the hash
      const actualKey = key === "ship_id" ? "ferry_id" : key;
      const value = requestData[actualKey];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          hashString += value.join(",");
        } else {
          hashString += value.toString();
        }
      }
      hashString += "|";
    });

    hashString += this.PRIVATE_KEY;

    console.log(`Green Ocean seat layout hash string: ${hashString}`);

    const hash = crypto.createHash("sha512");
    hash.update(hashString, "utf-8");
    return hash.digest("hex").toLowerCase();
  }

  private static formatDate(isoDate: string): string {
    // Convert from YYYY-MM-DD to DD-MM-YYYY
    const date = new Date(isoDate);
    return `${date.getDate().toString().padStart(2, "0")}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${date.getFullYear()}`;
  }

  private static formatTime(time: string): string {
    // Handle the typo in API response: "arraival" instead of "arrival"
    if (!time || typeof time !== "string") {
      console.warn("Invalid time format received:", time);
      return "00:00";
    }

    // Convert "06:30 AM" to "06:30"
    const [timePart, period] = time.split(" ");
    if (!timePart || !period) {
      console.warn("Invalid time format:", time);
      return "00:00";
    }

    const [hours, minutes] = timePart.split(":");
    if (!hours || !minutes) {
      console.warn("Invalid time parts:", timePart);
      return "00:00";
    }

    let hour = parseInt(hours);

    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  }

  private static calculateDuration(departure: string, arrival: string): string {
    const depTime = this.formatTime(departure);
    const arrTime = this.formatTime(arrival);

    const depDate = new Date(`2000-01-01T${depTime}:00`);
    const arrDate = new Date(`2000-01-01T${arrTime}:00`);

    const diffMs = arrDate.getTime() - depDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours}h ${minutes}m`;
  }
}
