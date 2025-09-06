export interface FerryBookingSession {
  sessionId: string;
  searchParams: {
    from: string;
    to: string;
    date: string;
    adults: number;
    children: number;
    infants: number;
  };
  selectedFerry?: {
    operator: "sealink" | "makruzz" | "greenocean"; // Removed "unknown"
    ferryId: string;
    ferryName: string;
    routeData: any;
    fromLocation: string;
    toLocation: string;
    schedule: {
      departureTime: string;
      arrivalTime: string;
      duration: string;
      date: string; // Made required
    };
    duration: string;
  };
  selectedClass?: {
    classId: string;
    className: string;
    price: number;
  };
  seatReservation?: {
    seats: string[];
    reservationId?: string; // for green ocean
    expiryTime: Date;
  };
  passengers: PassengerDetail[];
  totalAmount: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface PassengerDetail {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
}

export interface Location {
  name: string;
  code: string;
}

export interface UnifiedFerryResult {
  id: string; // Unique identifier across all operators
  operator: "sealink" | "makruzz" | "greenocean";
  operatorFerryId: string; // Original ferry ID from operator
  ferryName: string;
  route: {
    from: Location;
    to: Location;
    fromCode: string; // Port codes
    toCode: string;
  };
  schedule: {
    departureTime: string; // "HH:MM"
    arrivalTime: string;
    duration: string; // "1h 30m"
    date: string; // "YYYY-MM-DD" - Made required
  };
  classes: FerryClass[];
  availability: {
    totalSeats: number;
    availableSeats: number;
    lastUpdated: string;
  };
  pricing: {
    baseFare: number;
    taxes: number;
    portFee: number;
    total: number;
    currency: "INR";
  };
  features: {
    supportsSeatSelection: boolean;
    supportsAutoAssignment: boolean;
    hasWiFi?: boolean;
    hasAC?: boolean;
    mealIncluded?: boolean;
  };
  operatorData: {
    // Store original API response for booking
    originalResponse: any;
    bookingEndpoint: string;
    authToken?: string;
  };
  isActive: boolean;
  // Additional properties that can be added during processing
  duration?: string; // For backward compatibility
  fromLocation?: string; // For backward compatibility
  toLocation?: string; // For backward compatibility
  selectedClass?: FerryClass; // Changed from null to undefined
  selectedSeats?: string[];
}

export interface FerryClass {
  id: string;
  name: string; // "Economy", "Premium", "Luxury", "Royal"
  className?: string; // Alternative property name used in some contexts
  price: number;
  availableSeats: number;
  amenities: string[];
  seatLayout?: SeatLayout; // Only if supports seat selection
}

export interface SeatLayout {
  rows: number;
  seatsPerRow: number;
  seats: Seat[];
  layout_config?: {
    rows: number;
    seatsPerRow: number;
    aislePositions: number[];
    emergency_exits: number[];
  };
}

export interface Seat {
  id: string;
  number: string; // "1A", "2B", etc.
  seat_numbering: string; // From Green Ocean API
  status:
    | "available"
    | "booked"
    | "blocked"
    | "selected"
    | "temporarily_blocked";
  type: "window" | "aisle" | "middle";
  position: { row: number; column: number };
  price?: number;
  isAccessible?: boolean;
  isPremium?: boolean;
}

export interface FerrySearchParams {
  from: string;
  to: string;
  date: string;
  adults: number;
  children: number;
  infants: number;
}
