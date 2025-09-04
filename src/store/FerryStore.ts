import {
  FerryBookingSession,
  FerryClass,
  FerrySearchParams,
  PassengerDetail,
  Seat,
  UnifiedFerryResult,
} from "@/types/FerryBookingSession.types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface FerryStore {
  // CLIENT-ONLY STATE (server state moved to React Query)
  searchParams: FerrySearchParams;
  selectedFerry: UnifiedFerryResult | null;
  selectedClass: FerryClass | null;
  selectedSeats: Seat[];
  bookingSession: FerryBookingSession | null;

  // CLIENT-ONLY ACTIONS
  setSearchParams: (params: FerrySearchParams) => void;
  selectFerry: (ferry: UnifiedFerryResult) => void;
  selectClass: (ferryClass: FerryClass) => void;
  selectSeats: (seats: Seat[]) => void;
  createBookingSession: () => void; // Pure client logic - creates local session
  updateBookingSession: (session: FerryBookingSession) => void;
  clearBookingSession: () => void;
  updatePassengerDetails: (passenger: PassengerDetail) => void;
  reset: () => void;

  // Utility actions for better UX
  clearSelection: () => void;
  clearSeats: () => void;

  // REMOVED - Now handled by React Query:
  // - searchResults, isLoading, error
  // - searchFerries(), blockSeats(), releaseSeats()
  // - proceedToCheckout(), clearError()
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
        // Clear selections when search params change
        state.selectedFerry = null;
        state.selectedClass = null;
        state.selectedSeats = [];
      });
    },

    selectFerry: (ferry: UnifiedFerryResult) => {
      set((state) => {
        state.selectedFerry = ferry;
        // Reset class and seats when ferry changes
        state.selectedClass = null;
        state.selectedSeats = [];
      });
    },

    selectClass: (ferryClass: FerryClass) => {
      set((state) => {
        state.selectedClass = ferryClass;
        // Reset seats when class changes
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

      if (!selectedFerry || !selectedClass) {
        console.warn(
          "Cannot create booking session: ferry or class not selected"
        );
        return;
      }

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
          ferryName: selectedFerry.ferryName,
          routeData: selectedFerry.operatorData.originalResponse,
          // Preserve complete ferry data including schedule
          fromLocation: selectedFerry.route.from.name,
          toLocation: selectedFerry.route.to.name,
          schedule: selectedFerry.schedule,
          duration: selectedFerry.schedule.duration,
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

    updateBookingSession: (session: FerryBookingSession) => {
      set((state) => {
        state.bookingSession = session;
      });
    },

    clearBookingSession: () => {
      set((state) => {
        state.bookingSession = null;
        // Optionally clear selections as well
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

    // Utility actions for better UX
    clearSelection: () => {
      set((state) => {
        state.selectedFerry = null;
        state.selectedClass = null;
        state.selectedSeats = [];
        state.bookingSession = null;
      });
    },

    clearSeats: () => {
      set((state) => {
        state.selectedSeats = [];
        // Update booking session if it exists
        if (state.bookingSession) {
          state.bookingSession.seatReservation = undefined;
        }
      });
    },

    reset: () => {
      set((state) => {
        Object.assign(state, initialState);
      });
    },
  }))
);

// Global access for CheckoutAdapter - Preserve existing integration
if (typeof window !== "undefined") {
  (window as any).__FERRY_STORE__ = {
    get bookingSession() {
      return useFerryStore.getState().bookingSession;
    },
    get searchParams() {
      return useFerryStore.getState().searchParams;
    },
    get selectedFerry() {
      return useFerryStore.getState().selectedFerry;
    },
    get selectedClass() {
      return useFerryStore.getState().selectedClass;
    },
    get selectedSeats() {
      return useFerryStore.getState().selectedSeats;
    },
    getState: () => useFerryStore.getState(),
    resetBookingSession: () => {
      useFerryStore.setState({ bookingSession: null });
    },
    // Additional helpers for checkout integration
    clearSelection: () => {
      useFerryStore.getState().clearSelection();
    },
    updateBookingSession: (session: FerryBookingSession) => {
      useFerryStore.getState().updateBookingSession(session);
    },
  };
}

// Export selectors for cleaner component usage
export const ferrySelectors = {
  searchParams: (state: FerryStore) => state.searchParams,
  selectedFerry: (state: FerryStore) => state.selectedFerry,
  selectedClass: (state: FerryStore) => state.selectedClass,
  selectedSeats: (state: FerryStore) => state.selectedSeats,
  bookingSession: (state: FerryStore) => state.bookingSession,

  // Computed selectors
  hasSelection: (state: FerryStore) =>
    !!(state.selectedFerry && state.selectedClass),
  totalPassengers: (state: FerryStore) =>
    state.searchParams.adults +
    state.searchParams.children +
    state.searchParams.infants,
  requiresSeatSelection: (state: FerryStore) =>
    state.selectedFerry?.features.supportsSeatSelection || false,
  isBookingReady: (state: FerryStore) =>
    !!(
      state.selectedFerry &&
      state.selectedClass &&
      (state.selectedSeats.length > 0 ||
        !state.selectedFerry.features.supportsSeatSelection)
    ),
};

// Typed hooks for specific selectors
export const useSearchParams = () => useFerryStore(ferrySelectors.searchParams);
export const useSelectedFerry = () =>
  useFerryStore(ferrySelectors.selectedFerry);
export const useSelectedClass = () =>
  useFerryStore(ferrySelectors.selectedClass);
export const useSelectedSeats = () =>
  useFerryStore(ferrySelectors.selectedSeats);
export const useBookingSession = () =>
  useFerryStore(ferrySelectors.bookingSession);
export const useHasSelection = () => useFerryStore(ferrySelectors.hasSelection);
export const useTotalPassengers = () =>
  useFerryStore(ferrySelectors.totalPassengers);
export const useRequiresSeatSelection = () =>
  useFerryStore(ferrySelectors.requiresSeatSelection);
export const useIsBookingReady = () =>
  useFerryStore(ferrySelectors.isBookingReady);
