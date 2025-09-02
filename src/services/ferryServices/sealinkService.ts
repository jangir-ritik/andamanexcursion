// src/services/ferryServices/sealinkService.ts
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
  pClass: Record<string, SealinkSeat>;
  bClass: Record<string, SealinkSeat>;
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
  err: string | null;
  data: SealinkTripData[] | null;
}

interface SealinkBookingRequest {
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
      age: string;
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
}

export class SealinkService {
  // ✅ FIXED: Use production URLs and correct credentials
  private static readonly BASE_URL =
    process.env.NODE_ENV === "production"
      ? "http://api.gonautika.com:8012/"
      : "http://api.dev.gonautika.com:8012/";

  // ✅ FIXED: Use exact credentials from Postman collection that work
  private static readonly USERNAME = process.env.SEALINK_USERNAME || "agent";
  private static readonly TOKEN =
    process.env.SEALINK_TOKEN ||
    "U2FsdGVkX18+ji7DedFzFnkTxo/aFlcWsvmp03XU5bgJ5XE9r1/DCIKHCabpP24hxlAB0F2kFnOYvu9FZaJiNA==";

  private static readonly tripDataCache = new Map<string, SealinkTripData>();

  /**
   * ✅ FIXED: Validate credentials with more robust checking
   */
  private static validateCredentials(): { username: string; token: string } {
    if (!this.USERNAME || !this.TOKEN) {
      throw new Error(
        "Sealink credentials not configured. Please set SEALINK_USERNAME and SEALINK_TOKEN environment variables."
      );
    }

    console.log(`🔑 Sealink: Token validation - Length: ${this.TOKEN.length}`);

    return {
      username: this.USERNAME,
      token: this.TOKEN,
    };
  }

