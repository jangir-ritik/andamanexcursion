// Use a more permissive type approach for Media
// type Media = any;

// Import the actual PayloadCMS generated types
import type {
  Media,
  PackageCategory as PayloadPackageCategory,
  PackagePeriod as PayloadPackagePeriod,
  Location,
} from "@payload-types";

export interface PayloadPackage {
  id: string;
  title: string;
  slug: string;
  coreInfo?: {
    // Use union type to handle both string and object types
    category: string | PayloadPackageCategory;
    period: string | PayloadPackagePeriod;
    location: string | Location;
  } | null;
  descriptions?: {
    description: string;
    shortDescription?: string | null; // Allow null
  } | null;
  pricing?: {
    price: number;
    originalPrice?: number | null;
  } | null;
  media?: {
    images?: Array<{
      image: string | Media;
      alt: string;
      caption?: string | null;
      id?: string | null;
    }> | null;
  } | null;
  packageDetails?: {
    highlights?: Array<{ highlight: string }> | null;
    inclusions?: Array<{ inclusion: string }> | null;
    exclusions?: Array<{ exclusion: string }> | null;
    itinerary?: Array<{
      day: number;
      title: string;
      description?: string | null;
      activities?: Array<{ activity: string }> | null;
    }> | null;
    accommodation?: string | null;
    transportation?: string | null;
    bestTimeToVisit?: string | null;
    specialNotes?: string | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
  // For processed data from lib/payload.ts
  images?: Array<{
    url: string;
    alt: any;
    caption?: any;
  }>;
  [key: string]: any;
}

export interface PackageDetailHeaderProps {
  packageData: PayloadPackage;
}
