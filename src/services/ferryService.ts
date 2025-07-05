import { FerryCardProps } from "@/components/molecules/Cards/FerryCard/FerryCard.types";
import { formatTimeForDisplay } from "@/utils/timeUtils";

// Cache for ferry data to prevent redundant calculations and API calls
const ferryDataCache = new Map<
  string,
  { data: FerryCardProps[]; timestamp: number }
>();
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetches available ferries based on search criteria
 */
export async function fetchAvailableFerries(
  departureLocation: string,
  arrivalLocation: string,
  date: string,
  passengers: number
): Promise<FerryCardProps[]> {
  try {
    // Validate that departure and arrival locations are different
    if (departureLocation === arrivalLocation) {
      console.warn("Departure and arrival locations cannot be the same");
      return [];
    }

    // Create a cache key based on search parameters
    const cacheKey = `${departureLocation}-${arrivalLocation}-${date}-${passengers}`;

    // Check if we have valid cached data
    const cachedData = ferryDataCache.get(cacheKey);
    const now = Date.now();

    if (cachedData && now - cachedData.timestamp < CACHE_EXPIRY_TIME) {
      console.log("Using cached ferry data");
      return cachedData.data;
    }

    // In a real implementation, this would be an API call
    // Example: const response = await fetch(`/api/ferries?from=${departureLocation}&to=${arrivalLocation}&date=${date}&passengers=${passengers}`);

    // For now, we'll simulate a delay and return mock data
    await new Promise((resolve) => setTimeout(resolve, 500));

    // This would normally come from the API
    const data = getMockFerryData(departureLocation, arrivalLocation, date);

    // Cache the results
    ferryDataCache.set(cacheKey, { data, timestamp: now });

    return data;
  } catch (error) {
    console.error("Error fetching ferry data:", error);
    return [];
  }
}

/**
 * Fetches details for a specific ferry
 */
export async function fetchFerryDetails(
  ferryId: string
): Promise<FerryCardProps | null> {
  try {
    // In a real implementation, this would be an API call
    // Example: const response = await fetch(`/api/ferries/${ferryId}`);

    // For now, we'll simulate a delay and return mock data
    await new Promise((resolve) => setTimeout(resolve, 300));

    // This would normally come from the API
    const mockData = getMockFerryData(
      "Port Blair",
      "Havelock",
      new Date().toISOString().split("T")[0]
    );
    const ferry = mockData.find((f, index) => index.toString() === ferryId);
    return ferry || null;
  } catch (error) {
    console.error("Error fetching ferry details:", error);
    return null;
  }
}

// Predefined amenities to avoid creating new objects on every call
const AMENITIES = {
  premiumSeating: { icon: "/icons/misc/chair.svg", label: "Premium Seating" },
  airConditioned: { icon: "/icons/misc/wind.svg", label: "Air conditioned" },
  onboardCafe: { icon: "/icons/misc/teaCup.svg", label: "Onboard Cafe" },
  extraLegSpace: { icon: "/icons/misc/legRoom.svg", label: "Extra Leg Space" },
};

// Predefined ferry companies to avoid creating new objects on every call
const FERRY_COMPANIES = [
  {
    name: "Makruzz Pearl",
    rating: 4.9,
    logo: "MakruzzPearl",
  },
  {
    name: "Green Ocean",
    rating: 4.5,
    logo: "GreenOcean",
  },
  {
    name: "ITT Majestic",
    rating: 4.7,
    logo: "ITTMajestic",
  },
  {
    name: "Go Nautica",
    rating: 4.6,
    logo: "GoNautica",
  },
];

/**
 * Mock data for development purposes
 */
function getMockFerryData(
  from: string,
  to: string,
  date: string
): FerryCardProps[] {
  // Generate ferry schedules for the morning (11:00 AM time slot)
  const morningFerries = [
    {
      departureTime: "11:00",
      arrivalTime: "11:30",
      price: 1000,
      totalPrice: 2000,
      seatsLeft: 10,
      company: FERRY_COMPANIES[0], // Makruzz Pearl
    },
    {
      departureTime: "11:15",
      arrivalTime: "11:45",
      price: 950,
      totalPrice: 1900,
      seatsLeft: 15,
      company: FERRY_COMPANIES[1], // Green Ocean
    },
    {
      departureTime: "11:30",
      arrivalTime: "12:00",
      price: 980,
      totalPrice: 1960,
      seatsLeft: 8,
      company: FERRY_COMPANIES[0], // Makruzz Pearl
    },
    {
      departureTime: "11:45",
      arrivalTime: "12:15",
      price: 1050,
      totalPrice: 2100,
      seatsLeft: 5,
      company: FERRY_COMPANIES[2], // ITT Majestic
    },
  ];

  // Generate ferry schedules for other time slots
  const otherFerries = [
    {
      departureTime: "13:00",
      arrivalTime: "13:30",
      price: 1000,
      totalPrice: 2000,
      seatsLeft: 10,
      company: FERRY_COMPANIES[0], // Makruzz Pearl
    },
    {
      departureTime: "15:30",
      arrivalTime: "16:00",
      price: 950,
      totalPrice: 1900,
      seatsLeft: 15,
      company: FERRY_COMPANIES[0], // Makruzz Pearl
    },
    {
      departureTime: "16:00",
      arrivalTime: "16:30",
      price: 980,
      totalPrice: 1960,
      seatsLeft: 8,
      company: FERRY_COMPANIES[0], // Makruzz Pearl
    },
  ];

  // Map ferry schedules to FerryCardProps
  const mapFerryToProps = (ferry: any): FerryCardProps => ({
    ferryName: ferry.company.name,
    rating: ferry.company.rating,
    departureTime: formatTimeForDisplay(ferry.departureTime),
    departureLocation: from,
    arrivalTime: formatTimeForDisplay(ferry.arrivalTime),
    arrivalLocation: to,
    price: ferry.price,
    totalPrice: ferry.totalPrice,
    seatsLeft: ferry.seatsLeft,
    ferryClasses: [
      {
        type: "Luxury",
        price: ferry.price,
        totalPrice: ferry.totalPrice,
        seatsLeft: Math.max(1, Math.floor(ferry.seatsLeft / 2)),
        amenities: [
          AMENITIES.premiumSeating,
          AMENITIES.airConditioned,
          AMENITIES.onboardCafe,
        ],
      },
      {
        type: "Royal",
        price: Math.floor(ferry.price * 1.2),
        totalPrice: Math.floor(ferry.totalPrice * 1.2),
        seatsLeft: Math.max(1, Math.floor(ferry.seatsLeft / 3)),
        amenities: [
          AMENITIES.premiumSeating,
          AMENITIES.airConditioned,
          AMENITIES.onboardCafe,
          AMENITIES.extraLegSpace,
        ],
      },
    ],
  });

  // Combine and return all ferries
  return [
    ...morningFerries.map(mapFerryToProps),
    ...otherFerries.map(mapFerryToProps),
  ];
}
