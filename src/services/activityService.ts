import { ActivityCardProps } from "@/components/molecules/BookingResults/ActivityResults";
import { formatTimeForDisplay } from "@/utils/timeUtils";

// Cache for activity data to prevent redundant calculations and API calls
const activityDataCache = new Map<
  string,
  { data: ActivityCardProps[]; timestamp: number }
>();
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetches available activities based on search criteria
 */
export async function fetchAvailableActivities(
  activityType: string,
  date: string,
  time: string,
  passengers: number
): Promise<ActivityCardProps[]> {
  try {
    // Create a cache key based on search parameters
    const cacheKey = `${activityType}-${date}-${time}-${passengers}`;

    // Check if we have valid cached data
    const cachedData = activityDataCache.get(cacheKey);
    const now = Date.now();

    if (cachedData && now - cachedData.timestamp < CACHE_EXPIRY_TIME) {
      console.log("Using cached activity data");
      return cachedData.data;
    }

    // In a real implementation, this would be an API call
    // Example: const response = await fetch(`/api/activities?type=${activityType}&date=${date}&time=${time}&passengers=${passengers}`);

    // For now, we'll simulate a delay and return mock data
    await new Promise((resolve) => setTimeout(resolve, 500));

    // This would normally come from the API
    const data = getMockActivityData(activityType, date, time);

    // Cache the results
    activityDataCache.set(cacheKey, { data, timestamp: now });

    return data;
  } catch (error) {
    console.error("Error fetching activity data:", error);
    return [];
  }
}

/**
 * Fetches details for a specific activity
 */
export async function fetchActivityDetails(
  activityId: string
): Promise<ActivityCardProps | null> {
  try {
    // In a real implementation, this would be an API call
    // Example: const response = await fetch(`/api/activities/${activityId}`);

    // For now, we'll simulate a delay and return mock data
    await new Promise((resolve) => setTimeout(resolve, 300));

    // This would normally come from the API
    const mockData = getMockActivityData(
      "scuba-diving",
      new Date().toISOString().split("T")[0],
      "10:00"
    );
    const activity = mockData.find((a) => a.id === activityId);
    return activity || null;
  } catch (error) {
    console.error("Error fetching activity details:", error);
    return null;
  }
}

/**
 * Mock data for development purposes
 */
function getMockActivityData(
  activityType: string,
  date: string,
  time: string
): ActivityCardProps[] {
  // Generate activity schedules for the morning (11:00 AM time slot)
  const morningActivities = [
    {
      id: "1",
      title: "Scuba Diving at Neil Island",
      description:
        "Dive deep into the Andaman's clear waters and explore stunning coral reefs and marine life",
      image: "/images/activities/activitiesList/1.png",
      imageAlt: "Scuba Diving at Neil Island",
      price: 1000,
      totalPrice: 2000,
      duration: "10:00 AM - 1 hr",
      location: "Neil Island",
      rating: 4.9,
      availableSlots: 10,
    },
    {
      id: "2",
      title: "Fun Dive at Havelock",
      description:
        "Dive deep into the Andaman's clear waters and explore stunning coral reefs and marine life",
      image: "/images/activities/activitiesList/2.png",
      imageAlt: "Fun Dive at Havelock",
      price: 950,
      totalPrice: 1900,
      duration: "11:00 AM - 1 hr",
      location: "Havelock",
      rating: 4.5,
      availableSlots: 15,
    },
    {
      id: "3",
      title: "Advanced Scuba Diving",
      description:
        "For experienced divers looking to explore deeper waters and marine life",
      image: "/images/activities/activitiesList/3.png",
      imageAlt: "Advanced Scuba Diving",
      price: 1200,
      totalPrice: 2400,
      duration: "11:30 AM - 2 hrs",
      location: "North Bay",
      rating: 4.8,
      availableSlots: 8,
    },
  ];

  // Generate activity schedules for other time slots
  const otherActivities = [
    {
      id: "4",
      title: "Afternoon Scuba Session",
      description: "Explore the underwater world during the afternoon hours",
      image: "/images/activities/activitiesList/1.png",
      imageAlt: "Afternoon Scuba Session",
      price: 1100,
      totalPrice: 2200,
      duration: "14:00 PM - 1 hr",
      location: "Elephant Beach",
      rating: 4.7,
      availableSlots: 12,
    },
    {
      id: "5",
      title: "Evening Dive Experience",
      description: "Experience the magic of diving as the sun sets",
      image: "/images/activities/activitiesList/2.png",
      imageAlt: "Evening Dive Experience",
      price: 1300,
      totalPrice: 2600,
      duration: "16:00 PM - 1 hr",
      location: "Havelock",
      rating: 4.9,
      availableSlots: 6,
    },
  ];

  // Return activities based on type
  if (activityType === "scuba-diving") {
    return [...morningActivities, ...otherActivities];
  } else {
    // Return a subset for other activity types
    return morningActivities;
  }
}
