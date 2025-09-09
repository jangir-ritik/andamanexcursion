// src/services/ferryServices/ferryBookingService.ts
import { SealinkService } from "./sealinkService";
import { MakruzzService } from "./makruzzService";
import { GreenOceanService } from "./greenOceanService";
import { PDFService } from "../pdfService";

export interface FerryBookingRequest {
  operator: "sealink" | "makruzz" | "greenocean";
  ferryId: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  classId: string;
  routeId?: string; // Add routeId to interface
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  selectedSeats?: string[];
  passengerDetails: Array<{
    fullName: string;
    age: number;
    gender: string;
    nationality: string;
    passportNumber: string;
    whatsappNumber: string;
    phoneCountryCode?: string; // "+91"
    phoneCountry?: string; // "India"
    email: string;
  }>;
  paymentReference: string;
  totalAmount: number;
}

export interface FerryBookingResponse {
  success: boolean;
  bookingReference?: string;
  tickets?: any[];
  error?: string;
  pnr?: string; // Add PNR field
  providerBookingId?: string;
  confirmationDetails?: any;
}

export class FerryBookingService {
  private static sealinkService = new SealinkService();
  private static makruzzService = new MakruzzService();
  private static greenOceanService = new GreenOceanService();

  /**
   * Book ferry ticket with the appropriate provider after payment is confirmed
   */
  static async bookFerry(
    bookingRequest: FerryBookingRequest
  ): Promise<FerryBookingResponse> {
    try {
      console.log(
        `🎫 Ferry Booking: Starting ${bookingRequest.operator} booking`,
        {
          ferryId: bookingRequest.ferryId,
          passengers: bookingRequest.passengers,
          amount: bookingRequest.totalAmount,
        }
      );

      switch (bookingRequest.operator) {
        case "sealink":
          return await this.bookSealinkFerry(bookingRequest);

        case "makruzz":
          return await this.bookMakruzzFerry(bookingRequest);

        case "greenocean":
          return await this.bookGreenOceanFerry(bookingRequest);

        default:
          throw new Error(
            `Unsupported ferry operator: ${bookingRequest.operator}`
          );
      }
    } catch (error) {
      console.error(
        `❌ Ferry Booking Error (${bookingRequest.operator}):`,
        error
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Ferry booking failed",
      };
    }
  }

