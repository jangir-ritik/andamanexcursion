import type { Activity, ActivitySearchParams } from "@/store/ActivityStore";

// Types for transformed data
export interface TransformedActivityCard {
  id: string;
  title: string;
  description: string;
  images: Array<{ src: string; alt: string }>;
  price: number;
  totalPrice: number;
  originalPrice?: number;
  originalTotalPrice?: number;
  type: string;
  duration: string;
  href: string;
  activityOptions: TransformedActivityOption[];
  availableTimeSlots: TimeSlot[];
  onSelectActivity?: (activityId: string, optionId: string) => void;
  location?: string;
  totalGuests: number;
  timeSlots: string[];
}

export interface TransformedActivityOption {
  id: string;
  type: string;
  description: string;
  price: number;
  totalPrice: number;
  originalPrice?: number;
  originalTotalPrice?: number;
  seatsLeft: number;
  amenities: any[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  displayTime: string;
  isAvailable: boolean;
}

// Utility functions for price calculations
export function calculateTotalPrice(
  basePrice: number,
  searchParams: ActivitySearchParams
): number {
  return basePrice * (searchParams.adults + searchParams.children * 0.5);
}

// Memoized helper to generate stable option IDs
const optionIdCache = new Map<string, string>();
export function getStableOptionId(activityId: string, index: number): string {
  const key = `${activityId}-${index}`;
  if (!optionIdCache.has(key)) {
    optionIdCache.set(key, `${activityId}-option-${index}`);
  }
  return optionIdCache.get(key)!;
}

// Transform activity options (pure function)
export function transformActivityOptions(
  options: any[],
  activityId: string,
  searchParams: ActivitySearchParams,
  defaultMaxCapacity: number
): TransformedActivityOption[] {
  return options.map((option, index) => {
    const optionCurrentPrice = option.discountedPrice || option.price;
    const optionOriginalPrice = option.discountedPrice
      ? option.price
      : undefined;

    return {
      id: option.id || getStableOptionId(activityId, index),
      type: option.optionTitle || "Standard Option",
      description: option.optionDescription || "",
      price: optionCurrentPrice,
      totalPrice: calculateTotalPrice(optionCurrentPrice, searchParams),
      originalPrice: optionOriginalPrice,
      originalTotalPrice: optionOriginalPrice
        ? calculateTotalPrice(optionOriginalPrice, searchParams)
        : undefined,
      seatsLeft: option.maxCapacity || defaultMaxCapacity,
      amenities: [],
    };
  });
}

// Transform activity images (pure function)
export function transformActivityImages(
  activity: Activity
): Array<{ src: string; alt: string }> {
  const images = [
    {
      src: activity.media?.featuredImage?.url || "/images/placeholder.png",
      alt: activity.title || "Activity image",
    },
  ];

  if (activity.media?.gallery?.length) {
    images.push(
      ...activity.media.gallery.map((img) => ({
        src: img.image?.url || "/images/placeholder.png",
        alt: img.alt || "Activity gallery image",
      }))
    );
  }

  return images;
}

// Helper to parse duration string like "2 hours" -> 2
export function parseDuration(duration: string): number {
  const match = duration.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 2; // default to 2 hours
}

// Helper to add hours to time string
export function addHours(timeStr: string, hours: number): string {
  const [hour, minute] = timeStr.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + hours * 60;
  const newHour = Math.floor(totalMinutes / 60) % 24;
  const newMinute = totalMinutes % 60;
  return `${newHour.toString().padStart(2, "0")}:${newMinute
    .toString()
    .padStart(2, "0")}`;
}

// Check if activity is water-based (cached)
const waterActivityCache = new Map<string, boolean>();
export function isWaterActivity(activity: Activity): boolean {
  const cacheKey = activity.id;
  if (!waterActivityCache.has(cacheKey)) {
    const title = activity.title?.toLowerCase() || "";
    const isWater =
      title.includes("scuba") ||
      title.includes("snorkel") ||
      title.includes("diving") ||
      title.includes("kayak");
    waterActivityCache.set(cacheKey, isWater);
  }
  return waterActivityCache.get(cacheKey)!;
}

// Create duration-based time slots (pure function)
export function createDurationBasedTimeSlots(activity: Activity): TimeSlot[] {
  const duration = activity.coreInfo?.duration || "2 hours";
  const durationHours = parseDuration(duration);
  const isWater = isWaterActivity(activity);

  if (isWater) {
    return [
      {
        id: "morning",
        startTime: "09:00",
        endTime: addHours("09:00", durationHours),
        displayTime: `09:00 - ${addHours("09:00", durationHours)} hrs`,
        isAvailable: true,
      },
      {
        id: "afternoon",
        startTime: "14:00",
        endTime: addHours("14:00", durationHours),
        displayTime: `14:00 - ${addHours("14:00", durationHours)} hrs`,
        isAvailable: true,
      },
    ];
  } else {
    return [
      {
        id: "morning",
        startTime: "10:00",
        endTime: addHours("10:00", durationHours),
        displayTime: `10:00 - ${addHours("10:00", durationHours)} hrs`,
        isAvailable: true,
      },
      {
        id: "afternoon",
        startTime: "15:00",
        endTime: addHours("15:00", durationHours),
        displayTime: `15:00 - ${addHours("15:00", durationHours)} hrs`,
        isAvailable: true,
      },
    ];
  }
}

// Get time slots for activity (simplified)
export function getActivityTimeSlots(activity: Activity): TimeSlot[] {
  // 1. Primary: Use custom time slots if enabled
  if (
    activity.scheduling?.useCustomTimeSlots &&
    activity.scheduling?.availableTimeSlots?.length
  ) {
    return activity.scheduling.availableTimeSlots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime || slot.startTime, // Fallback to startTime if endTime is undefined
      displayTime:
        slot.twelveHourTime ||
        `${slot.startTime} - ${slot.endTime || slot.startTime}`,
      isAvailable: slot.status?.isActive !== false,
    }));
  }

  // 2. Default: Use activity's default time slots
  if (activity.scheduling?.defaultTimeSlots?.length) {
    return activity.scheduling.defaultTimeSlots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime || slot.startTime, // Fallback to startTime if endTime is undefined
      displayTime:
        slot.twelveHourTime ||
        `${slot.startTime} - ${slot.endTime || slot.startTime}`,
      isAvailable: slot.status?.isActive !== false,
    }));
  }

  // 3. Fallback: Simple standard slots
  return [
    {
      id: "morning",
      startTime: "09:00",
      endTime: "12:00",
      displayTime: "9:00 AM - 12:00 PM",
      isAvailable: true,
    },
    {
      id: "afternoon",
      startTime: "14:00",
      endTime: "17:00",
      displayTime: "2:00 PM - 5:00 PM",
      isAvailable: true,
    },
  ];
}

