import { NavigationItem } from "@/components/organisms/Header/Header.types";
import { navigationService } from "@/services/payload/collections/navigation";
import { cache } from "react";

interface PayloadNavigationItem {
  type: "simple" | "activities" | "packages" | "specials" | "custom";
  label: string;
  href: string;
  isClickable?: boolean | null;
  unique?: boolean | null;
  activityCategories?: Array<{
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    sortOrder: number;
  }>;
  packageCategories?: Array<{
    id: string;
    title: string;
    slug: string;
    isActive?: boolean;
    displaySettings: {
      order: number;
      isActive: boolean;
    };
  }>;
  specialCategories?: Array<{
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    order: number;
  }>;
  customItems?: Array<{
    label: string;
    href: string;
    isActive: boolean;
  }>;
  displaySettings: {
    order: number;
    isActive: boolean;
    maxDropdownItems?: number;
  };
}

// Define types for category objects
interface ActivityCategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

interface PackageCategory {
  id: string;
  title: string;
  slug: string;
  isActive?: boolean;
  displaySettings?: {
    order: number;
    isActive: boolean;
  };
}

interface SpecialCategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  order: number;
}

interface CustomItem {
  label: string;
  href: string;
  isActive: boolean;
}

// Cache the navigation data for the duration of the request
export const getNavigationData = cache(async (): Promise<NavigationItem[]> => {
  try {
    // Fetch navigation configuration from Payload CMS
    const navigationConfig = await navigationService.getMainNavigation();

    if (!navigationConfig?.mainNavigation) {
      return getFallbackNavigation();
    }

    // Transform Payload data to our NavigationItem format
    const transformedItems = await Promise.all(
      navigationConfig.mainNavigation
        .filter((item: any) => item.displaySettings?.isActive)
        .sort(
          (a: any, b: any) =>
            (a.displaySettings?.order || 0) - (b.displaySettings?.order || 0)
        )
        .map(async (item: any) => {
          const baseItem: NavigationItem = {
            label: item.label,
            href: item.href,
            unique: item.unique || false,
            isClickable: item.isClickable !== false, // Default to true if not explicitly false
          };

          // Handle different dropdown types
          switch (item.type) {
            case "activities":
              if (item.activityCategories?.length) {
                baseItem.children = item.activityCategories
                  .filter((category: ActivityCategory) => category.isActive)
                  .sort(
                    (a: ActivityCategory, b: ActivityCategory) =>
                      a.sortOrder - b.sortOrder
                  )
                  .slice(0, item.displaySettings?.maxDropdownItems || 10)
                  .map((category: ActivityCategory) => ({
                    label: category.name,
                    href: `/activities/${category.slug}`,
                  }));
              }
              break;

            case "packages":
              if (item.packageCategories?.length) {
                // Log to diagnose the exact structure
                if (process.env.NODE_ENV === "development") {
                  console.log(
                    "Package categories raw data:",
                    JSON.stringify(item.packageCategories, null, 2)
                  );
                }

                baseItem.children = item.packageCategories
                  // For packages, don't check isActive directly as it may not exist at top level
                  .filter(
                    (category: PackageCategory) =>
                      category.displaySettings?.isActive !== false
                  )
                  .sort(
                    (a: PackageCategory, b: PackageCategory) =>
                      (a.displaySettings?.order || 0) -
                      (b.displaySettings?.order || 0)
                  )
                  .slice(0, item.displaySettings?.maxDropdownItems || 10)
                  .map((category: PackageCategory) => ({
                    label: category.title,
                    href: `/packages/${category.slug}`,
                  }));

                // Log transformed children
                if (process.env.NODE_ENV === "development") {
                  console.log(
                    "Transformed package children:",
                    baseItem.children
                  );
                }
              }
              break;

            case "specials":
              if (item.specialCategories?.length) {
                baseItem.children = item.specialCategories
                  .filter((category: SpecialCategory) => category.isActive)
                  .sort(
                    (a: SpecialCategory, b: SpecialCategory) =>
                      (a.order || 0) - (b.order || 0)
                  )
                  .slice(0, item.displaySettings?.maxDropdownItems || 10)
                  .map((category: SpecialCategory) => ({
                    label: category.name,
                    href: `/specials/${category.slug}`,
                  }));
              }
              break;

            case "custom":
              if (item.customItems?.length) {
                baseItem.children = item.customItems
                  .filter((customItem: CustomItem) => customItem.isActive)
                  .map((customItem: CustomItem) => ({
                    label: customItem.label,
                    href: customItem.href,
                  }));
              }
              break;

            case "simple":
            default:
              // No children for simple links
              break;
          }

          return baseItem;
        })
    );

    return transformedItems;
  } catch (error) {
    console.error("Error fetching navigation data:", error);
    return getFallbackNavigation();
  }
});

// Fallback navigation when CMS is unavailable
function getFallbackNavigation(): NavigationItem[] {
  return [
    {
      label: "Ferry",
      href: "/ferry",
    },
    {
      label: "Boat",
      href: "/boat",
    },
    {
      label: "Activities",
      href: "/activities",
    },
    {
      label: "Packages",
      href: "/packages",
    },
    {
      label: "Specials",
      href: "/specials",
    },
    {
      label: "Live Volcanos",
      href: "/live-volcanos",
    },
    {
      label: "Fishing",
      href: "/fishing",
    },
    {
      label: "Destinations",
      href: "/destinations",
    },
    {
      label: "Plan Your Trip",
      href: "/plan-your-trip",
    },
    {
      label: "Get in Touch",
      href: "/contact",
      unique: true,
    },
  ];
}
