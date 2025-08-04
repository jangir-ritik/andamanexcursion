// import { ActivityCardProps } from "@/components/molecules/Cards/ActivityCard/ActivityCard.types";

// // Cache for activity data to prevent redundant calculations and API calls
// const activityDataCache = new Map<
//   string,
//   { data: ActivityCardProps[]; timestamp: number }
// >();
// const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

// /**
//  * Fetches available activities based on search criteria
//  */
// export async function fetchAvailableActivities(
//   activityType: string,
//   date: string,
//   time: string,
//   passengers: number
// ): Promise<ActivityCardProps[]> {
//   try {
//     // Create a cache key based on search parameters
//     const cacheKey = `${activityType}-${date}-${time}-${passengers}`;

//     // Check if we have valid cached data
//     const cachedData = activityDataCache.get(cacheKey);
//     const now = Date.now();

//     if (cachedData && now - cachedData.timestamp < CACHE_EXPIRY_TIME) {
//       console.log("Using cached activity data");
//       return cachedData.data;
//     }

//     // In a real implementation, this would be an API call
//     // Example: const response = await fetch(`/api/activities?type=${activityType}&date=${date}&time=${time}&passengers=${passengers}`);

//     // For now, we'll simulate a delay and return mock data
//     await new Promise((resolve) => setTimeout(resolve, 500));

//     // This would normally come from the API
//     const data = getMockActivityData(activityType, date, time, passengers);

//     // Cache the results
//     activityDataCache.set(cacheKey, { data, timestamp: now });

//     return data;
//   } catch (error) {
//     console.error("Error fetching activity data:", error);
//     return [];
//   }
// }

// /**
//  * Fetches details for a specific activity
//  */
// export async function fetchActivityDetails(
//   activityId: string
// ): Promise<ActivityCardProps | null> {
//   try {
//     // In a real implementation, this would be an API call
//     // Example: const response = await fetch(`/api/activities/${activityId}`);

//     // For now, we'll simulate a delay and return mock data
//     await new Promise((resolve) => setTimeout(resolve, 300));

//     // This would normally come from the API
//     const mockData = getMockActivityData(
//       "scuba-diving",
//       new Date().toISOString().split("T")[0],
//       "10:00",
//       2
//     );
//     const activity = mockData.find((a) => a.id === activityId);
//     return activity || null;
//   } catch (error) {
//     console.error("Error fetching activity details:", error);
//     return null;
//   }
// }

// /**
//  * Mock data for development purposes
//  */
// function getMockActivityData(
//   activityType: string,
//   date: string,
//   time: string,
//   passengers: number
// ): ActivityCardProps[] {
//   // Calculate total price based on passengers
//   const calculateTotal = (price: number) => price * passengers;