// Main transformation function (pure)
export function transformActivityToCard(
  activity: Activity,
  searchParams: ActivitySearchParams,
  handleActivitySelection: (activityId: string, optionId: string) => void
): TransformedActivityCard {
  const basePrice = activity.coreInfo?.basePrice || 0;
  const discountedPrice = activity.coreInfo?.discountedPrice;
  const currentPrice = discountedPrice || basePrice;

  const totalPrice = calculateTotalPrice(currentPrice, searchParams);
  const originalTotalPrice = discountedPrice
    ? calculateTotalPrice(basePrice, searchParams)
    : undefined;

  const transformedOptions = transformActivityOptions(
    activity.activityOptions || [],
    activity.id,
    searchParams,
    activity.coreInfo?.maxCapacity || 10
  );

  const images = transformActivityImages(activity);
  const availableTimeSlots = getActivityTimeSlots(activity);

  return {
    id: activity.id,
    title: activity.title,
    description:
      activity.coreInfo?.description ||
      activity.coreInfo?.shortDescription ||
      "Experience this amazing activity in Andaman!",
    images,
    price: currentPrice,
    totalPrice,
    originalPrice: discountedPrice ? basePrice : undefined,
    originalTotalPrice,
    type: activity.coreInfo?.category[0]?.name || "Activity",
    duration: activity.coreInfo?.duration || "2 hours",
    href: `/activities/${activity.slug}`,
    activityOptions: transformedOptions,
    availableTimeSlots,
    onSelectActivity: handleActivitySelection,
    location: activity.coreInfo?.location[0]?.name,
    totalGuests: searchParams.adults + searchParams.children,
    timeSlots: availableTimeSlots.map((slot) => slot.displayTime),
  };
}

// Batch transformation function (optimized for multiple activities)
export function transformActivitiesToCards(
  activities: Activity[],
  searchParams: ActivitySearchParams,
  handleActivitySelection: (activityId: string, optionId: string) => void
): TransformedActivityCard[] {
  return activities.map((activity) =>
    transformActivityToCard(activity, searchParams, handleActivitySelection)
  );
}
