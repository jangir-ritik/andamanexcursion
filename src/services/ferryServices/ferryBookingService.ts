// src/services/ferryServices/ferryBookingService.ts
import { SealinkService } from "./sealinkService";
import { MakruzzService } from "./makruzzService";
import { GreenOceanService } from "./greenOceanService";

export interface FerryBookingRequest {
  operator: "sealink" | "makruzz" | "greenocean";
  ferryId: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  classId: string;
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
      console.log("📋 Sealink: Creating real booking via API...");

      // Implement actual Sealink booking API call based on provided documentation
      const bookingResult = await SealinkService.bookSeats({
        id: request.ferryId,
        tripId: parseInt(request.ferryId.split("-")[1] || "0"), // Extract from ferry ID
        vesselID: 1, // Default Sealink vessel, should be extracted from ferry data
        from: this.getSealinkLocationName(request.fromLocation),
        to: this.getSealinkLocationName(request.toLocation),
        bookingTS: Math.floor(Date.now() / 1000), // Unix timestamp
        paxDetail: {
          email: request.passengerDetails[0]?.email || "",
          phone: request.passengerDetails[0]?.whatsappNumber || "",
          gstin: "", // Optional GSTIN
          pax: request.passengerDetails.map((passenger, index) => ({
            name: passenger.fullName,
            age: passenger.age,
            gender: passenger.gender === "Male" ? "M" : "F",
            nationality:
              passenger.nationality === "Indian" ? "Indian" : "Foreigner",
            photoId: passenger.passportNumber || "PhotoID",
            expiry: "", // Passport expiry if available
            seat: request.selectedSeats?.[index] || "",
            tier: this.getSealinkTier(request.classId), // L for Luxury, R for Royal
          })),
          infantPax: [], // Handle infants separately if needed
        },
        userData: {
          apiUser: {
            userName: process.env.SEALINK_USERNAME || "",
            agency: process.env.SEALINK_AGENCY || "",
            token: process.env.SEALINK_TOKEN || "",
            walletBalance: 2000, // This should come from actual wallet balance
          },
        },
        paymentData: {
          gstin: "", // Optional GSTIN for invoicing
        },
        token: process.env.SEALINK_TOKEN || "",
        userName: process.env.SEALINK_USERNAME || "",
      });

      if (bookingResult && bookingResult.seatStatus) {
        return {
          success: true,
          providerBookingId: bookingResult.pnr,
          bookingReference: `SEALINK_${request.paymentReference}`,
          confirmationDetails: {
            operator: "sealink",
            status: "confirmed",
            pnr: bookingResult.pnr,
            seats: request.selectedSeats,
            tickets: request.passengerDetails.map((passenger, index) => ({
              ticketNumber: bookingResult.pnr,
              passengerName: passenger.fullName,
              seatNumber: request.selectedSeats?.[index] || "",
            })),
            providerResponse: bookingResult,
          },
        };
      } else {
        throw new Error("Sealink booking failed");
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
    // L for Luxury (pClass), R for Royal (bClass)
    return classId.includes("luxury") ? "L" : "R";
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
    // Makruzz booking implementation
    // Note: This is a placeholder - implement based on Makruzz API documentation
    console.log("📋 Makruzz: Creating booking...");

    // For now, return success with mock data
    // TODO: Implement actual Makruzz booking API call
    return {
      success: true,
      providerBookingId: `MZ_${Date.now()}`,
      bookingReference: `MAKRUZZ_${request.paymentReference}`,
      confirmationDetails: {
        operator: "makruzz",
        status: "confirmed",
        tickets: request.passengerDetails.map((passenger, index) => ({
          ticketNumber: `MZ${Date.now()}_${index + 1}`,
          passengerName: passenger.fullName,
          seatNumber: request.selectedSeats?.[index] || `AUTO_${index + 1}`,
        })),
      },
    };
  }

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

      // Implement the actual Green Ocean API booking based on 4-book-ticket.php
      const bookingResult = await this.greenOceanService.bookTicket({
        ship_id: ferryId,
        from_id: this.getLocationId(request.fromLocation),
        dest_to: this.getLocationId(request.toLocation),
        route_id: 1, // Default route, should be determined from search results
        class_id: classId,
        number_of_adults: request.passengers.adults,
        number_of_infants: request.passengers.infants,
        travel_date: this.formatDateForGreenOcean(request.date),
        seat_id:
          request.selectedSeats?.map((seat) => this.extractSeatNumber(seat)) ||
          [],
        // Passenger details arrays
        passenger_prefix: request.passengerDetails.map((p) =>
          p.gender === "Male" ? "Mr" : p.gender === "Female" ? "Mrs" : "Mr"
        ),
        passenger_name: request.passengerDetails.map((p) => p.fullName),
        passenger_age: request.passengerDetails.map((p) => p.age.toString()),
        gender: request.passengerDetails.map((p) => p.gender),
        nationality: request.passengerDetails.map((p) => p.nationality),
        passport_numb: request.passengerDetails.map(
          (p) => p.passportNumber || ""
        ),
        passport_expiry: request.passengerDetails.map((p) => "31-12-2030"), // Default expiry date
        country: request.passengerDetails.map((p) => ""), // Empty for now
        // Infant details (empty arrays if no infants)
        infant_prefix: [],
        infant_name: [],
        infant_age: [],
        infant_gender: [],
      });

      if (bookingResult.success) {
        return {
          success: true,
          providerBookingId: bookingResult.booking_id || `GO_${Date.now()}`,
          bookingReference: `GREENOCEAN_${request.paymentReference}`,
          confirmationDetails: {
            operator: "greenocean",
            status: "confirmed",
            seats: request.selectedSeats,
            tickets:
              bookingResult.tickets ||
              request.passengerDetails.map((passenger, index) => ({
                ticketNumber: `GO${Date.now()}_${index + 1}`,
                passengerName: passenger.fullName,
                seatNumber:
                  request.selectedSeats?.[index] || `AUTO_${index + 1}`,
              })),
            providerResponse: bookingResult,
          },
        };
      } else {
        throw new Error(bookingResult.message || "Green Ocean booking failed");
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
  private static formatDateForGreenOcean(date: string): string {
    const dateObj = new Date(date);
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
