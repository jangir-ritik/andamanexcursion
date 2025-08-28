"use client";

// CheckoutAdapter - Unified interface for different booking types
// Implements the "Source of Truth" pattern to eliminate complex state management

// Type imports for proper typing
// import type {
//   Activity,
//   ActivitySearchParams,
//   CartItem,
// } from "@/store/ActivityStore";
import {
  ActivitySearchParams,
  CartItem,
  useActivityStoreRQ,
} from "@/store/ActivityStoreRQ";
import type { Boat, BoatSearchParams, BoatCartItem } from "@/store/BoatStore";
import { useBoat } from "@/store/BoatStore";
import type {
  UnifiedFerryResult,
  FerryClass,
} from "@/types/FerryBookingSession.types";
import type {
  MemberDetails,
  CheckoutFormData,
} from "@/store/SimpleCheckoutStore";
import { Activity, Location } from "@payload-types";

// Unified interfaces
export type BookingType = "activity" | "ferry" | "boat" | "mixed";

export interface UnifiedBookingData {
  type: BookingType;
  items: UnifiedBookingItem[];
  totalPassengers: number;
  totalPrice: number;
  requirements: PassengerRequirements;
}

export interface UnifiedBookingItem {
  id: string;
  type: "activity" | "ferry" | "boat";
  title: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  price: number;
  date: string;
  time?: string;
  location?: string | Location | Location[];
  // Activity-specific
  activity?: Activity;
  searchParams?: ActivitySearchParams;
  // Ferry-specific
  ferry?: UnifiedFerryResult;
  selectedClass?: FerryClass;
  selectedSeats?: string[];
  // Boat-specific
  boat?: Boat;
  boatSearchParams?: BoatSearchParams;
  selectedTime?: string;
}

