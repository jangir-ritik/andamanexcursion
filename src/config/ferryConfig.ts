// src/config/ferryConfig.ts
export const FERRY_API_CONFIG = {
  // Timeouts in milliseconds
  TIMEOUTS: {
    SEARCH: 8000, // 8 seconds for search operations
    SEAT_LAYOUT: 10000, // 10 seconds for seat layout
    BOOKING: 30000, // 30 seconds for booking operations
    TOTAL_PROCESS: 45000, // 45 seconds for entire booking process
  },

  // Retry configuration
  RETRIES: {
    SEARCH: {
      MAX_ATTEMPTS: 2,
      DELAY_MS: 1000,
      EXPONENTIAL_BACKOFF: true,
    },
    BOOKING: {
      MAX_ATTEMPTS: 1, // Don't retry bookings to avoid double booking
      DELAY_MS: 0,
      EXPONENTIAL_BACKOFF: false,
    },
  },

  // Sealink Adventures configuration
  SEALINK: {
    BASE_URL:
      process.env.SEALINK_API_URL || "http://api.dev.gonautika.com:8012/",
    USERNAME: process.env.SEALINK_USERNAME,
    TOKEN: process.env.SEALINK_TOKEN,
    AGENCY: process.env.SEALINK_AGENCY || "ANDAMAN_EXCURSION",

    // API specific timeouts
    BOOKING_TIMEOUT: 25000,
    SEARCH_TIMEOUT: 8000,

    // Error handling
    NON_RETRYABLE_ERRORS: [
      "unauthorized",
      "forbidden",
      "invalid credentials",
      "invalid request",
      "bad request",
      "not found",
      "already booked",
      "seat not available",
      "trip not found",
    ],

    // Vessel configuration
    VESSELS: {
      1: { name: "Sealink", code: "SL" },
      2: { name: "Nautika", code: "NT" },
    },

    // Class configuration
    CLASSES: {
      L: { name: "Luxury", tier: "premium" },
      R: { name: "Royal", tier: "deluxe" },
    },
  },

  // Makruzz configuration
  MAKRUZZ: {
    BASE_URL:
      process.env.MAKRUZZ_API_URL || "https://staging.makruzz.com/booking_api/",
    USERNAME: process.env.MAKRUZZ_USERNAME || "ae@makruzz.com",
    PASSWORD: process.env.MAKRUZZ_PASSWORD || "andexc",

    // API specific timeouts
    BOOKING_TIMEOUT: 30000,
    SEARCH_TIMEOUT: 10000,
    LOGIN_TIMEOUT: 8000,

    // Token management
    TOKEN_VALIDITY_HOURS: 1,

    // Error handling
    NON_RETRYABLE_ERRORS: [
      "unauthorized",
      "forbidden",
      "invalid credentials",
      "validation error",
      "bad request",
      "not found",
      "booking failed",
      "pnr generation failed",
    ],

    // API endpoints
    ENDPOINTS: {
      LOGIN: "login",
      GET_SECTORS: "get_sectors",
      SCHEDULE_SEARCH: "schedule_search",
      SAVE_PASSENGERS: "savePassengers",
      CONFIRM_BOOKING: "confirm_booking",
      DOWNLOAD_PDF: "download_ticket_pdf",
      PRINT_TICKET: "print_ticket",
    },
  },

  // Green Ocean specific settings
  GREEN_OCEAN: {
    BASE_URL:
      process.env.GREEN_OCEAN_API_URL ||
      "https://tickets.greenoceanseaways.com/test-v-1.0-api/",
    PUBLIC_KEY: process.env.GREEN_OCEAN_PUBLIC_KEY || "public-HGTBlexrva",
    PRIVATE_KEY: process.env.GREEN_OCEAN_PRIVATE_KEY || "private-vpFg9TP9D8",

    // API specific timeouts
    BOOKING_TIMEOUT: 35000, // Longer timeout for Green Ocean as it's slower
    SEARCH_TIMEOUT: 10000,

    // Error handling
    NON_RETRYABLE_ERRORS: [
      "unauthorized",
      "forbidden",
      "invalid credentials",
      "invalid request",
      "bad request",
      "not found",
      "already booked",
      "seat not available",
    ],

    // API endpoints
    ENDPOINTS: {
      ROUTE_DETAILS: "v1/route-details",
      SEAT_LAYOUT: "v1/seat-layout",
      TEMP_SEAT_BLOCK: "v1/temporary-seat-block",
      BOOK_TICKET: "v1/book-ticket",
    },
  },

  // Location mapping for all operators
  LOCATIONS: {
    "port-blair": {
      id: 1,
      name: "Port Blair",
      code: "PBL",
      sealinkName: "Port Blair",
      makruzzId: "1",
      greenOceanId: 1,
    },
    havelock: {
      id: 2,
      name: "Havelock",
      code: "HVL",
      sealinkName: "Swaraj Dweep",
      makruzzId: "2",
      greenOceanId: 2,
    },
    neil: {
      id: 3,
      name: "Neil Island",
      code: "NEI",
      sealinkName: "Shaheed Dweep",
      makruzzId: "3",
      greenOceanId: 3,
    },
    // baratang: {
    //   id: 4,
    //   name: "Baratang",
    //   code: "BAR",
    //   sealinkName: "Baratang",
    //   makruzzId: "4",
    //   greenOceanId: null, // Green Ocean doesn't serve Baratang
    // },
  },

  // Supported routes by operator
  SUPPORTED_ROUTES: {
    sealink: [
      ["port-blair", "havelock"],
      ["havelock", "port-blair"],
      ["port-blair", "neil"],
      ["neil", "port-blair"],
      ["havelock", "neil"],
      ["neil", "havelock"],
      // ["port-blair", "baratang"],
      // ["baratang", "port-blair"],
    ],
    makruzz: [
      ["port-blair", "havelock"],
      ["havelock", "port-blair"],
      ["port-blair", "neil"],
      ["neil", "port-blair"],
      ["havelock", "neil"],
      ["neil", "havelock"],
      // ["port-blair", "baratang"],
      // ["baratang", "port-blair"],
    ],
    greenocean: [
      ["port-blair", "havelock"],
      ["havelock", "port-blair"],
      ["port-blair", "neil"],
      ["neil", "port-blair"],
      ["havelock", "neil"],
      ["neil", "havelock"],
      // Note: Green Ocean doesn't serve Baratang
    ],
  },

  // PDF storage configuration
  PDF: {
    STORAGE_DIR: process.env.PDF_STORAGE_DIR || "./public/tickets",
    BASE_URL: process.env.PDF_BASE_URL || "/tickets",
    CLEANUP_DAYS: 30, // Delete PDFs older than 30 days
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB max file size
  },

  // Logging configuration
  LOGGING: {
    ENABLED: process.env.NODE_ENV !== "production",
    INCLUDE_REQUEST_BODY: process.env.NODE_ENV === "development",
    INCLUDE_RESPONSE_BODY: process.env.NODE_ENV === "development",
  },

  // Rate limiting
  RATE_LIMITING: {
    ENABLED: true,
    REQUESTS_PER_MINUTE: 100,
    BURST_LIMIT: 10, // Allow burst of 10 requests
  },

  // Cache configuration
  CACHE: {
    SEARCH_TTL: 5 * 60, // 5 minutes for search results
    SEAT_LAYOUT_TTL: 2 * 60, // 2 minutes for seat layouts
    SECTOR_TTL: 24 * 60 * 60, // 24 hours for sectors/locations
  },
};

