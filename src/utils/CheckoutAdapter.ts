"use client";

// CheckoutAdapter - Unified interface for different booking types
// Implements the "Source of Truth" pattern to eliminate complex state management

// Type imports for proper typing
import type {
  Activity,
  ActivitySearchParams,
  CartItem,
} from "@/store/ActivityStore";
import type {
  UnifiedFerryResult,
  FerryClass,
} from "@/types/FerryBookingSession.types";
import type {
  MemberDetails,
  CheckoutFormData,
} from "@/store/SimpleCheckoutStore";

// Unified interfaces
export type BookingType = "activity" | "ferry" | "mixed";

export interface UnifiedBookingData {
  type: BookingType;
  items: UnifiedBookingItem[];
  totalPassengers: number;
  totalPrice: number;
  requirements: PassengerRequirements;
}

export interface UnifiedBookingItem {
  id: string;
  type: "activity" | "ferry";
  title: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  price: number;
  date: string;
  time?: string;
  location?: string;
  // Activity-specific
  activity?: Activity;
  searchParams?: ActivitySearchParams;
  // Ferry-specific
  ferry?: UnifiedFerryResult;
  selectedClass?: FerryClass;
  selectedSeats?: string[];
}

export interface PassengerRequirements {
  totalRequired: number;
  bookings: Array<{
    title: string;
    passengers: number;
    type: "activity" | "ferry";
  }>;
}

export interface PaymentData {
  bookingType: BookingType;
  items: UnifiedBookingItem[];
  members: MemberDetails[];
  totalPrice: number;
  contactDetails: {
    primaryName: string;
    email: string;
    whatsapp: string;
  };
}

/**
 * CheckoutAdapter - Thin adapter layer for unified checkout
 *
 * This class eliminates the need for complex state synchronization
 * by letting each booking system own its data and providing a unified interface
 */
export class CheckoutAdapter {
  /**
   * Detect booking type from URL parameters
   */
  static detectBookingType(searchParams: URLSearchParams): BookingType {
    const type = searchParams.get("type");
    if (type === "ferry" || type === "activity" || type === "mixed") {
      return type as BookingType;
    }
    return "activity"; // Default
  }

  /**
   * Get unified booking data from appropriate source
   */
  static getUnifiedBookingData(type: BookingType): UnifiedBookingData {
    switch (type) {
      case "activity":
        return CheckoutAdapter.getActivityCheckoutData();
      case "ferry":
        return CheckoutAdapter.getFerryCheckoutData();
      case "mixed":
        return CheckoutAdapter.getMixedCheckoutData();
      default:
        throw new Error(`Unknown booking type: ${type}`);
    }
  }

  /**
   * Get passenger requirements for form setup
   */
  static getPassengerRequirements(
    data: UnifiedBookingData
  ): PassengerRequirements {
    return {
      totalRequired: data.totalPassengers,
      bookings: data.items.map((item) => ({
        title: item.title,
        passengers:
          item.passengers.adults +
          item.passengers.children +
          item.passengers.infants,
        type: item.type,
      })),
    };
  }

  /**
   * Convert form data to payment format
   */
  static preparePaymentData(
    bookingData: UnifiedBookingData,
    formData: CheckoutFormData
  ): PaymentData {
    return {
      bookingType: bookingData.type,
      items: bookingData.items,
      members: formData.members || [],
      totalPrice: bookingData.totalPrice,
      contactDetails: {
        primaryName: formData.members?.[0]?.fullName || "",
        email: formData.members?.[0]?.email || "",
        whatsapp: formData.members?.[0]?.whatsappNumber || "",
      },
    };
  }

  /**
   * Get activity checkout data from ActivityStore
   */
  private static getActivityCheckoutData(): UnifiedBookingData {
    // Check if we're in browser environment
    if (typeof window === "undefined") {
      throw new Error("Activity checkout data not available during SSR");
    }

    // Access the ActivityStore directly (no complex state management)
    const activityStore = (window as any).__ACTIVITY_STORE__ || {
      cart: [],
      searchParams: { adults: 1, children: 0, infants: 0 },
    };

    const items: UnifiedBookingItem[] = activityStore.cart.map(
      (cartItem: CartItem) => ({
        id: cartItem.id,
        type: "activity" as const,
        title: cartItem.activity.title || "Activity",
        passengers: {
          adults: cartItem.searchParams.adults || 0,
          children: cartItem.searchParams.children || 0,
          infants: 0, // Infants are now combined into children in ActivitySearchParams
        },
        price: cartItem.totalPrice,
        date: cartItem.searchParams.date || "",
        time: cartItem.searchParams.time || "",
        location: cartItem.activity.coreInfo?.location?.[0]?.name || "",
        activity: cartItem.activity,
        searchParams: cartItem.searchParams,
      })
    );

    const totalPassengers = items.reduce(
      (sum, item) =>
        sum +
        item.passengers.adults +
        item.passengers.children +
        item.passengers.infants,
      0
    );

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

    return {
      type: "activity",
      items,
      totalPassengers,
      totalPrice,
      requirements: {
        totalRequired: totalPassengers,
        bookings: items.map((item) => ({
          title: item.title,
          passengers:
            item.passengers.adults +
            item.passengers.children +
            item.passengers.infants,
          type: "activity",
        })),
      },
    };
  }

