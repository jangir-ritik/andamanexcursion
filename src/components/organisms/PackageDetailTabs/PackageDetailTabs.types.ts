import { Package } from "@/data/packages";

export interface PackageDetailTabsProps {
  packageData: Package;
}

export interface OverviewTabProps {
  packageData: Package;
}

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
}

export interface ItineraryTabProps {
  itinerary: ItineraryItem[];
}

export interface WhatsCoveredTabProps {
  includes: string[];
  excludes: string[];
}
