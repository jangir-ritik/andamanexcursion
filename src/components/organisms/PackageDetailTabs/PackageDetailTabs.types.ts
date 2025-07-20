import { PayloadPackage } from "@/components/sectionBlocks/packages/packageDetailHeader/PackageDetailHeader.types";

export interface PackageDetailTabsProps {
  packageData: PayloadPackage;
}

export interface OverviewTabProps {
  packageData: PayloadPackage;
}

export interface ItineraryItem {
  day: number;
  title: string;
  description?: string | null;
  activities?: Array<{ activity: string }> | null;
}

export interface ItineraryTabProps {
  itinerary: ItineraryItem[] | undefined | null;
}

export interface WhatsCoveredTabProps {
  includes: Array<{ inclusion: string }> | string[] | undefined | null;
  excludes: Array<{ exclusion: string }> | string[] | undefined | null;
}
