import { Location } from "@/components/atoms/LocationSelect/LocationSelect.types";
import { FERRY_LOCATIONS } from "./ferries";

/**
 * Boat type interface
 */
export interface BoatType {
  id: string;
  name: string;
  capacity: number;
  description: string;
  pricePerHour: number;
  amenities: string[];
  imageSrc?: string;
  imageAlt?: string;
}

/**
 * Boat route interface
 */
export interface BoatRoute {
  id: string;
  name: string;
  from: string; // Location ID
  to: string; // Location ID
  durationMinutes: number;
  description: string;
  price: number;
  boatTypeId: string;
  availableDays: number[]; // 0-6, where 0 is Sunday
  highlights: string[];
}

/**
 * Available boat locations - reusing ferry locations and adding some boat-specific ones
 */
export const BOAT_LOCATIONS: Location[] = [
  ...FERRY_LOCATIONS,
  { id: "elephant-beach", name: "Elephant Beach" },
  { id: "north-bay", name: "North Bay" },
  { id: "ross-island", name: "Ross Island" },
  { id: "baratang", name: "Baratang" },
];

/**
 * Boat types data
 */
export const BOAT_TYPES: BoatType[] = [
  {
    id: "speed-boat",
    name: "Speed Boat",
    capacity: 6,
    description: "Fast and agile boat for quick trips",
    pricePerHour: 1500,
    amenities: ["Life Jackets", "Water Bottles", "Bluetooth Speaker"],
  },
  {
    id: "glass-bottom",
    name: "Glass Bottom Boat",
    capacity: 8,
    description: "See underwater marine life without getting wet",
    pricePerHour: 2000,
    amenities: ["Glass Bottom Viewing", "Life Jackets", "Shade Cover", "Guide"],
  },
  {
    id: "luxury-yacht",
    name: "Luxury Yacht",
    capacity: 12,
    description: "Premium experience with all amenities",
    pricePerHour: 5000,
    amenities: [
      "Air Conditioning",
      "Restroom",
      "Kitchen",
      "Lounge Area",
      "Sound System",
    ],
  },
  {
    id: "fishing-boat",
    name: "Fishing Boat",
    capacity: 4,
    description: "Equipped for fishing expeditions",
    pricePerHour: 1800,
    amenities: ["Fishing Gear", "Live Bait", "Fish Finder", "Cooler"],
  },
];

/**
 * Boat routes/tours data
 */
export const BOAT_ROUTES: BoatRoute[] = [
  {
    id: "pb-eb-glass",
    name: "Elephant Beach Marine Life Tour",
    from: "port-blair",
    to: "elephant-beach",
    durationMinutes: 120,
    description: "Explore the vibrant marine life around Elephant Beach",
    price: 2500,
    boatTypeId: "glass-bottom",
    availableDays: [0, 1, 2, 3, 4, 5, 6], // All days
    highlights: ["Coral Reefs", "Colorful Fish", "Clear Waters"],
  },
  {
    id: "pb-nb-speed",
    name: "North Bay Express",
    from: "port-blair",
    to: "north-bay",
    durationMinutes: 30,
    description: "Quick trip to North Bay Island",
    price: 1000,
    boatTypeId: "speed-boat",
    availableDays: [0, 1, 2, 3, 4, 5, 6], // All days
    highlights: ["Lighthouse", "Coral Viewing", "Quick Transfer"],
  },
  {
    id: "pb-ri-luxury",
    name: "Ross Island Luxury Cruise",
    from: "port-blair",
    to: "ross-island",
    durationMinutes: 180,
    description: "Luxury cruise around Ross Island with historical tour",
    price: 8000,
    boatTypeId: "luxury-yacht",
    availableDays: [0, 5, 6], // Weekends and Sunday
    highlights: [
      "Historical Sites",
      "Ruins",
      "Japanese Bunkers",
      "Champagne Service",
    ],
  },
  {
    id: "hv-fishing",
    name: "Havelock Fishing Expedition",
    from: "havelock",
    to: "havelock", // Round trip
    durationMinutes: 240,
    description: "Half-day fishing trip from Havelock Island",
    price: 3500,
    boatTypeId: "fishing-boat",
    availableDays: [1, 3, 5], // Mon, Wed, Fri
    highlights: [
      "Deep Sea Fishing",
      "Equipment Provided",
      "Cook Your Catch Option",
    ],
  },
  {
    id: "pb-bt-mangrove",
    name: "Baratang Mangrove Tour",
    from: "port-blair",
    to: "baratang",
    durationMinutes: 150,
    description: "Explore the limestone caves and mangrove forests",
    price: 2200,
    boatTypeId: "speed-boat",
    availableDays: [0, 2, 4], // Sun, Tue, Thu
    highlights: ["Limestone Caves", "Mangrove Forests", "Mud Volcanoes"],
  },
];

/**
 * Helper function to get boat type by ID
 */
export function getBoatType(boatTypeId: string): BoatType | undefined {
  return BOAT_TYPES.find((type) => type.id === boatTypeId);
}

/**
 * Helper function to get boat routes by location
 */
export function getBoatRoutesByLocation(locationId: string): BoatRoute[] {
  return BOAT_ROUTES.filter(
    (route) => route.from === locationId || route.to === locationId
  );
}

/**
 * Helper function to get location name by ID
 */
export function getBoatLocationName(locationId: string): string {
  const location = BOAT_LOCATIONS.find((loc) => loc.id === locationId);
  return location ? location.name : locationId;
}