  /**
   * ✅ FIXED: Enhanced authentication test with exact Postman format
   */
  private static async testAuthentication(): Promise<boolean> {
    try {
      console.log("🔐 Testing Sealink authentication...");

      const { username, token } = this.validateCredentials();

      // ✅ Use exact format from Postman getProfile endpoint
      const apiCall = async (): Promise<any> => {
        const response = await FerryApiService.fetchWithTimeout(
          `${this.BASE_URL}getProfile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "AndamanExcursion/1.0",
              Accept: "application/json",
            },
            body: JSON.stringify({
              userName: username,
              token: token,
            }),
          },
          10000 // 10 second timeout for auth test
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // ✅ Check if authentication was successful
        if (data.err) {
          throw new Error(`Auth failed: ${data.err}`);
        }

        return data.data;
      };

      const result = await FerryApiService.callWithRetry(
        apiCall,
        "Sealink-Auth",
        false
      );

      console.log("✅ Sealink authentication successful:", {
        username: result.userName || username,
        walletBalance: result.walletBalance,
      });

      return true;
    } catch (error) {
      console.error("❌ Sealink authentication failed:", error);
      return false;
    }
  }

  static async searchTrips(
    params: FerrySearchParams
  ): Promise<UnifiedFerryResult[]> {
    console.log(
      `🚢 Sealink Service: Starting search for ${params.from} → ${params.to} on ${params.date}`
    );

    const { username, token } = this.validateCredentials();

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

    // ✅ FIXED: Format date correctly (dd-mm-yyyy as per Postman)
    const formattedDate = this.formatDateForSealink(params.date);

    const apiCall = async (): Promise<SealinkApiResponse> => {
      // ✅ FIXED: Use proper location mapping for Sealink API
      const fromLocation = LocationMappingService.getSealinkLocation(
        params.from
      );
      const toLocation = LocationMappingService.getSealinkLocation(params.to);

      console.log(`🗺️ Sealink location mapping:`, {
        originalFrom: params.from,
        mappedFrom: fromLocation,
        originalTo: params.to,
        mappedTo: toLocation,
      });

      const response = await FerryApiService.fetchWithTimeout(
        `${this.BASE_URL}getTripData`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "AndamanExcursion/1.0",
            Accept: "application/json",
          },
          body: JSON.stringify({
            date: formattedDate,
            from: fromLocation, // ✅ FIXED: Use mapped location name
            to: toLocation, // ✅ FIXED: Use mapped location name
            userName: username,
            token: token,
          }),
        },
        8000
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    };

    try {
      const result = await FerryApiService.callWithRetry(
        apiCall,
        "Sealink-Search",
        false
      );

      if (result.err) {
        console.error("❌ Sealink search API error:", result.err);
        if (result.err.includes("Token Validation Failed")) {
          throw new Error(
            "Sealink authentication failed. Please check credentials."
          );
        }
        throw new Error(`Sealink search failed: ${result.err}`);
      }

      if (!result.data || !Array.isArray(result.data)) {
        console.log("📭 No trips found for Sealink");
        return [];
      }

      // Cache trip data for later use in booking
      result.data.forEach((trip) => {
        this.tripDataCache.set(trip.id, trip);
      });

      const unifiedResults = result.data.map((trip) =>
        this.transformToUnifiedFormat(trip, params)
      );

      // Cache results
      FerryCache.set(cacheKey, unifiedResults);

      console.log(`✅ Sealink: Found ${unifiedResults.length} trips`);
      return unifiedResults;
    } catch (error) {
      console.error("❌ Sealink search error:", error);
      return [];
    }
  }

  /**
   * ✅ FIXED: Format date in dd-mm-yyyy format as required by Sealink API
   */
  private static formatDateForSealink(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();
    return `${day}-${month}-${year}`;
  }

  private static transformToUnifiedFormat(
    trip: SealinkTripData,
    params: FerrySearchParams
  ): UnifiedFerryResult {
    const pClassSeats = Object.values(trip.pClass || {});
    const bClassSeats = Object.values(trip.bClass || {});

    const pAvailable = pClassSeats.filter(
      (seat) => seat.isBooked === 0 && seat.isBlocked === 0
    ).length;
    const bAvailable = bClassSeats.filter(
      (seat) => seat.isBooked === 0 && seat.isBlocked === 0
    ).length;

    const classes: FerryClass[] = [];

    if (pClassSeats.length > 0) {
      classes.push({
        id: `${trip.id}-premium`,
        name: "Premium",
        price: trip.fares.pBaseFare,
        availableSeats: pAvailable,
        amenities: ["Air Conditioning", "Comfortable Seating"],
        seatLayout: this.createSeatLayout(pClassSeats, "P"),
      });
    }

    if (bClassSeats.length > 0) {
      classes.push({
        id: `${trip.id}-business`,
        name: "Business",
        price: trip.fares.bBaseFare,
        availableSeats: bAvailable,
        amenities: ["Premium Seating", "Air Conditioning", "Priority Boarding"],
        seatLayout: this.createSeatLayout(bClassSeats, "B"),
      });
    }

    return {
      id: `sealink-${trip.id}`,
      operator: "sealink",
      operatorFerryId: trip.id,
      ferryName: trip.vesselID === 1 ? "Sealink" : "Nautika",
      route: {
        from: { name: trip.from, code: this.getLocationCode(trip.from) },
        to: { name: trip.to, code: this.getLocationCode(trip.to) },
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
        availableSeats: pAvailable + bAvailable,
        lastUpdated: new Date().toISOString(),
      },
      pricing: {
        baseFare: Math.min(trip.fares.pBaseFare, trip.fares.bBaseFare),
        taxes: 0,
        portFee: 0,
        total: Math.min(trip.fares.pBaseFare, trip.fares.bBaseFare),
        currency: "INR",
      },
      features: {
        supportsSeatSelection: true,
        supportsAutoAssignment: true,
        hasWiFi: false,
        hasAC: true,
        mealIncluded: false,
      },
      operatorData: {
        originalResponse: {
          ...trip,
          tripId: trip.tripId,
          vesselID: trip.vesselID,
        },
        bookingEndpoint: "bookSeats",
      },
      isActive: true,
    };
  }

  /**
   * ✅ COMPLETELY REWRITTEN: Book seats with exact Postman collection format
   */
  static async bookSeats(bookingData: SealinkBookingRequest): Promise<any> {
    try {
      console.log("🎫 Sealink: Creating seat booking...", {
        tripId: bookingData.tripId,
        passengers: bookingData.paxDetail.pax.length,
        seats: bookingData.paxDetail.pax.map((p) => p.seat),
      });

      // ✅ Test authentication first
      const authOk = await this.testAuthentication();
      if (!authOk) {
        throw new Error(
          "Sealink authentication failed. Please check credentials."
        );
      }

      const { username, token } = this.validateCredentials();

      // ✅ FIXED: Create request matching EXACT Postman collection structure
      const requestBody = {
        bookingData: [
          {
            bookingTS: bookingData.bookingTS,
            id: bookingData.id,
            tripId: bookingData.tripId,
            vesselID: bookingData.vesselID,
            from: bookingData.from,
            to: bookingData.to,
            paxDetail: {
              email: bookingData.paxDetail.email,
              phone: bookingData.paxDetail.phone,
              gstin: bookingData.paxDetail.gstin || "",
              pax: bookingData.paxDetail.pax.map((passenger, index) => ({
                id: index + 1, // ✅ CRITICAL: Add ID field as shown in Postman
                name: passenger.name,
                age: passenger.age.toString(), // ✅ CRITICAL: Age as string
                gender: passenger.gender, // M/F
                nationality: this.convertNationalityFormat(
                  passenger.nationality
                ), // "India" not "Indian"
                passport: passenger.photoId || "", // ✅ CRITICAL: Field name is "passport"
                tier: this.convertTierFormat(passenger.tier), // P/B not L/R
                seat: passenger.seat || "", // Seat number or empty for auto
                isCancelled: 0, // ✅ CRITICAL: Required field from Postman
              })),
              infantPax: bookingData.paxDetail.infantPax.map(
                (infant, index) => ({
                  id: index + 1,
                  name: infant.name || `Infant ${index + 1}`,
                  dobTS: infant.dobTS || Math.floor(Date.now() / 1000),
                  dob: infant.dob || new Date().toISOString().split("T")[0],
                  gender: infant.gender || "M",
                  nationality: this.convertNationalityFormat(
                    infant.nationality || "Indian"
                  ),
                  passport: infant.passport || "",
                  isCancelled: 0,
                })
              ),
              bClassSeats: bookingData.paxDetail.pax
                .filter((p) => this.convertTierFormat(p.tier) === "B" && p.seat)
                .map((p) => p.seat), // ✅ CRITICAL: Add seat arrays
              pClassSeats: bookingData.paxDetail.pax
                .filter((p) => this.convertTierFormat(p.tier) === "P" && p.seat)
                .map((p) => p.seat),
            },
            userData: {
              apiUser: {
                userName: username,
                agency: bookingData.userData.apiUser.agency || "",
                token: token,
                walletBalance: bookingData.userData.apiUser.walletBalance || 0,
              },
            },
            paymentData: {
              gstin: bookingData.paymentData.gstin || "",
            },
          },
        ],
        // ✅ CRITICAL: Root level authentication (as shown in Postman)
        userName: username,
        token: token,
      };

      console.log("📝 Sealink booking request (Postman format):", {
        bookingDataCount: requestBody.bookingData.length,
        id: requestBody.bookingData[0].id,
        tripId: requestBody.bookingData[0].tripId,
        vesselID: requestBody.bookingData[0].vesselID,
        passengers: requestBody.bookingData[0].paxDetail.pax.length,
        rootUserName: requestBody.userName,
        rootTokenLength: requestBody.token.length,
        // Log passenger details for validation
        passengerDetails: requestBody.bookingData[0].paxDetail.pax.map((p) => ({
          id: p.id,
          name: p.name,
          age: p.age,
          gender: p.gender,
          nationality: p.nationality,
          tier: p.tier,
          seat: p.seat,
        })),
      });

      // ✅ FIXED: API call with proper error handling
      const apiCall = async (): Promise<any> => {
        const response = await FerryApiService.fetchWithTimeout(
          `${this.BASE_URL}bookSeats`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "AndamanExcursion/1.0",
              Accept: "application/json",
            },
            body: JSON.stringify(requestBody),
          },
          45000 // ✅ INCREASED: 45 second timeout for booking
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Sealink booking HTTP error:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          throw new Error(
            `Sealink booking HTTP error: ${response.status} - ${errorText}`
          );
        }

        const responseText = await response.text();
        console.log("📨 Sealink booking raw response:", responseText);

        let parsedResponse: any;
        try {
          parsedResponse = JSON.parse(responseText);
        } catch (parseError) {
          console.error("❌ Sealink booking JSON parse error:", parseError);
          throw new Error(
            `Invalid JSON response: ${responseText.substring(0, 200)}...`
          );
        }

        // ✅ Handle response (should be array based on Postman examples)
        if (Array.isArray(parsedResponse)) {
          return parsedResponse[0];
        }

        return parsedResponse;
      };

      const response = await FerryApiService.callBookingApi(
        apiCall,
        "Sealink-BookSeats"
      );

      // ✅ Handle error response
      if (response.err) {
        console.error("❌ Sealink booking API error:", response.err);

        // Handle specific error types
        if (response.err.includes("Token Validation Failed")) {
          throw new Error(
            "Sealink authentication failed. The booking token is invalid or expired. Please contact support."
          );
        } else if (response.err.includes("invalid seat or tier values")) {
          throw new Error(
            "Invalid seat or tier selection. Please check seat availability and tier format."
          );
        } else if (response.err.includes("Seat already booked")) {
          throw new Error(
            "Selected seats are no longer available. Please select different seats."
          );
        } else if (response.err.includes("Trip not found")) {
          throw new Error(
            "Ferry trip is no longer available for booking. Please search for alternative trips."
          );
        }

        throw new Error(`Sealink booking failed: ${response.err}`);
      }

      // ✅ Handle successful response
      if (response && response.seatStatus && response.pnr) {
        console.log("✅ Sealink booking successful:", {
          pnr: response.pnr,
          seatStatus: response.seatStatus,
          index: response.index,
        });

        return {
          seatStatus: response.seatStatus,
          pnr: response.pnr,
          index: response.index || 0,
          requestData: response.requestData,
        };
      }

      // ✅ Handle unexpected response
      console.error("❌ Unexpected Sealink response format:", response);
      throw new Error(
        `Unexpected response format: ${JSON.stringify(response)}`
      );
    } catch (error) {
      console.error("🚨 Sealink booking API error:", error);
      throw error;
    }
  }

  /**
   * ✅ NEW: Convert nationality format for Sealink API
   */
  private static convertNationalityFormat(nationality: string): string {
    // Convert "Indian" to "India" as per Postman collection
    if (nationality.toLowerCase() === "indian") {
      return "India";
    }
    return nationality;
  }

  /**
   * ✅ NEW: Convert tier format for Sealink API
   */
  private static convertTierFormat(tier: string): string {
    // Convert L/R to P/B as per Postman collection
    if (
      tier === "L" ||
      tier.toLowerCase().includes("luxury") ||
      tier.toLowerCase().includes("premium")
    ) {
      return "P"; // Premium class
    }
    if (
      tier === "R" ||
      tier.toLowerCase().includes("royal") ||
      tier.toLowerCase().includes("business")
    ) {
      return "B"; // Business class
    }
    return tier; // Return as is if already in correct format
  }

  static async getSeatLayout(
    ferryId: string,
    classId: string,
    travelDate: string
  ): Promise<SeatLayout> {
    const cachedTripData = this.tripDataCache.get(ferryId);
    if (cachedTripData) {
      return this.extractSeatLayoutFromTripData(cachedTripData, classId);
    }
    throw new Error(`Trip data not found for ${ferryId}`);
  }

  private static extractSeatLayoutFromTripData(
    tripData: SealinkTripData,
    classId: string
  ): SeatLayout {
    let seats: any[];
    let tier: string;

    if (classId.includes("premium") || classId.includes("P")) {
      seats = Object.values(tripData.pClass || {});
      tier = "P";
    } else {
      seats = Object.values(tripData.bClass || {});
      tier = "B";
    }

    return this.createSeatLayout(seats, tier);
  }

  private static createSeatLayout(seats: any[], tier: string): SeatLayout {
    return {
      rows: Math.ceil(seats.length / 4),
      seatsPerRow: 4,
      seats: seats.map((seat, index) => ({
        id: seat.number,
        number: seat.number,
        seat_numbering: seat.number, // Add the required seat_numbering property
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

  private static getLocationCode(locationName: string): string {
    const codeMap: Record<string, string> = {
      "Port Blair": "PB",
      "Swaraj Dweep": "HL",
      "Shaheed Dweep": "NL",
      // Baratang: "BT",
    };
    return codeMap[locationName] || "??";
  }
}