// Helper functions
export const getFerryConfig = () => FERRY_API_CONFIG;

export const getTimeoutForOperation = (
  operation: "search" | "booking" | "seat_layout"
) => {
  return FERRY_API_CONFIG.TIMEOUTS[
    operation.toUpperCase() as keyof typeof FERRY_API_CONFIG.TIMEOUTS
  ];
};

export const isRetryableError = (
  error: Error,
  operation: "search" | "booking"
): boolean => {
  const message = error.message.toLowerCase();

  // Never retry booking operations to avoid double booking
  if (operation === "booking") {
    return false;
  }

  // Check against non-retryable errors
  const nonRetryableErrors = FERRY_API_CONFIG.GREEN_OCEAN.NON_RETRYABLE_ERRORS;
  return !nonRetryableErrors.some((errorType) => message.includes(errorType));
};

// Environment validation
export const validateFerryEnvironment = (): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!process.env.GREEN_OCEAN_PUBLIC_KEY) {
    errors.push("GREEN_OCEAN_PUBLIC_KEY environment variable is required");
  }

  if (!process.env.GREEN_OCEAN_PRIVATE_KEY) {
    errors.push("GREEN_OCEAN_PRIVATE_KEY environment variable is required");
  }

  if (!process.env.GREEN_OCEAN_API_URL) {
    errors.push("GREEN_OCEAN_API_URL environment variable is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