export interface PassengerRequirements {
  totalRequired: number;
  bookings: Array<{
    title: string;
    passengers: number;
    type: "activity" | "ferry" | "boat";
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
    if (
      type === "ferry" ||
      type === "activity" ||
      type === "boat" ||
      type === "mixed"
    ) {
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
      case "boat":
        return CheckoutAdapter.getBoatCheckoutData();
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
        location: cartItem.activity.coreInfo?.location || "",
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
  public static getFerryCheckoutData(): UnifiedBookingData {
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
   * Get boat checkout data from BoatStore
   */
  public static getBoatCheckoutData(): UnifiedBookingData {
    // Check if we're in browser environment
    if (typeof window === "undefined") {
      throw new Error("Boat checkout data not available during SSR");
    }

    // Access the BoatStore directly
    const boatStore = (window as any).__BOAT_STORE__ || {
      cart: [],
      searchParams: { adults: 1, children: 0 },
    };

    const items: UnifiedBookingItem[] = boatStore.cart.map(
      (cartItem: BoatCartItem) => ({
        id: cartItem.id,
        type: "boat" as const,
        title:
          cartItem.boat.name ||
          `${cartItem.boat.route.from} to ${cartItem.boat.route.to}`,
        passengers: {
          adults: cartItem.searchParams.adults || 0,
          children: cartItem.searchParams.children || 0,
          infants: 0,
        },
        price: cartItem.totalPrice,
        date: cartItem.searchParams.date || "",
        time: cartItem.selectedTime || "",
        location: cartItem.boat.route.from || "",
        boat: cartItem.boat,
        boatSearchParams: cartItem.searchParams,
        selectedTime: cartItem.selectedTime,
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
      type: "boat",
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
          type: "boat",
        })),
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
   * Get mixed checkout data (activities + ferries + boats)
   */
  public static getMixedCheckoutData(): UnifiedBookingData {
    const activityData = CheckoutAdapter.getActivityCheckoutData();
    const ferryData = CheckoutAdapter.getFerryCheckoutData();
    const boatData = CheckoutAdapter.getBoatCheckoutData();

    return {
      type: "mixed",
      items: [...activityData.items, ...ferryData.items, ...boatData.items],
      totalPassengers:
        activityData.totalPassengers +
        ferryData.totalPassengers +
        boatData.totalPassengers,
      totalPrice:
        activityData.totalPrice + ferryData.totalPrice + boatData.totalPrice,
      requirements: {
        totalRequired:
          activityData.totalPassengers +
          ferryData.totalPassengers +
          boatData.totalPassengers,
        bookings: [
          ...activityData.requirements.bookings,
          ...ferryData.requirements.bookings,
          ...boatData.requirements.bookings,
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

/**
 * React Query version of the checkout adapter hook
 */
export const useCheckoutAdapterRQ = (searchParams: URLSearchParams) => {
  const activityStore = useActivityStoreRQ();
  const boatStore = useBoat();

  try {
    const bookingType = CheckoutAdapter.detectBookingType(searchParams);
    let bookingData: UnifiedBookingData;

    if (bookingType === "activity") {
      // Use React Query store instead of old store
      bookingData = getActivityCheckoutDataRQ(activityStore);
    } else if (bookingType === "ferry") {
      bookingData = CheckoutAdapter.getFerryCheckoutData();
    } else if (bookingType === "boat") {
      bookingData = getBoatCheckoutDataRQ(boatStore);
    } else {
      bookingData = CheckoutAdapter.getMixedCheckoutData();
    }

    const requirements = CheckoutAdapter.getPassengerRequirements(bookingData);

    return {
      bookingType,
      bookingData,
      requirements,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error("CheckoutAdapterRQ error:", error);
    return {
      bookingType: "activity" as BookingType,
      bookingData: null,
      requirements: null,
      isLoading: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Helper function to get boat checkout data from React Query store
 */
function getBoatCheckoutDataRQ(boatStore: any): UnifiedBookingData {
  const { cart } = boatStore;

  const items: UnifiedBookingItem[] = cart.map((cartItem: BoatCartItem) => ({
    id: cartItem.id,
    type: "boat" as const,
    title:
      cartItem.boat.name ||
      `${cartItem.boat.route.from} to ${cartItem.boat.route.to}`,
    passengers: {
      adults: cartItem.searchParams.adults || 0,
      children: cartItem.searchParams.children || 0,
      infants: 0,
    },
    price: cartItem.totalPrice,
    date: cartItem.searchParams.date || "",
    time: cartItem.selectedTime || "",
    location: cartItem.boat.route.from || "",
    boat: cartItem.boat,
    boatSearchParams: cartItem.searchParams,
    selectedTime: cartItem.selectedTime,
  }));

  const totalPassengers = items.reduce(
    (sum, item) => sum + item.passengers.adults + item.passengers.children,
    0
  );

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  const requirements: PassengerRequirements = {
    totalRequired: totalPassengers,
    bookings: items.map((item) => ({
      title: item.title,
      passengers: item.passengers.adults + item.passengers.children,
      type: item.type,
    })),
  };

  return {
    type: "boat",
    items,
    totalPassengers,
    totalPrice,
    requirements,
  };
}

/**
 * Helper function to get activity checkout data from React Query store
 */
function getActivityCheckoutDataRQ(activityStore: any): UnifiedBookingData {
  const { cart } = activityStore;

  const items: UnifiedBookingItem[] = cart.map((cartItem: CartItem) => ({
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
    location: cartItem.activity.coreInfo?.location || "",
    activity: cartItem.activity,
    searchParams: cartItem.searchParams,
  }));

  const totalPassengers = items.reduce(
    (sum, item) => sum + item.passengers.adults + item.passengers.children,
    0
  );

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  const requirements: PassengerRequirements = {
    totalRequired: totalPassengers,
    bookings: items.map((item) => ({
      title: item.title,
      passengers: item.passengers.adults + item.passengers.children,
      type: item.type,
    })),
  };

  return {
    type: "activity",
    items,
    totalPassengers,
    totalPrice,
    requirements,
  };
}