  private static async bookSealinkFerry(
    request: FerryBookingRequest
  ): Promise<FerryBookingResponse> {
    try {
      console.log("Sealink: Creating real booking via API...");

      // Extract original trip ID correctly
      const originalTripId = request.ferryId.startsWith("sealink-")
        ? request.ferryId.replace("sealink-", "")
        : request.ferryId;

      console.log(`Looking for cached trip data with ID: ${originalTripId}`);

      // Get trip data from SealinkService cache
      let cachedTripData = SealinkService.getCachedTripData(originalTripId);

      if (!cachedTripData) {
        console.warn(
          `Trip data not found in cache for ${originalTripId}. Available cached IDs:`,
          SealinkService.getCachedTripIds()
        );

        // Try to refetch trip data using the travel date from booking request
        console.log(`Attempting to refetch trip data for ${originalTripId}...`);

        try {
          // Use getSeatLayout which has the refetch logic built-in
          // This will populate the cache if the trip is found
          await SealinkService.getSeatLayout(
            request.ferryId, // Use full ferry ID with prefix
            request.classId || "premium", // Use provided class or default
            request.date // Travel date
          );

          // Try to get cached data again after refetch
          cachedTripData = SealinkService.getCachedTripData(originalTripId);

          if (cachedTripData) {
            console.log(
              `✅ Successfully refetched trip data for ${originalTripId}`
            );
          }
        } catch (refetchError) {
          console.warn(`Failed to refetch trip data:`, refetchError);
        }

        // If still no cached data after refetch attempt
        if (!cachedTripData) {
          throw new Error(
            `Trip data not found for ferry ID: ${originalTripId}. ` +
              `Refetch attempt failed. Available cached IDs: ${SealinkService.getCachedTripIds().join(
                ", "
              )}. ` +
              `This may happen if the trip is no longer available or the search parameters cannot be reconstructed.`
          );
        }
      }

      // Use the correct values from cached trip data
      const tripId = cachedTripData.tripId;
      const vesselID = cachedTripData.vesselID;
      const bookingId = cachedTripData.id;

      console.log(`Using trip data from cache:`, {
        originalFerryId: request.ferryId,
        bookingId: bookingId,
        tripId: tripId,
        vesselID: vesselID,
      });

      // Better location mapping
      const fromLocation = this.getSealinkLocationName(request.fromLocation);
      const toLocation = this.getSealinkLocationName(request.toLocation);

      // Improved passenger mapping
      const passengerDetails = request.passengerDetails.map(
        (passenger, index) => ({
          name: passenger.fullName,
          age: passenger.age.toString(),
          gender: passenger.gender === "Male" ? "M" : "F",
          nationality: passenger.nationality,
          photoId: passenger.passportNumber || "A1234567",
          expiry: "",
          seat: request.selectedSeats?.[index] || "",
          tier: this.getSealinkTier(request.classId),
        })
      );

      // Create booking data with correct IDs
      const bookingData = {
        id: bookingId, // Use the original booking ID from getTripData
        tripId: tripId, // Use the actual trip ID from getTripData
        vesselID: vesselID, // Use the actual vessel ID from getTripData
        from: fromLocation,
        to: toLocation,
        bookingTS: Math.floor(Date.now() / 1000),
        paxDetail: {
          email: request.passengerDetails[0]?.email || "",
          phone: request.passengerDetails[0]?.whatsappNumber || "",
          gstin: "",
          pax: passengerDetails,
          infantPax: [],
        },
        userData: {
          apiUser: {
            userName: process.env.SEALINK_USERNAME || "agent",
            agency: process.env.SEALINK_AGENCY || "",
            token: process.env.SEALINK_TOKEN || "",
            walletBalance: 10000,
          },
        },
        paymentData: {
          gstin: "",
        },
      };

      console.log("Final booking data prepared:", {
        id: bookingData.id,
        tripId: bookingData.tripId,
        vesselID: bookingData.vesselID,
        from: bookingData.from,
        to: bookingData.to,
        passengersCount: bookingData.paxDetail.pax.length,
      });

      // Call booking API
      const bookingResult = await SealinkService.bookSeats(bookingData);

      if (bookingResult && bookingResult.seatStatus && bookingResult.pnr) {
        console.log("Sealink booking confirmed:", {
          pnr: bookingResult.pnr,
          seatStatus: bookingResult.seatStatus,
        });

        return {
          success: true,
          pnr: bookingResult.pnr,
          providerBookingId: bookingResult.pnr,
          bookingReference: `SEALINK_${request.paymentReference}`,
          confirmationDetails: {
            operator: "sealink",
            status: "confirmed",
            pnr: bookingResult.pnr,
            tripId: tripId,
            vesselID: vesselID,
            seats: request.selectedSeats || ["AUTO_ASSIGNED"],
            tickets: request.passengerDetails.map((passenger, index) => ({
              ticketNumber: bookingResult.pnr,
              passengerName: passenger.fullName,
              seatNumber: request.selectedSeats?.[index] || "AUTO_ASSIGNED",
              tier: passengerDetails[index].tier,
            })),
            bookingTimestamp: bookingData.bookingTS,
            providerResponse: bookingResult,
          },
        };
      } else {
        console.error(
          "Sealink booking failed - invalid response:",
          bookingResult
        );
        return {
          success: false,
          error: `Sealink booking failed: ${
            bookingResult?.err || "Invalid response format"
          }`,
        };
      }
    } catch (error) {
      console.error("Sealink booking error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Sealink booking failed",
      };
    }
  }

