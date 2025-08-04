import { FerryBookingSession, FerryClass, FerrySearchParams, PassengerDetail, Seat, UnifiedFerryResult } from "@/types/FerryBookingSession.types";

export interface FerryStore {
  // Search & Results
  searchParams: FerrySearchParams;
  searchResults: UnifiedFerryResult[];
  isLoading: boolean;

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
}