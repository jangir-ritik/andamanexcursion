// import { Boat } from "@/context/BoatBookingContext.types";
// import { BOAT_ROUTES } from "@/data/boats";

// /**
//  * Fetch available boats based on search criteria
//  */
// export async function fetchAvailableBoats(
//   from: string,
//   to: string,
//   date: string,
//   passengers: number
// ): Promise<Boat[]> {
//   // In a real application, this would be an API call
//   // For now, we'll simulate a delay and filter the local data
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       // Filter boats based on search criteria
//       const filteredBoats = BOAT_ROUTES.filter((boat) => {
//         // Check if the route matches
//         const routeMatches =
//           boat.from.toLowerCase().includes(from.toLowerCase()) &&
//           boat.to.toLowerCase().includes(to.toLowerCase());

//         // Check if there are enough available seats
//         const hasEnoughSeats = boat.availableSeats >= passengers;

//         return routeMatches && hasEnoughSeats;
//       });

//       resolve(filteredBoats as unknown as Boat[]);
//     }, 500); // Simulate network delay
//   });
// }
