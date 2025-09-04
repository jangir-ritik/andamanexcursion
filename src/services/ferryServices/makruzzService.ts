import { FerryApiService } from "./ferryApiService";
import { FerryCache } from "@/utils/ferryCache";
import {
  FerrySearchParams,
  UnifiedFerryResult,
  FerryClass,
} from "@/types/FerryBookingSession.types";
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
  ship_class_id: string; // ✅ ADD: Missing field for class ID
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

interface MakruzzBookingResponse {
  data: {
    booking_id: number;
    schedule_id: string;
    class_id: string;
    travel_date: string;
  };
  msg: string;
  code: string;
}

interface MakruzzConfirmResponse {
  data: {
    pnr: string;
  };
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
    console.log(
      `🚢 Makruzz Service: Starting search for ${params.from} → ${params.to} on ${params.date}`
    );

    // Check if route is supported
    if (
      !LocationMappingService.isRouteSupported(
        "makruzz",
        params.from,
        params.to
      )
    ) {
      console.log(
        `❌ Makruzz does not support route: ${params.from} → ${params.to}`
      );
      return [];
    }

    // Check cache first
    const cacheKey = FerryCache.generateKey(params, "makruzz");
    const cached = FerryCache.get(cacheKey);
    if (cached) {
      console.log(`📦 Makruzz: Using cached results for ${cacheKey}`);
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
      const fromLocationId = LocationMappingService.getMakruzzLocation(
        params.from
      );
      const toLocationId = LocationMappingService.getMakruzzLocation(params.to);

      const requestBody = {
        data: {
          trip_type: "single_trip",
          from_location: fromLocationId,
          to_location: toLocationId,
          travel_date: params.date, // Already in YYYY-MM-DD format
          no_of_passenger: (params.adults + params.children).toString(),
        },
      };

      console.log(`🔗 Makruzz API URL: ${this.BASE_URL}schedule_search`);
      console.log(`📝 Makruzz request body:`, requestBody);

      const response = await fetch(`${this.BASE_URL}schedule_search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Mak_Authorization: this.authToken || "",
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`📊 Makruzz response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Makruzz error response:`, errorText);
        throw new Error(`Makruzz API error: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log(`📨 Makruzz raw response:`, responseText);

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error(`❌ Makruzz JSON parse error:`, parseError);
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
        console.error(`❌ Makruzz API error: ${response.msg}`);
        throw new Error(`Makruzz API error: ${response.msg}`);
      }

      console.log(
        `✅ Makruzz API success: Found ${response.data?.length || 0} schedules`
      );
      const results = this.transformToUnified(response.data, params);
      console.log(
        `🔄 Makruzz transformation: ${response.data.length} schedules → ${results.length} unified results`
      );

      // Cache results
      FerryCache.set(cacheKey, results);

      return results;
    } catch (error) {
      console.error("💥 Error searching Makruzz:", error);
      throw error;
    }
  }

  private static async ensureAuthenticated(): Promise<void> {
    // Check if token is still valid (assuming 1 hour validity)
    if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return;
    }

    console.log("🔐 Makruzz: Authenticating...");

    if (!this.USERNAME || !this.PASSWORD) {
      throw new Error("Makruzz credentials not configured");
    }

    const loginBody = {
      data: {
        username: this.USERNAME,
        password: this.PASSWORD,
      },
    };

    console.log(`🔗 Makruzz login URL: ${this.BASE_URL}login`);
    console.log(`📝 Makruzz login request:`, {
      data: {
        username: this.USERNAME,
        password: this.PASSWORD ? "[HIDDEN]" : "MISSING",
      },
    });

    const response = await fetch(`${this.BASE_URL}login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Makruzz login error:`, errorText);
      throw new Error(
        `Makruzz login failed: ${response.status} - ${errorText}`
      );
    }

    const loginResponse: MakruzzLoginResponse = await response.json();
    console.log(`📨 Makruzz login response:`, loginResponse);

    if (loginResponse.code !== "200") {
      throw new Error(`Makruzz login failed: ${loginResponse.msg}`);
    }

    this.authToken = loginResponse.data.token;
    this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    console.log(`✅ Makruzz authentication successful`);
  }

  private static transformToUnified(
    data: MakruzzScheduleData[],
    params: FerrySearchParams
  ): UnifiedFerryResult[] {
    return data.map((schedule) => {
      console.log(
        "🚢 Raw Makruzz schedule data:",
        JSON.stringify(schedule, null, 2)
      );

      // Create unified ferry ID
      const ferryId = `makruzz-${schedule.id}-${schedule.ship_title
        .toLowerCase()
        .replace(/\s+/g, "")}-${params.date}`;

      // Calculate duration
      const [depHour, depMin] = schedule.departure_time.split(":").map(Number);
      const [arrHour, arrMin] = schedule.arrival_time.split(":").map(Number);
      const depMinutes = depHour * 60 + depMin;
      const arrMinutes = arrHour * 60 + arrMin;
      const durationMinutes = arrMinutes - depMinutes;
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      const duration = `${hours}h ${minutes}m`;

      // Calculate total price including taxes
      const baseFare = parseFloat(schedule.ship_class_price);
      const cgstAmount = schedule.cgst_amount || 0;
      const ugstAmount = schedule.ugst_amount || 0;
      const psfAmount = schedule.psf || 0;
      const totalPrice = baseFare + cgstAmount + ugstAmount + psfAmount;

      const classes: FerryClass[] = [
        {
          // id: `makruzz-${
          //   schedule.id
          // }-${schedule.ship_class_title.toLowerCase()}`,
          id: schedule.ship_class_id.toString(),
          name: schedule.ship_class_title,
          price: totalPrice,
          availableSeats: schedule.seat,
          amenities: ["AC", "Comfortable Seating"],
          // No seat layout for Makruzz (auto-assignment)
        },
      ];

      const result: UnifiedFerryResult = {
        id: ferryId,
        operator: "makruzz",
        operatorFerryId: schedule.id,
        ferryName: schedule.ship_title,
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
          departureTime: schedule.departure_time.substring(0, 5), // HH:MM
          arrivalTime: schedule.arrival_time.substring(0, 5), // HH:MM
          duration,
          date: params.date,
        },
        classes,
        availability: {
          totalSeats: parseInt(schedule.total_seat),
          availableSeats: schedule.seat,
          lastUpdated: new Date().toISOString(),
        },
        pricing: {
          baseFare,
          taxes: cgstAmount + ugstAmount,
          portFee: psfAmount,
          total: totalPrice,
          currency: "INR",
        },
        features: {
          supportsSeatSelection: false, // Makruzz uses auto-assignment
          supportsAutoAssignment: true,
          hasAC: true,
          hasWiFi: false,
          mealIncluded: false,
        },
        operatorData: {
          originalResponse: schedule,
          bookingEndpoint: `${this.BASE_URL}savePassengers`,
          authToken: this.authToken || undefined, // ✅ FIX: Convert null to undefined
        },
        isActive: schedule.seat > 0,
      };

      console.log(
        `✅ Makruzz unified result: ${result.ferryName} ${result.schedule.departureTime} → ${result.schedule.arrivalTime} (${result.pricing.total} INR, ${result.availability.availableSeats} seats)`
      );

      return result;
    });
  }

  /**
   * Book passengers using Makruzz API (two-step process: save + confirm)
   */
  static async bookSeats(bookingData: {
    scheduleId: string;
    classId: string;
    travelDate: string;
    passengers: Array<{
      title: string;
      name: string;
      age: number;
      gender: string;
      nationality: string;
      fcountry?: string;
      fpassport?: string;
      fexpdate?: string;
    }>;
    contactDetails: {
      email: string;
      phone: string;
      name: string;
    };
    totalFare: number;
  }): Promise<{
    success: boolean;
    pnr?: string;
    bookingId?: number;
    error?: string;
  }> {
    try {
      console.log("🎫 Makruzz: Starting booking process...", {
        scheduleId: bookingData.scheduleId,
        passengers: bookingData.passengers.length,
        totalFare: bookingData.totalFare,
      });

      // Ensure we're authenticated
      await this.ensureAuthenticated();

      // VALIDATE CRITICAL FIELDS BEFORE API CALL
      console.log("🔍 Validating booking data...");

      // Ensure class_id is numeric
      if (isNaN(parseInt(bookingData.classId))) {
        throw new Error(
          `Invalid class_id: "${bookingData.classId}" must be numeric. Check your unified result transformation.`
        );
      }

      // Step 1: Save passengers with FIXED data format
      const saveResponse = await this.savePassengers(bookingData);

      if (!saveResponse.success || !saveResponse.bookingId) {
        throw new Error(saveResponse.error || "Failed to save passengers");
      }

      console.log(
        `✅ Makruzz: Passengers saved with booking ID: ${saveResponse.bookingId}`
      );

      // Step 2: Confirm booking
      const confirmResponse = await this.confirmBooking(saveResponse.bookingId);

      if (!confirmResponse.success || !confirmResponse.pnr) {
        throw new Error(confirmResponse.error || "Failed to confirm booking");
      }

      console.log(
        `✅ Makruzz: Booking confirmed with PNR: ${confirmResponse.pnr}`
      );

      return {
        success: true,
        pnr: confirmResponse.pnr,
        bookingId: saveResponse.bookingId,
      };
    } catch (error) {
      console.error("🚨 Makruzz booking error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Step 1: Save passengers to Makruzz
   */
  private static async savePassengers(bookingData: {
    scheduleId: string;
    classId: string;
    travelDate: string;
    passengers: Array<{
      title: string;
      name: string;
      age: number;
      gender: string;
      nationality: string;
      fcountry?: string;
      fpassport?: string;
      fexpdate?: string;
    }>;
    contactDetails: {
      email: string;
      phone: string;
      name: string;
    };
    totalFare: number;
  }): Promise<{
    success: boolean;
    bookingId?: number;
    error?: string;
  }> {
    const passengerData: Record<string, any> = {};

    bookingData.passengers.forEach((passenger, index) => {
      passengerData[`${index + 1}`] = {
        title: passenger.title.toUpperCase(), // Ensure uppercase
        name: passenger.name,
        age: passenger.age.toString(),
        sex: passenger.gender.toLowerCase(), // ✅ FIXED: Must be lowercase
        nationality: passenger.nationality.toLowerCase(), // ✅ FIXED: Must be lowercase
        fcountry: passenger.fcountry || "",
        fpassport: passenger.fpassport || "",
        fexpdate: passenger.fexpdate || "",
      };
    });

    // ✅ FIXED: Correct request format
    const requestBody = {
      data: {
        passenger: passengerData,
        c_name: bookingData.contactDetails.name,
        c_mobile: bookingData.contactDetails.phone,
        c_email: bookingData.contactDetails.email,
        p_contact: "123456",
        c_remark: "Online booking via Andaman Excursion",
        no_of_passenger: bookingData.passengers.length.toString(),
        schedule_id: bookingData.scheduleId, // Should be "763"
        travel_date: bookingData.travelDate, // Should be "2025-08-23"
        class_id: bookingData.classId, // ✅ FIXED: Now should be "19", not "makruzz-763-royal"
        fare: bookingData.totalFare.toString(),
        tc_check: true,
      },
    };

    console.log(
      "📝 Makruzz save passengers request:",
      JSON.stringify(requestBody, null, 2)
    );

    // Debug the critical fields
    console.log("🔍 Critical fields being sent:");
    console.log(
      `  schedule_id: "${
        requestBody.data.schedule_id
      }" (type: ${typeof requestBody.data.schedule_id})`
    );
    console.log(
      `  class_id: "${requestBody.data.class_id}" (type: ${typeof requestBody
        .data.class_id})`
    );
    console.log(`  travel_date: "${requestBody.data.travel_date}"`);
    console.log(`  no_of_passenger: "${requestBody.data.no_of_passenger}"`);

    const response = await fetch(`${this.BASE_URL}savePassengers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Mak_Authorization: this.authToken || "",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Makruzz save passengers error:", errorText);
      return {
        success: false,
        error: `Save passengers failed: ${response.status} - ${errorText}`,
      };
    }

    const responseText = await response.text();
    console.log("📨 Makruzz save passengers raw response:", responseText);

    try {
      const responseData = JSON.parse(responseText);
      console.log("📨 Makruzz save passengers parsed response:", responseData);

      if (responseData.code !== "200") {
        return {
          success: false,
          error: `Save passengers failed: ${responseData.msg}`,
        };
      }

      return {
        success: true,
        bookingId: responseData.data.booking_id,
      };
    } catch (parseError) {
      console.error("❌ Failed to parse Makruzz response:", parseError);
      return {
        success: false,
        error: `Invalid response format: ${responseText.substring(0, 200)}...`,
      };
    }
  }

  /**
   * Step 2: Confirm booking with Makruzz
   */
  private static async confirmBooking(bookingId: number): Promise<{
    success: boolean;
    pnr?: string;
    error?: string;
  }> {
    const requestBody = {
      data: {
        booking_id: bookingId.toString(),
      },
    };

    console.log("📝 Makruzz confirm booking request:", requestBody);

    const response = await fetch(`${this.BASE_URL}confirm_booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Mak_Authorization: this.authToken || "",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Makruzz confirm booking error:", errorText);
      return {
        success: false,
        error: `Confirm booking failed: ${response.status} - ${errorText}`,
      };
    }

    const responseData: MakruzzConfirmResponse = await response.json();
    console.log("📨 Makruzz confirm booking response:", responseData);

    if (responseData.code !== "200") {
      return {
        success: false,
        error: `Confirm booking failed: ${responseData.msg}`,
      };
    }

    return {
      success: true,
      pnr: responseData.data.pnr,
    };
  }

  /**
   * Get ticket PDF from Makruzz (if available)
   */
  static async getTicketPDF(bookingId: string): Promise<{
    success: boolean;
    pdfBase64?: string;
    error?: string;
  }> {
    try {
      await this.ensureAuthenticated();

      const requestBody = {
        data: {
          booking_id: bookingId,
        },
      };

      const response = await fetch(`${this.BASE_URL}download_ticket_pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Mak_Authorization: this.authToken || "",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(`❌ Makruzz PDF download failed: ${response.status}`);
        return {
          success: false,
          error: `PDF download failed: ${response.status}`,
        };
      }

      const pdfBase64 = await response.text();
      console.log(
        `✅ Makruzz PDF downloaded successfully (${pdfBase64.length} chars)`
      );

      return {
        success: true,
        pdfBase64,
      };
    } catch (error) {
      console.error("❌ Makruzz PDF download error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
