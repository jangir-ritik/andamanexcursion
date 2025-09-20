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
  preferredTime: string | null;

  // NEW: Current active time filter (for results page)
  activeTimeFilter: string | null;

  // CLIENT-ONLY ACTIONS
  setSearchParams: (params: FerrySearchParams) => void;
  selectFerry: (ferry: UnifiedFerryResult) => void;
  selectClass: (ferryClass: FerryClass) => void;
  selectSeats: (seats: Seat[]) => void;
  createBookingSession: () => void;
  updateBookingSession: (session: FerryBookingSession) => void;
  clearBookingSession: () => void;
  updatePassengerDetails: (passenger: PassengerDetail) => void;
  reset: () => void;

  // Timing-specific actions
  setPreferredTime: (time: string | null) => void;
  setActiveTimeFilter: (filter: string | null) => void;

  // Utility actions for better UX
  clearSelection: () => void;
  clearSeats: () => void;
}

const initialState = {
  searchParams: {
    from: "",
    to: "",
    date: "",
    adults: 1,
    children: 0,
    infants: 0,
  },
  selectedFerry: null,
  selectedClass: null,
  selectedSeats: [],
  bookingSession: null,
  preferredTime: null,
  activeTimeFilter: null,
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

    setPreferredTime: (time: string | null) => {
      set((state: FerryStore) => {
        state.preferredTime = time;

        // IMPORTANT: Automatically sync with time filter when set from form
        // This creates the connection between form timing and result filtering
        state.activeTimeFilter = time;
      });
    },

    // NEW: Set active time filter (from TimeFilters component)
    setActiveTimeFilter: (filter: string | null) => {
      set((state: FerryStore) => {
        state.activeTimeFilter = filter;

        // Optionally sync back to preferred time if changed via filters
        // You might want this behavior or not, depending on UX preferences
        if (filter !== state.preferredTime) {
          state.preferredTime = filter;
        }
      });
    },

    selectFerry: (ferry: UnifiedFerryResult) => {
      set((state: FerryStore) => {
        state.selectedFerry = ferry;
        // Reset class and seats when ferry changes
        state.selectedClass = null;
        state.selectedSeats = [];
      });
    },

    selectClass: (ferryClass: FerryClass) => {
      set((state: FerryStore) => {
        state.selectedClass = ferryClass;
        // Reset seats when class changes
        state.selectedSeats = [];
      });
    },

    selectSeats: (seats: Seat[]) => {
      set((state: FerryStore) => {
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
                seats: selectedSeats,
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

// REMOVED: Global window access - this was the source of the problem
// The old implementation had:
// if (typeof window !== "undefined") {
//   (window as any).__FERRY_STORE__ = { ... }
// }

// Export selectors for cleaner component usage
export const ferrySelectors = {
  searchParams: (state: FerryStore) => state.searchParams,
  selectedFerry: (state: FerryStore) => state.selectedFerry,
  selectedClass: (state: FerryStore) => state.selectedClass,
  selectedSeats: (state: FerryStore) => state.selectedSeats,
  bookingSession: (state: FerryStore) => state.bookingSession,

  // NEW: Timing selectors
  preferredTime: (state: FerryStore) => state.preferredTime,
  activeTimeFilter: (state: FerryStore) => state.activeTimeFilter,

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
// NEW: Timing-specific hooks
export const usePreferredTime = () =>
  useFerryStore(ferrySelectors.preferredTime);
export const useActiveTimeFilter = () =>
  useFerryStore(ferrySelectors.activeTimeFilter);
