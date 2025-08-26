import type { ActivitySearchParams } from "@/store/ActivityStoreRQ";
import { Activity } from "@payload-types";

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
  searchParams: ActivitySearchParams
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
      seatsLeft: option.maxCapacity,
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
      src:
        typeof activity.media.featuredImage === "string"
          ? activity.media.featuredImage
          : activity.media.featuredImage?.url || "/images/placeholder.png",
      alt: activity.title || "Activity image",
    },
  ];

  if (activity.media?.gallery?.length) {
    images.push(
      ...activity.media.gallery.map((img) => ({
        src:
          typeof img.image === "string"
            ? img.image
            : img.image?.url || "/images/placeholder.png",
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

// Get time slots for activity (simplified)
export function getActivityTimeSlots(activity: Activity): TimeSlot[] {
  if (activity.coreInfo?.defaultTimeSlots?.length) {
    return activity.coreInfo.defaultTimeSlots.map((slot) => ({
      id: typeof slot === "string" ? slot : slot.id,
      startTime: typeof slot === "string" ? slot : slot.startTime,
      endTime: typeof slot === "string" ? slot : slot.endTime || slot.startTime, // Fallback to startTime if endTime is undefined
      displayTime:
        typeof slot === "string"
          ? slot
          : `${slot.startTime} - ${slot.endTime || slot.startTime}`,
      isAvailable: typeof slot === "string" ? true : slot.isActive !== false,
    }));
  }
  return [];
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
    searchParams
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
    type:
      typeof activity.coreInfo?.category === "string"
        ? activity.coreInfo?.category
        : typeof activity.coreInfo?.category[0] === "string"
        ? activity.coreInfo?.category[0]
        : activity.coreInfo?.category[0].name,
    duration:
      typeof activity.coreInfo?.duration === "string"
        ? activity.coreInfo?.duration
        : "2 hours",
    href: `/activities/${activity.slug}`,
    activityOptions: transformedOptions,
    availableTimeSlots,
    onSelectActivity: handleActivitySelection,
    location:
      typeof activity.coreInfo?.location === "string"
        ? activity.coreInfo?.location
        : "Andaman",
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
