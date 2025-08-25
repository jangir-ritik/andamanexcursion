// import { Location } from "@/components/atoms/LocationSelect/LocationSelect.types";
// import greenOceanLogo from "@public/images/ferry/trustedFerries/greenOcean.png";
// import goNauticaLogo from "@public/images/ferry/trustedFerries/goNautica.png";
// import makruzzLogo from "@public/images/ferry/trustedFerries/makruzz.png";
// import iitMajesticLogo from "@public/images/ferry/trustedFerries/placeholder.png";

// /**
//  * Ferry operator interface
//  */
// export interface FerryOperator {
//   id: string;
//   name: string;
//   logo: any; // Image import
//   logoAlt: string;
//   description: string;
//   rating: number;
//   amenities: string[];
// }

// /**
//  * Ferry route interface
//  */
// export interface FerryRoute {
//   id: string;
//   from: string; // Location ID
//   to: string; // Location ID
//   operatorId: string; // Operator ID
//   durationMinutes: number;
//   price: {
//     economy: number;
//     business?: number;
//     premium?: number;
//   };
//   availableDays: number[]; // 0-6, where 0 is Sunday
// }

// /**
//  * Available ferry locations
//  * Updated to match ferry operator documentation
//  */
// export const FERRY_LOCATIONS: Location[] = [
//   {
//     id: "port-blair",
//     name: "Port Blair",
//     slug: "port-blair",
//     value: "port-blair",
//     label: "Port Blair",
//   },
//   {
//     id: "havelock",
//     name: "Havelock", // Swaraj dweep
//     slug: "havelock",
//     value: "havelock",
//     label: "Havelock",
//   },
//   {
//     id: "neil-island",
//     name: "Neil Island", // Shaheed dweep
//     slug: "neil-island",
//     value: "neil",
//     label: "Neil Island",
//   },
//   {
//     id: "baratang",
//     name: "Baratang Island",
//     slug: "baratang",
//     value: "baratang",
//     label: "Baratang Island",
//   },
// ];

// /**
//  * Ferry operators data
//  */
// export const FERRY_OPERATORS: FerryOperator[] = [
//   {
//     id: "green-ocean",
//     name: "Green Ocean",
//     logo: greenOceanLogo,
//     logoAlt: "Green Ocean Ferry Logo",
//     description: "Luxury ferry service with premium amenities",
//     rating: 4.7,
//     amenities: ["Air Conditioning", "Cafe", "Luggage Storage", "Entertainment"],
//   },
//   {
//     id: "makruzz",
//     name: "Makruzz",
//     logo: makruzzLogo,
//     logoAlt: "Makruzz Ferry Logo",
//     description: "Fast and comfortable ferry service",
//     rating: 4.8,
//     amenities: ["Air Conditioning", "Cafe", "Premium Seating", "Viewing Deck"],
//   },
//   {
//     id: "go-nautica",
//     name: "Go Nautica",
//     logo: goNauticaLogo,
//     logoAlt: "Go Nautica Ferry Logo",
//     description: "Reliable ferry service with great views",
//     rating: 4.5,
//     amenities: ["Air Conditioning", "Snack Bar", "Outdoor Seating"],
//   },
//   {
//     id: "iit-majestic",
//     name: "IIT Majestic",
//     logo: iitMajesticLogo,
//     logoAlt: "IIT Majestic Ferry Logo",
//     description: "Economic ferry service with basic amenities",
//     rating: 4.2,
//     amenities: ["Air Conditioning", "Basic Seating", "Luggage Storage"],
//   },
// ];

// /**
//  * Ferry routes data
//  */
// export const FERRY_ROUTES: FerryRoute[] = [
//   {
//     id: "pb-hv-go",
//     from: "port-blair",
//     to: "havelock",
//     operatorId: "green-ocean",
//     durationMinutes: 90,
//     price: {
//       economy: 1200,
//       business: 1800,
//       premium: 2500,
//     },
//     availableDays: [0, 1, 2, 3, 4, 5, 6], // All days
//   },
//   {
//     id: "pb-hv-mk",
//     from: "port-blair",
//     to: "havelock",
//     operatorId: "makruzz",
//     durationMinutes: 95,
//     price: {
//       economy: 1250,
//       business: 1850,
//     },
//     availableDays: [0, 1, 2, 3, 4, 5, 6], // All days
//   },
//   {
//     id: "pb-ni-go",
//     from: "port-blair",
//     to: "neil-island",
//     operatorId: "go-nautica",
//     durationMinutes: 120,
//     price: {
//       economy: 1100,
//       business: 1600,
//     },
//     availableDays: [0, 1, 3, 5], // Sun, Mon, Wed, Fri
//   },
//   {
//     id: "hv-ni-iit",
//     from: "havelock",
//     to: "neil-island",
//     operatorId: "iit-majestic",
//     durationMinutes: 60,
//     price: {
//       economy: 800,
//     },
//     availableDays: [0, 2, 4, 6], // Sun, Tue, Thu, Sat
//   },
//   {
//     id: "pb-dg-mk",
//     from: "port-blair",
//     to: "diglipur",
//     operatorId: "makruzz",
//     durationMinutes: 150,
//     price: {
//       economy: 1500,
//       business: 2200,
//       premium: 3000,
//     },
//     availableDays: [1, 3, 5], // Mon, Wed, Fri
//   },
//   {
//     id: "pb-rg-go",
//     from: "port-blair",
//     to: "rangat",
//     operatorId: "go-nautica",
//     durationMinutes: 180,
//     price: {
//       economy: 1300,
//       business: 1900,
//     },
//     availableDays: [0, 2, 4], // Sun, Tue, Thu
//   },
// ];

// /**
//  * Helper function to get ferry operator by ID
//  */
// export function getFerryOperator(
//   operatorId: string
// ): FerryOperator | undefined {
//   return FERRY_OPERATORS.find((operator) => operator.id === operatorId);
// }

// /**
//  * Helper function to get ferry routes by locations
//  */
// export function getFerryRoutes(from: string, to: string): FerryRoute[] {
//   return FERRY_ROUTES.filter((route) => route.from === from && route.to === to);
// }

// /**
//  * Helper function to get location name by ID
//  */
// export function getLocationName(locationId: string): string {
//   const location = FERRY_LOCATIONS.find((loc) => loc.id === locationId);
//   return location ? location.name : locationId;
// }