  /**
   * Get ferry checkout data from FerryStore
   */
  private static getFerryCheckoutData(): UnifiedBookingData {
    // Check if we're in browser environment
    if (typeof window === "undefined") {
      throw new Error("Ferry checkout data not available during SSR");
    }

    // Access the FerryStore directly
    const ferryStore = (window as any).__FERRY_STORE__ || {
      bookingSession: null,
      searchParams: { adults: 1, children: 0, infants: 0 },
    };

    const bookingSession = ferryStore.bookingSession;
    if (!bookingSession) {
      throw new Error("No ferry booking session found");
    }

    const totalPassengers =
      bookingSession.searchParams.adults +
      bookingSession.searchParams.children +
      bookingSession.searchParams.infants;

    const selectedFerry = bookingSession.selectedFerry;
    const selectedClass = bookingSession.selectedClass;

    const item: UnifiedBookingItem = {
      id: bookingSession.sessionId,
      type: "ferry",
      title: `${selectedFerry?.ferryName || "Ferry"} - ${
        bookingSession.searchParams.from
      } to ${bookingSession.searchParams.to}`,
      location: `${this.formatLocationName(
        bookingSession.searchParams.from
      )} → ${this.formatLocationName(bookingSession.searchParams.to)}`,
      time: selectedFerry?.schedule?.departureTime || "N/A",
      passengers: {
        adults: bookingSession.searchParams.adults,
        children: bookingSession.searchParams.children,
        infants: bookingSession.searchParams.infants,
      },
      price: bookingSession.totalAmount,
      date: bookingSession.searchParams.date,
      ferry: {
        ...selectedFerry,
        fromLocation: this.formatLocationName(bookingSession.searchParams.from),
        toLocation: this.formatLocationName(bookingSession.searchParams.to),
        duration: selectedFerry?.schedule?.duration || "2h 30m", // Default duration
        selectedClass: selectedClass,
        selectedSeats: bookingSession.seatReservation?.seats || [],
        // Explicitly preserve schedule data
        schedule: selectedFerry?.schedule
          ? {
              ...selectedFerry.schedule,
              departureTime: selectedFerry.schedule.departureTime,
              arrivalTime: selectedFerry.schedule.arrivalTime,
              duration: selectedFerry.schedule.duration,
            }
          : undefined,
      },
    };

    return {
      type: "ferry",
      items: [item],
      totalPassengers,
      totalPrice: bookingSession.totalAmount,
      requirements: {
        totalRequired: totalPassengers,
        bookings: [
          {
            title: item.title,
            passengers: totalPassengers,
            type: "ferry",
          },
        ],
      },
    };
  }

  /**
   * Format location name for display
   */
  private static formatLocationName(location: string): string {
    const locationMap: Record<string, string> = {
      "port-blair": "Port Blair",
      havelock: "Havelock",
      neil: "Neil Island",
    };
    return locationMap[location.toLowerCase()] || location;
  }

  /**
   * Get mixed checkout data (activities + ferries)
   */
  private static getMixedCheckoutData(): UnifiedBookingData {
    const activityData = CheckoutAdapter.getActivityCheckoutData();
    const ferryData = CheckoutAdapter.getFerryCheckoutData();

    return {
      type: "mixed",
      items: [...activityData.items, ...ferryData.items],
      totalPassengers: activityData.totalPassengers + ferryData.totalPassengers,
      totalPrice: activityData.totalPrice + ferryData.totalPrice,
      requirements: {
        totalRequired: activityData.totalPassengers + ferryData.totalPassengers,
        bookings: [
          ...activityData.requirements.bookings,
          ...ferryData.requirements.bookings,
        ],
      },
    };
  }
}

/**
 * Hook to access checkout data with error handling
 */
export const useCheckoutAdapter = (searchParams: URLSearchParams) => {
  try {
    const bookingType = CheckoutAdapter.detectBookingType(searchParams);
    const bookingData = CheckoutAdapter.getUnifiedBookingData(bookingType);
    const requirements = CheckoutAdapter.getPassengerRequirements(bookingData);

    return {
      bookingType,
      bookingData,
      requirements,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error("CheckoutAdapter error:", error);
    return {
      bookingType: "activity" as BookingType,
      bookingData: null,
      requirements: null,
      isLoading: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