//   // Generate activity schedules for the morning (11:00 AM time slot)
//   const morningActivities = [
//     {
//       id: "1",
//       title: "Scuba Diving at Neil Island",
//       description:
//         "Dive deep into the Andaman's clear waters and explore stunning coral reefs and marine life",
//       images: [
//         {
//           src: "/images/activities/activitiesList/1.png",
//           alt: "Scuba Diving at Neil Island",
//         },
//         {
//           src: "/images/activities/activitiesList/2.png",
//           alt: "Underwater view of coral reef",
//         },
//         {
//           src: "/images/activities/activitiesList/3.png",
//           alt: "Diver with marine life",
//         },
//       ],
//       price: 1000,
//       totalPrice: calculateTotal(1000),
//       type: "Shore Diving",
//       duration: "1 hr",
//       href: "/activities/booking?activity=1",
//       activityOptions: [
//         {
//           id: "1-option-1",
//           type: "Shore Diving for Beginners",
//           price: 1000,
//           totalPrice: calculateTotal(1000),
//           description:
//             "Slow induction into the underwater world, for first time divers and non-swimmers",
//           seatsLeft: 3,
//           amenities: [
//             { icon: "/icons/misc/checkbox.svg", label: "Equipment included" },
//             { icon: "/icons/misc/checkbox.svg", label: "Instructor guidance" },
//             { icon: "/icons/misc/checkbox.svg", label: "Safety briefing" },
//           ],
//         },
//         {
//           id: "1-option-2",
//           type: "Boat Scuba Diving",
//           price: 1200,
//           totalPrice: calculateTotal(1200),
//           description:
//             "A far more adventurous way to dive, for both beginners and experienced divers",
//           seatsLeft: 6,
//           amenities: [
//             { icon: "/icons/misc/checkbox.svg", label: "Equipment included" },
//             { icon: "/icons/misc/checkbox.svg", label: "Boat ride" },
//             { icon: "/icons/misc/checkbox.svg", label: "Underwater photos" },
//           ],
//         },
//       ],
//     },
//     {
//       id: "2",
//       title: "Fun Dive at Havelock",
//       description:
//         "Dive deep into the Andaman's clear waters and explore stunning coral reefs and marine life",
//       images: [
//         {
//           src: "/images/activities/activitiesList/2.png",
//           alt: "Fun Dive at Havelock",
//         },
//         {
//           src: "/images/activities/activitiesList/3.png",
//           alt: "Underwater view of coral reef",
//         },
//       ],
//       price: 950,
//       totalPrice: calculateTotal(950),
//       type: "Boat Diving",
//       duration: "1 hr",
//       href: "/activities/booking?activity=2",
//       activityOptions: [
//         {
//           id: "2-option-1",
//           type: "Standard Fun Dive",
//           price: 950,
//           totalPrice: calculateTotal(950),
//           description:
//             "Perfect for those who want to enjoy diving without certification",
//           seatsLeft: 8,
//           amenities: [
//             { icon: "/icons/misc/checkbox.svg", label: "Equipment included" },
//             { icon: "/icons/misc/checkbox.svg", label: "Instructor guidance" },
//           ],
//         },
//         {
//           id: "2-option-2",
//           type: "Premium Fun Dive",
//           price: 1150,
//           totalPrice: calculateTotal(1150),
//           description:
//             "Enhanced experience with underwater photography and extended dive time",
//           seatsLeft: 4,
//           amenities: [
//             { icon: "/icons/misc/checkbox.svg", label: "Premium equipment" },
//             { icon: "/icons/misc/checkbox.svg", label: "Underwater photos" },
//             { icon: "/icons/misc/checkbox.svg", label: "Extended dive time" },
//           ],
//         },
//       ],
//     },
//     {
//       id: "3",
//       title: "Advanced Scuba Diving",
//       description:
//         "For experienced divers looking to explore deeper waters and marine life",
//       images: [
//         {
//           src: "/images/activities/activitiesList/3.png",
//           alt: "Advanced Scuba Diving",
//         },
//       ],
//       price: 1200,
//       totalPrice: calculateTotal(1200),
//       type: "Advanced",
//       duration: "2 hrs",
//       href: "/activities/booking?activity=3",
//       activityOptions: [
//         {
//           id: "3-option-1",
//           type: "Advanced Diving",
//           price: 1200,
//           totalPrice: calculateTotal(1200),
//           description:
//             "For certified divers with experience, explore deeper reefs",
//           seatsLeft: 5,
//           amenities: [
//             {
//               icon: "/icons/misc/checkbox.svg",
//               label: "Professional equipment",
//             },
//             {
//               icon: "/icons/misc/checkbox.svg",
//               label: "Deep water exploration",
//             },
//             { icon: "/icons/misc/checkbox.svg", label: "Experienced guide" },
//           ],
//         },
//       ],
//     },
//   ];

//   // Generate activity schedules for other time slots
//   const otherActivities = [
//     {
//       id: "4",
//       title: "Afternoon Scuba Session",
//       description: "Explore the underwater world during the afternoon hours",
//       images: [
//         {
//           src: "/images/activities/activitiesList/1.png",
//           alt: "Afternoon Scuba Session",
//         },
//       ],
//       price: 1100,
//       totalPrice: calculateTotal(1100),
//       type: "Boat Diving",
//       duration: "1 hr",
//       href: "/activities/booking?activity=4",
//       activityOptions: [
//         {
//           id: "4-option-1",
//           type: "Afternoon Standard",
//           price: 1100,
//           totalPrice: calculateTotal(1100),
//           description: "Standard afternoon dive with all equipment provided",
//           seatsLeft: 10,
//           amenities: [
//             { icon: "/icons/misc/checkbox.svg", label: "Equipment included" },
//             { icon: "/icons/misc/checkbox.svg", label: "Afternoon snacks" },
//           ],
//         },
//       ],
//     },
//     {
//       id: "5",
//       title: "Evening Dive Experience",
//       description: "Experience the magic of diving as the sun sets",
//       images: [
//         {
//           src: "/images/activities/activitiesList/2.png",
//           alt: "Evening Dive Experience",
//         },
//       ],
//       price: 1300,
//       totalPrice: calculateTotal(1300),
//       type: "Shore Diving",
//       duration: "1 hr",
//       href: "/activities/booking?activity=5",
//       activityOptions: [
//         {
//           id: "5-option-1",
//           type: "Sunset Dive",
//           price: 1300,
//           totalPrice: calculateTotal(1300),
//           description:
//             "Experience the underwater world as the sun sets, with unique marine life activity",
//           seatsLeft: 3,
//           amenities: [
//             { icon: "/icons/misc/checkbox.svg", label: "Premium equipment" },
//             { icon: "/icons/misc/checkbox.svg", label: "Sunset view" },
//             { icon: "/icons/misc/checkbox.svg", label: "Evening refreshments" },
//           ],
//         },
//       ],
//     },
//   ];

//   // Return activities based on type
//   if (activityType === "scuba-diving") {
//     return [...morningActivities, ...otherActivities];
//   } else {
//     // Return a subset for other activity types
//     return morningActivities;
//   }
// }