  /**
   * Convert location slug to Sealink location name
   */
  private static getSealinkLocationName(location: string): string {
    const locationMap: Record<string, string> = {
      "port-blair": "Port Blair",
      havelock: "Swaraj Dweep",
      neil: "Shaheed Dweep",
    };
    return locationMap[location.toLowerCase()] || "Port Blair";
  }

  /**
   * Convert class ID to Sealink tier
   */
  private static getSealinkTier(classId: string): string {
    // P for Premium (pClass), B for Business (bClass) - matching Postman collection
    return classId.includes("premium") ? "P" : "B";
  }

  /**
   * Extract numeric ferry ID from ferry ID string
   */
  private static extractFerryId(ferryId: string): number {
    // Handle formats like "greenocean-1-2" or just "2"
    if (ferryId.includes("-")) {
      const parts = ferryId.split("-");
      return parseInt(parts[parts.length - 1]) || 0;
    }
    return parseInt(ferryId) || 0;
  }

  /**
   * Extract numeric class ID from class ID string
   */
  private static extractClassId(classId: string): number {
    // Handle formats like "1" or "economy-1" or complex IDs
    const match = classId.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  /**
   * Extract seat number for API
   */
  private static extractSeatNumber(seat: string): number {
    // Handle seat formats like "E4", "1A", etc.
    const match = seat.match(/\d+/);
    if (match) {
      return parseInt(match[0]);
    }
    // If no number found, try to convert the whole string
    const parsed = parseInt(seat);
    return isNaN(parsed) ? 0 : parsed;
  }

  private static async bookMakruzzFerry(
    request: FerryBookingRequest
  ): Promise<FerryBookingResponse> {
    try {
      console.log("📋 Makruzz: Creating real booking via API...");

      // Extract schedule ID from ferry ID (format: makruzz-{scheduleId}-...)
      const ferryIdParts = request.ferryId.split("-");
      const scheduleId = ferryIdParts[1];

      if (!scheduleId) {
        throw new Error("Missing Makruzz schedule ID in ferry ID");
      }

      // ✅ CRITICAL FIX: Extract correct class_id from the selected class
      // The request.classId should now contain the numeric class_id from unified results
      let correctClassId = request.classId;

      // If still getting the old format, extract numeric part
      if (request.classId.includes("makruzz-")) {
        console.warn(
          "⚠️ Still receiving old class_id format, attempting to fix..."
        );

        // Try to extract from route data or use default
        // This is a fallback - you should fix the unified result transformation
        const numericMatch = request.classId.match(/\d+/);
        if (numericMatch) {
          correctClassId = numericMatch[0];
        } else {
          // Last resort: use a default class_id (this should be improved)
          correctClassId = "19"; // Royal class from your debug data
          console.warn(`⚠️ Using fallback class_id: ${correctClassId}`);
        }
      }

      console.log(
        `🔍 Class ID resolution: "${request.classId}" → "${correctClassId}"`
      );

      // Prepare passenger data for Makruzz with FIXED formats
      const passengers = request.passengerDetails.map((passenger) => ({
        title:
          passenger.gender === "Male"
            ? "MR"
            : passenger.gender === "Female"
            ? "MRS"
            : "MR",
        name: passenger.fullName,
        age: passenger.age,
        gender: passenger.gender.toLowerCase(), // ✅ FIXED: Must be lowercase
        nationality:
          passenger.nationality === "Indian" ? "indian" : "foreigner", // ✅ FIXED: Must be lowercase
        fcountry:
          passenger.nationality !== "Indian" ? passenger.nationality : "",
        fpassport: passenger.passportNumber || "",
        fexpdate: "", // Not available in current interface
      }));

      const bookingData = {
        scheduleId,
        classId: correctClassId, // ✅ FIXED: Now using correct numeric class_id
        travelDate: request.date,
        passengers,
        contactDetails: {
          email: request.passengerDetails[0]?.email || "",
          phone: request.passengerDetails[0]?.whatsappNumber || "",
          name: request.passengerDetails[0]?.fullName || "",
        },
        totalFare: request.totalAmount,
      };

      console.log("📝 Makruzz booking data (FIXED):", {
        scheduleId: bookingData.scheduleId,
        classId: bookingData.classId, // Should now be "19" instead of "makruzz-763-royal"
        travelDate: bookingData.travelDate,
        passengersCount: bookingData.passengers.length,
        totalFare: bookingData.totalFare,
      });

      // Validate critical fields before API call
      if (isNaN(parseInt(bookingData.classId))) {
        throw new Error(
          `Invalid class_id after fix: "${bookingData.classId}" is still not numeric!`
        );
      }

      const bookingResult = await MakruzzService.bookSeats(bookingData);

      if (!bookingResult.success || !bookingResult.pnr) {
        console.error("❌ Makruzz booking failed:", bookingResult.error);
        throw new Error(bookingResult.error || "Makruzz booking failed");
      }

      console.log("✅ Makruzz booking successful:", {
        pnr: bookingResult.pnr,
        bookingId: bookingResult.bookingId,
      });

      // Try to get PDF ticket
      let pdfUrl: string | undefined;
      if (bookingResult.bookingId) {
        try {
          const pdfResult = await MakruzzService.getTicketPDF(
            bookingResult.bookingId.toString()
          );

          if (pdfResult.success && pdfResult.pdfBase64) {
            // Store PDF and get public URL
            const pdfStorage = await PDFService.storePDFFromBase64(
              pdfResult.pdfBase64,
              bookingResult.pnr,
              "makruzz"
            );

            if (pdfStorage.success) {
              pdfUrl = pdfStorage.url;
              console.log(`✅ Makruzz PDF stored: ${pdfUrl}`);
            }
          }
        } catch (pdfError) {
          console.warn(
            "⚠️ Makruzz PDF download failed (non-critical):",
            pdfError
          );
        }
      }

      return {
        success: true,
        pnr: bookingResult.pnr,
        providerBookingId: bookingResult.bookingId?.toString(),
        bookingReference: `MAKRUZZ_${request.paymentReference}`,
        confirmationDetails: {
          operator: "makruzz",
          status: "confirmed",
          pnr: bookingResult.pnr,
          bookingId: bookingResult.bookingId,
          pdfUrl,
          tickets: request.passengerDetails.map((passenger, index) => ({
            ticketNumber: `${bookingResult.pnr}_${index + 1}`,
            passengerName: passenger.fullName,
            seatNumber: "AUTO_ASSIGNED", // Makruzz auto-assigns seats
          })),
        },
      };
    } catch (error) {
      console.error("🚨 Makruzz booking error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Makruzz booking failed",
      };
    }
  }

  // ✅ ADDITIONAL DEBUGGING HELPER
  private static debugMakruzzBookingData(request: FerryBookingRequest): void {
    console.log("🔍 DEBUGGING MAKRUZZ BOOKING DATA:");
    console.log("Original request data:");
    console.log(`  ferryId: "${request.ferryId}"`);
    console.log(`  classId: "${request.classId}"`);
    console.log(`  date: "${request.date}"`);

    // Extract schedule ID
    const ferryIdParts = request.ferryId.split("-");
    const scheduleId = ferryIdParts[1];
    console.log(`  extracted scheduleId: "${scheduleId}"`);

    // Check passenger data format
    console.log("Passenger data validation:");
    request.passengerDetails.forEach((passenger, index) => {
      console.log(`  Passenger ${index + 1}:`);
      console.log(
        `    gender: "${passenger.gender}" (should be lowercase for API)`
      );
      console.log(
        `    nationality: "${passenger.nationality}" (should be lowercase for API)`
      );
      console.log(`    passport: "${passenger.passportNumber}"`);
    });

    // Validate class_id format
    if (request.classId.includes("makruzz-")) {
      console.warn(
        `⚠️ WARNING: class_id "${request.classId}" contains text format. This will cause database error!`
      );
      console.warn("Expected format: numeric string like '19'");
    } else {
      console.log(`✅ class_id format looks correct: "${request.classId}"`);
    }
  }

  // Fixed version of the bookGreenOceanFerry method

  private static async bookGreenOceanFerry(
    request: FerryBookingRequest
  ): Promise<FerryBookingResponse> {
    try {
      console.log("📋 Green Ocean: Creating booking with real API...");

      // Extract ferry details from the booking data structure
      const ferryId = this.extractFerryId(request.ferryId); // Extract numeric ID
      const classId = this.extractClassId(request.classId); // Extract numeric class ID

      console.log("🔍 Ferry booking details extracted:", {
        originalFerryId: request.ferryId,
        extractedFerryId: ferryId,
        originalClassId: request.classId,
        extractedClassId: classId,
        selectedSeats: request.selectedSeats,
      });

      // Validate required fields for Green Ocean API
      if (ferryId === 0) {
        throw new Error(
          "Invalid ferry_id extracted. Green Ocean API requires a valid numeric ship_id."
        );
      }

      if (classId === 0) {
        throw new Error(
          "Invalid class_id extracted. Green Ocean API requires a valid numeric class_id."
        );
      }

      // Prepare passenger details with proper validation
      const passengerDetails = request.passengerDetails.map((passenger) => {
        const isIndian = passenger.nationality === "Indian";

        // For Indians, passport fields should be empty strings
        // For foreigners, provide passport details
        let passportNumber = "";
        let passportExpiry = "";
        let country = "";

        if (!isIndian) {
          passportNumber = passenger.passportNumber || "";
          // Provide default expiry date for foreigners if not available
          passportExpiry = passenger.passportNumber
            ? this.formatDateForGreenOcean(
                new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 10)
              ) // 10 years from now
            : "";
          country = "India"; // Default country for foreigners
        }

        return {
          prefix:
            passenger.gender === "Male"
              ? "Mr"
              : passenger.gender === "Female"
              ? "Mrs"
              : "Mr",
          name: passenger.fullName,
          age: passenger.age.toString(),
          gender: passenger.gender,
          nationality: passenger.nationality,
          passport_numb: passportNumber,
          passport_expiry: passportExpiry, // Note: will be converted to passport_expairy
          country: country,
        };
      });

      // Debug logging for passenger validation
      console.log("🔍 Green Ocean passenger data being prepared:", {
        passenger_prefix: passengerDetails.map((p) => p.prefix),
        passenger_name: passengerDetails.map((p) => p.name),
        nationality: passengerDetails.map((p) => p.nationality),
        passport_numb: passengerDetails.map((p) => p.passport_numb),
        passport_expiry: passengerDetails.map((p) => p.passport_expiry),
        country: passengerDetails.map((p) => p.country),
      });

      // Prepare seat IDs - convert seat strings to numbers
      const seatIds =
        request.selectedSeats?.map((seat) => this.extractSeatNumber(seat)) ||
        [];

      // Prepare booking data matching the exact PHP structure
      const bookingData = {
        ship_id: ferryId,
        from_id: this.getLocationId(request.fromLocation),
        dest_to: this.getLocationId(request.toLocation),
        route_id: parseInt(request.routeId || "1"),
        class_id: classId,
        number_of_adults: request.passengers.adults,
        number_of_infants: request.passengers.infants,
        travel_date: this.formatDateForGreenOcean(request.date),
        seat_id: seatIds,

        // Passenger details arrays - properly mapped
        passenger_prefix: passengerDetails.map((p) => p.prefix),
        passenger_name: passengerDetails.map((p) => p.name),
        passenger_age: passengerDetails.map((p) => p.age),
        gender: passengerDetails.map((p) => p.gender),
        nationality: passengerDetails.map((p) => p.nationality),
        passport_numb: passengerDetails.map((p) => p.passport_numb),

        // IMPORTANT: Use the API's typo "passport_expairy" instead of "passport_expiry"
        passport_expairy: passengerDetails.map((p) => p.passport_expiry),
        country: passengerDetails.map((p) => p.country),

        // Infant details (empty arrays if no infants)
        infant_prefix: [],
        infant_name: [],
        infant_age: [],
        infant_gender: [],

        // Required authentication parameters
        public_key: process.env.GREEN_OCEAN_PUBLIC_KEY || "public-HGTBlexrva",
      };

      // Add hash to booking data
      const finalBookingData = {
        ...bookingData,
      };

      // Call the Green Ocean API directly (not through service method since it doesn't exist)
      const bookingResult = await this.greenOceanService.bookTicket(
        finalBookingData
      );

      console.log("🔍 Green Ocean API Response:", bookingResult);

      // Handle the response based on the successful format you showed
      if (bookingResult.status === "success" && bookingResult.pnr) {
        console.log("✅ Green Ocean booking successful:", {
          pnr: bookingResult.pnr,
          totalAmount: bookingResult.total_amount,
          ferryId: bookingResult.ferry_id,
        });

        // Handle PDF if provided
        let pdfUrl: string | undefined;
        if (bookingResult.pdf_base64) {
          try {
            const pdfStorage = await PDFService.storePDFFromBase64(
              bookingResult.pdf_base64,
              bookingResult.pnr,
              "greenocean"
            );

            if (pdfStorage.success) {
              pdfUrl = pdfStorage.url;
              console.log(`✅ Green Ocean PDF stored: ${pdfUrl}`);
            }
          } catch (pdfError) {
            console.warn(
              "⚠️ Green Ocean PDF storage failed (non-critical):",
              pdfError
            );
          }
        }

        return {
          success: true,
          pnr: bookingResult.pnr,
          providerBookingId: bookingResult.pnr,
          bookingReference: `GREENOCEAN_${request.paymentReference}`,
          confirmationDetails: {
            operator: "greenocean",
            status: "confirmed",
            pnr: bookingResult.pnr,
            totalAmount: bookingResult.total_amount,
            totalCommission: bookingResult.total_commission,
            ferryId: bookingResult.ferry_id,
            travelDate: bookingResult.travel_date,
            adultCount: bookingResult.adult_no,
            infantCount: bookingResult.infant_no,
            seats: request.selectedSeats,
            pdfUrl,
            tickets: request.passengerDetails.map((passenger, index) => ({
              ticketNumber: bookingResult.pnr,
              passengerName: passenger.fullName,
              seatNumber: request.selectedSeats?.[index] || `SEAT_${index + 1}`,
            })),
            providerResponse: bookingResult,
          },
        };
      } else {
        // Handle error response
        const errorMessage =
          bookingResult.message ||
          bookingResult.errorlist?.input ||
          "Green Ocean booking failed";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Green Ocean booking error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Green Ocean booking failed",
      };
    }
  }

  /**
   * Convert location name to Green Ocean location ID
   */
  private static getLocationId(location: string): number {
    const locationMap: Record<string, number> = {
      "port-blair": 1,
      havelock: 2,
      neil: 3,
    };
    return locationMap[location.toLowerCase()] || 1;
  }

  /**
   * Format date for Green Ocean API (DD-MM-YYYY)
   */
  private static formatDateForGreenOcean(date: string | Date): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Get booking status from provider
   */
  static async getBookingStatus(
    operator: string,
    providerBookingId: string
  ): Promise<any> {
    try {
      switch (operator) {
        case "sealink":
          // TODO: Implement Sealink status check
          return { status: "confirmed", tickets: [] };

        case "makruzz":
          // TODO: Implement Makruzz status check
          return { status: "confirmed", tickets: [] };

        case "greenocean":
          // TODO: Implement Green Ocean status check
          return { status: "confirmed", tickets: [] };

        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }
    } catch (error) {
      console.error(`Failed to get booking status for ${operator}:`, error);
      throw error;
    }
  }
}
