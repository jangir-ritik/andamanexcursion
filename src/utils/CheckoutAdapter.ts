"use client";

import {
  ActivitySearchParams,
  CartItem,
  useActivityStoreRQ,
} from "@/store/ActivityStoreRQ";
import { useFerryStore, FerryStore } from "@/store/FerryStore";
import { useBoat } from "@/store/BoatStore";
import type { Boat, BoatSearchParams, BoatCartItem } from "@/store/BoatStore";
import type {
  UnifiedFerryResult,
  FerryClass,
  FerryBookingSession,
  Location as FerryLocation,
} from "@/types/FerryBookingSession.types";
import type { Location } from "../../payload-types";
import type {
  MemberDetails,
  CheckoutFormData,
} from "@/store/SimpleCheckoutStore";
import { Activity } from "@payload-types";

// Unified interfaces (unchanged)
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
  location?: string | Location | Location[]; // Keep flexible for backward compatibility

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
 * FIXED CheckoutAdapter - Resolves all TypeScript errors
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
   * Get unified booking data from store instances (FIXED)
   */
  static getUnifiedBookingData(
    type: BookingType,
    stores: {
      activityStore: ReturnType<typeof useActivityStoreRQ.getState>;
      ferryStore: FerryStore;
      boatStore: any;
    }
  ): UnifiedBookingData {
    switch (type) {
      case "activity":
        return CheckoutAdapter.getActivityCheckoutData(stores.activityStore);
      case "ferry":
        return CheckoutAdapter.getFerryCheckoutData(stores.ferryStore);
      case "boat":
        return CheckoutAdapter.getBoatCheckoutData(stores.boatStore);
      case "mixed":
        return CheckoutAdapter.getMixedCheckoutData(stores);
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
   * FIXED: Get activity checkout data from store instance
   */
  private static getActivityCheckoutData(
    activityStore: ReturnType<typeof useActivityStoreRQ.getState>
  ): UnifiedBookingData {
    const items: UnifiedBookingItem[] = activityStore.cart.map(
      (cartItem: CartItem) => ({
        id: cartItem.id,
        type: "activity" as const,
        title: cartItem.activity.title || "Activity",
        passengers: {
          adults: cartItem.searchParams.adults || 0,
          children: cartItem.searchParams.children || 0,
          infants: 0, // Combined into children in ActivitySearchParams
        },
        price: cartItem.totalPrice,
        date: cartItem.searchParams.date || "",
        time: cartItem.searchParams.time || "",
        // FIXED: Ensure location is string type for activities
        location:
          typeof cartItem.activity.coreInfo?.location === "string"
            ? cartItem.activity.coreInfo.location
            : Array.isArray(cartItem.activity.coreInfo?.location) && cartItem.activity.coreInfo.location.length > 0
            ? typeof cartItem.activity.coreInfo.location[0] === "string"
              ? cartItem.activity.coreInfo.location[0]
              : (cartItem.activity.coreInfo.location[0] as Location)?.name || ""
            : "",
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
   * FIXED: Get ferry checkout data from store instance
   */
  private static getFerryCheckoutData(
    ferryStore: FerryStore
  ): UnifiedBookingData {
    const bookingSession = ferryStore.bookingSession;
    if (!bookingSession) {
      throw new Error("No ferry booking session found");
    }

    const totalPassengers =
      bookingSession.searchParams.adults +
      bookingSession.searchParams.children +
      bookingSession.searchParams.infants;

    const selectedFerry = ferryStore.selectedFerry;
    const selectedClass = ferryStore.selectedClass;

    // Helper function to create FerryLocation objects
    const createLocation = (locationName: string): FerryLocation => ({
      name: CheckoutAdapter.formatLocationName(locationName),
      code: CheckoutAdapter.getLocationCode(locationName),
    });

    const item: UnifiedBookingItem = {
      id: bookingSession.sessionId,
      type: "ferry",
      title: `${selectedFerry?.ferryName || "Ferry"} - ${
        bookingSession.searchParams.from
      } to ${bookingSession.searchParams.to}`,
      location: `${CheckoutAdapter.formatLocationName(
        bookingSession.searchParams.from
      )} → ${CheckoutAdapter.formatLocationName(
        bookingSession.searchParams.to
      )}`,
      time: selectedFerry?.schedule?.departureTime || "N/A",
      passengers: {
        adults: bookingSession.searchParams.adults,
        children: bookingSession.searchParams.children,
        infants: bookingSession.searchParams.infants,
      },
      price: bookingSession.totalAmount,
      date: bookingSession.searchParams.date,
      ferry: selectedFerry
        ? {
            // Core UnifiedFerryResult properties
            id: selectedFerry.id,
            operator: selectedFerry.operator,
            operatorFerryId: selectedFerry.operatorFerryId || selectedFerry.id || "",
            ferryName: selectedFerry.ferryName || "Unknown Ferry",
            route: {
              from: createLocation(bookingSession.searchParams.from),
              to: createLocation(bookingSession.searchParams.to),
              fromCode:
                selectedFerry.route?.fromCode ||
                CheckoutAdapter.getLocationCode(
                  bookingSession.searchParams.from
                ),
              toCode:
                selectedFerry.route?.toCode ||
                CheckoutAdapter.getLocationCode(bookingSession.searchParams.to),
            },
            schedule: selectedFerry.schedule
              ? {
                  departureTime: selectedFerry.schedule.departureTime,
                  arrivalTime: selectedFerry.schedule.arrivalTime,
                  duration: selectedFerry.schedule.duration,
                  date:
                    selectedFerry.schedule.date ||
                    bookingSession.searchParams.date, // Fallback to booking date
                }
              : {
                  departureTime: "Unknown",
                  arrivalTime: "Unknown",
                  duration: "Unknown",
                  date: bookingSession.searchParams.date, // Always include date
                },
            classes: selectedFerry.classes || [],
            availability: selectedFerry.availability || {
              totalSeats: 0,
              availableSeats: 0,
              lastUpdated: new Date().toISOString(),
            },
            pricing: selectedFerry.pricing || {
              baseFare: 0,
              taxes: 0,
              portFee: 0,
              total: bookingSession.totalAmount || 0,
              currency: "INR" as const,
            },
            features: selectedFerry.features || {
              supportsSeatSelection: true,
              supportsAutoAssignment: false,
            },
            operatorData: selectedFerry.operatorData || {
              originalResponse: {},
              bookingEndpoint: "",
            },
            isActive: selectedFerry.isActive ?? true,
            // Additional properties for backward compatibility
            duration: selectedFerry.schedule?.duration || "2h 30m",
            selectedClass: selectedClass || undefined,
            selectedSeats: bookingSession.seatReservation?.seats || [],
            fromLocation: CheckoutAdapter.formatLocationName(
              bookingSession.searchParams.from
            ),
            toLocation: CheckoutAdapter.formatLocationName(
              bookingSession.searchParams.to
            ),
          }
        : undefined,
      selectedClass: selectedClass || undefined, // Change null to undefined
      selectedSeats: bookingSession.seatReservation?.seats || [],
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
   * Get boat checkout data from store instance (FIXED)
   */
  private static getBoatCheckoutData(boatStore: any): UnifiedBookingData {
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
   * FIXED: Get mixed checkout data
   */
  private static getMixedCheckoutData(stores: {
    activityStore: ReturnType<typeof useActivityStoreRQ.getState>;
    ferryStore: FerryStore;
    boatStore: any;
  }): UnifiedBookingData {
    // Only get data from stores that have items
    const activityData =
      stores.activityStore.cart.length > 0
        ? CheckoutAdapter.getActivityCheckoutData(stores.activityStore)
        : {
            items: [],
            totalPassengers: 0,
            totalPrice: 0,
            requirements: { totalRequired: 0, bookings: [] },
          };

    const ferryData = stores.ferryStore.bookingSession
      ? CheckoutAdapter.getFerryCheckoutData(stores.ferryStore)
      : {
          items: [],
          totalPassengers: 0,
          totalPrice: 0,
          requirements: { totalRequired: 0, bookings: [] },
        };

    const boatData =
      stores.boatStore.cart?.length > 0
        ? CheckoutAdapter.getBoatCheckoutData(stores.boatStore)
        : {
            items: [],
            totalPassengers: 0,
            totalPrice: 0,
            requirements: { totalRequired: 0, bookings: [] },
          };

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

  /**
   * Format location name for display
   */
  private static formatLocationName(location: string): string {
    const locationMap: Record<string, string> = {
      "port-blair": "Port Blair",
      havelock: "Havelock",
      neil: "Neil Island",
      swaraj: "Havelock",
      shaheed: "Neil Island",
    };
    return locationMap[location.toLowerCase()] || location;
  }

  /**
   * Get location code for API calls
   */
  private static getLocationCode(location: string): string {
    const codeMap: Record<string, string> = {
      "port-blair": "PB",
      havelock: "SW",
      neil: "SH",
      swaraj: "SW",
      shaheed: "SH",
    };
    return codeMap[location.toLowerCase()] || location.toUpperCase();
  }
}

/**
 * FIXED Hook - Now uses proper store instances instead of window objects
 */
export const useCheckoutAdapter = (searchParams: URLSearchParams) => {
  // Get store instances via proper hooks
  const activityStore = useActivityStoreRQ.getState();
  const ferryStore = useFerryStore.getState();
  const boatStore = useBoat();

  try {
    const bookingType = CheckoutAdapter.detectBookingType(searchParams);
    const bookingData = CheckoutAdapter.getUnifiedBookingData(bookingType, {
      activityStore,
      ferryStore,
      boatStore,
    });

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
