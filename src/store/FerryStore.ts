import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  FerryBookingSession,
  FerryClass,
  FerrySearchParams,
  PassengerDetail,
  Seat,
  UnifiedFerryResult,
} from "@/types/FerryBookingSession.types";

export interface FerryStore {
  // Search & Results
  searchParams: FerrySearchParams;
  searchResults: UnifiedFerryResult[];
  isLoading: boolean;
  error: string | null;

  // Selection State
  selectedFerry: UnifiedFerryResult | null;
  selectedClass: FerryClass | null;
  selectedSeats: Seat[];

  // Booking Session
  bookingSession: FerryBookingSession | null;

  // Actions
  setSearchParams: (params: FerrySearchParams) => void;
  searchFerries: () => Promise<void>;
  selectFerry: (ferry: UnifiedFerryResult) => void;
  selectClass: (ferryClass: FerryClass) => void;
  selectSeats: (seats: Seat[]) => void;
  createBookingSession: () => void;
  proceedToCheckout: () => void;

  // Seat management
  blockSeats: (seats: Seat[]) => Promise<void>; // For Green Ocean
  releaseSeats: () => Promise<void>;

  updateBookingSession: (session: FerryBookingSession) => void;
  clearBookingSession: () => void;
  updatePassengerDetails: (passenger: PassengerDetail) => void;
  clearError: () => void;

  reset: () => void;
}

const initialState = {
  searchParams: {
    from: "",
    to: "",
    date: "",
    adults: 2,
    children: 0,
    infants: 0,
  },
  searchResults: [],
  isLoading: false,
  error: null,
  selectedFerry: null,
  selectedClass: null,
  selectedSeats: [],
  bookingSession: null,
};

export const useFerryStore = create<FerryStore>()(
  immer((set, get) => ({
    ...initialState,

    setSearchParams: (params: FerrySearchParams) => {
      set((state) => {
        state.searchParams = params;
        state.error = null;
      });
    },

    searchFerries: async () => {
      const { searchParams } = get();

      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch("/api/ferry/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchParams),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { results, errors } = await response.json();

        set((state) => {
          state.searchResults = results || [];
          state.isLoading = false;

          if (errors && errors.length > 0) {
            state.error = `Some ferry operators failed: ${errors
              .map((e: { operator: string; error: string }) => e.operator)
              .join(", ")}`;
          }
        });
      } catch (error) {
        console.error("Ferry search failed:", error);
        set((state) => {
          state.isLoading = false;
          state.error =
            error instanceof Error ? error.message : "Failed to search ferries";
          state.searchResults = [];
        });
      }
    },

    selectFerry: (ferry: UnifiedFerryResult) => {
      set((state) => {
        state.selectedFerry = ferry;
        state.selectedClass = null;
        state.selectedSeats = [];
      });
    },

    selectClass: (ferryClass: FerryClass) => {
      set((state) => {
        state.selectedClass = ferryClass;
        state.selectedSeats = [];
      });
    },

    selectSeats: (seats: Seat[]) => {
      set((state) => {
        state.selectedSeats = seats;
      });
    },

    createBookingSession: () => {
      const { selectedFerry, selectedClass, selectedSeats, searchParams } =
        get();

      if (!selectedFerry || !selectedClass) return;

      const session: FerryBookingSession = {
        sessionId: `ferry_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        searchParams: {
          from: searchParams.from,
          to: searchParams.to,
          date: searchParams.date,
          adults: searchParams.adults,
          children: searchParams.children,
          infants: searchParams.infants,
        },
        selectedFerry: {
          operator: selectedFerry.operator,
          ferryId: selectedFerry.id,
          routeData: selectedFerry.operatorData.originalResponse,
        },
        selectedClass: {
          classId: selectedClass.id,
          className: selectedClass.name,
          price: selectedClass.price,
        },
        seatReservation:
          selectedSeats.length > 0
            ? {
                seats: selectedSeats.map((seat) => seat.number),
                expiryTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
              }
            : undefined,
        passengers: [],
        totalAmount:
          selectedClass.price * (searchParams.adults + searchParams.children),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      };

      set((state) => {
        state.bookingSession = session;
      });
    },

    proceedToCheckout: () => {
      // This will be handled by navigation in the component
    },

    blockSeats: async (seats: Seat[]) => {
      // Implementation for Green Ocean seat blocking
      set((state) => {
        state.isLoading = true;
      });

      try {
        // TODO: Implement Green Ocean seat blocking API call
        console.log("Blocking seats:", seats);

        set((state) => {
          state.selectedSeats = seats;
          state.isLoading = false;
        });
      } catch (error) {
        console.error("Failed to block seats:", error);
        set((state) => {
          state.isLoading = false;
          state.error = "Failed to reserve seats";
        });
      }
    },

    releaseSeats: async () => {
      // Implementation for releasing blocked seats
      set((state) => {
        state.selectedSeats = [];
      });
    },

    updateBookingSession: (session: FerryBookingSession) => {
      set((state) => {
        state.bookingSession = session;
      });
    },

    clearBookingSession: () => {
      set((state) => {
        state.bookingSession = null;
        state.selectedFerry = null;
        state.selectedClass = null;
        state.selectedSeats = [];
      });
    },

    updatePassengerDetails: (passenger: PassengerDetail) => {
      set((state) => {
        if (state.bookingSession) {
          const existingIndex = state.bookingSession.passengers.findIndex(
            (p) => p.email === passenger.email
          );

          if (existingIndex >= 0) {
            state.bookingSession.passengers[existingIndex] = passenger;
          } else {
            state.bookingSession.passengers.push(passenger);
          }
        }
      });
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },

    reset: () => {
      set((state) => {
        Object.assign(state, initialState);
      });
    },
  }))
);
