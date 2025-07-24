import { getPayload } from "payload";
import { cache } from "react";
import config from "@payload-config";
import { Activity, Location, ActivityCategory, TimeSlot } from "@payload-types";

/**
 * Unified PayloadCMS Services
 * ---------------------------
 * This file contains all methods for accessing CMS data through PayloadCMS.
 * All methods use direct database access for optimal performance.
 */

// Cache payload instance
export const getCachedPayload = cache(async () => {
  try {
    return await getPayload({ config });
  } catch (error) {
    console.error("Error initializing Payload:", error);
    throw error;
  }
});

// Base query builder for common filtering patterns
const buildBaseQuery = (additionalConditions: any[] = []) => ({
  and: [
    { "publishingSettings.status": { equals: "published" } },
    ...additionalConditions,
  ],
});

// Generic function for querying collections with error handling
async function queryCollection<T>(
  collection: string,
  options: any = {}
): Promise<{ docs: T[]; totalDocs: number; hasNextPage: boolean }> {
  try {
    const payload = await getCachedPayload();
    const result = await payload.find({
      collection,
      limit: 100,
      where: {
        isActive: { equals: true },
        ...options.where,
      },
      sort: options.sort,
      depth: options.depth || 1,
      ...options,
    });

    return {
      docs: result.docs as T[],
      totalDocs: result.totalDocs,
      hasNextPage: result.hasNextPage,
    };
  } catch (error) {
    console.error(`Error querying ${collection}:`, error);
    return { docs: [], totalDocs: 0, hasNextPage: false };
  }
}

/**
 * Helper function to extract a valid image URL from various PayloadCMS media structures
 */
const extractImageUrl = (mediaField: any): string => {
  // Case 1: Direct URL string
  if (typeof mediaField === "string") {
    return mediaField;
  }

  // Case 2: Full media object with URL
  if (mediaField?.url) {
    return mediaField.url;
  }

  // Case 3: Media ID that needs to be converted to URL
  if (mediaField && typeof mediaField === "object" && !mediaField.url) {
    // If we have filename, serve from static directory
    if (mediaField.filename) {
      return `/media/${mediaField.filename}`;
    }

    // If it's an ID (MongoDB ObjectId), construct a media URL as fallback
    if (typeof mediaField === "string" || mediaField.id) {
      const mediaId =
        typeof mediaField === "string" ? mediaField : mediaField.id;
      return `/api/media/file/${mediaId}`;
    }
  }

  // Fallback
  return "/images/placeholder.png";
};

/**
 * Page Services
 * -------------
 */

export const pageService = {
  async getBySlug(slug: string) {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "pages",
        where: buildBaseQuery([{ slug: { equals: slug } }]),
        limit: 1,
        depth: 2,
      });
      return docs[0] || null;
    } catch (error) {
      console.error("Error getting page by slug:", slug, error);
      return null;
    }
  },

  async getAll() {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "pages",
        where: {
          "publishingSettings.status": { equals: "published" },
        },
        sort: "title",
      });
      return docs;
    } catch (error) {
      console.error("Error getting all pages:", error);
      return [];
    }
  },
};

/**
 * Location Services
 * ----------------
 */

export const locationService = {
  // Get all active locations
  async getAll(): Promise<Location[]> {
    const result = await queryCollection<Location>("locations", {
      sort: "priority",
    });
    return result.docs;
  },

  // Get locations by type
  async getByType(type: string): Promise<Location[]> {
    const result = await queryCollection<Location>("locations", {
      where: { type: { equals: type } },
      sort: "priority",
    });
    return result.docs;
  },

  // Get ferry ports specifically
  async getFerryPorts(): Promise<Location[]> {
    return this.getByType("ferry_port");
  },

  // Get activity locations
  async getActivityLocations(): Promise<Location[]> {
    return this.getByType("activity_location");
  },

  // Get boat departure points
  async getBoatDepartures(): Promise<Location[]> {
    return this.getByType("boat_departure");
  },

  // Get location by ID
  async getById(id: string): Promise<Location | null> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.findByID({
        collection: "locations",
        id,
        depth: 1,
      });
      return result as Location;
    } catch (error) {
      console.error(`Error fetching location ${id}:`, error);
      return null;
    }
  },

  // Get location by slug
  async getBySlug(slug: string): Promise<Location | null> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "locations",
        where: { slug: { equals: slug } },
        limit: 1,
      });
      return (result.docs[0] as Location) || null;
    } catch (error) {
      console.error(`Error fetching location by slug ${slug}:`, error);
      return null;
    }
  },
};

/**
 * Package Category Services
 * ------------------------
 */

export const packageCategoryService = {
  async getAll() {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "package-categories",
        where: { "displaySettings.isActive": { equals: true } },
        sort: "displaySettings.order",
      });
      return docs;
    } catch (error) {
      console.error("Error getting package categories:", error);
      return [];
    }
  },

  async getBySlug(slug: string) {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "package-categories",
        where: {
          and: [
            { slug: { equals: slug } },
            { "displaySettings.isActive": { equals: true } },
          ],
        },
        limit: 1,
        depth: 2,
      });
      return docs[0] || null;
    } catch (error) {
      console.error("Error getting package category by slug:", error);
      return null;
    }
  },
};

/**
 * Package Period Services
 * ----------------------
 */

export const packagePeriodService = {
  async getAll() {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "package-periods",
        where: { isActive: { equals: true } },
        sort: "order",
      });
      return docs;
    } catch (error) {
      console.error("Error getting package periods:", error);
      return [];
    }
  },
};

/**
 * Package Services
 * ---------------
 */

export interface PackageOptions {
  categorySlug?: string;
  period?: string;
  featured?: boolean;
  limit?: number;
  depth?: number;
  slug?: string;
  id?: string;
}

export const packageService = {
  async getAll(options: PackageOptions = {}) {
    const {
      categorySlug,
      period,
      featured,
      limit = 100,
      depth = 2,
      slug,
      id,
    } = options;

    try {
      const payload = await getCachedPayload();
      const conditions: any[] = [];

      // Handle specific package by ID
      if (id) {
        conditions.push({ id: { equals: id } });
      }

      // Handle specific package by slug
      if (slug) {
        conditions.push({ slug: { equals: slug } });
      }

      // Handle category filtering
      if (categorySlug) {
        const category = await packageCategoryService.getBySlug(categorySlug);
        if (category) {
          conditions.push({
            "coreInfo.category": { equals: category.id },
          });
        } else {
          return []; // Category not found, return empty
        }
      }

      // Handle period filtering
      if (period && period !== "all") {
        const periodQuery = await payload.find({
          collection: "package-periods",
          where: {
            or: [{ value: { equals: period } }, { id: { equals: period } }],
          },
          limit: 1,
        });

        if (periodQuery.docs[0]) {
          conditions.push({
            "coreInfo.period": { equals: periodQuery.docs[0].id },
          });
        }
      }

      // Handle featured filtering
      if (featured !== undefined) {
        conditions.push({ "featuredSettings.featured": { equals: featured } });
      }

      // Only include published packages
      conditions.push({ "publishingSettings.status": { equals: "published" } });

      const { docs } = await payload.find({
        collection: "packages",
        where: buildBaseQuery(conditions),
        sort: featured ? "featuredSettings.featuredOrder" : "title",
        limit,
        depth,
      });

      return docs;
    } catch (error) {
      console.error("Error getting packages:", error);
      return [];
    }
  },

  async getFeatured(limit: number = 3) {
    return this.getAll({ featured: true, limit });
  },

  async getBySlug(slug: string, categorySlug?: string) {
    const options: PackageOptions = { slug, limit: 1, depth: 3 };
    if (categorySlug) {
      options.categorySlug = categorySlug;
    }
    const packages = await this.getAll(options);
    return packages[0] || null;
  },

  async getById(id: string) {
    const packages = await this.getAll({ id, limit: 1, depth: 3 });
    return packages[0] || null;
  },
};

/**
 * Activity Services
 * ----------------
 */

export const activityService = {
  // Get all active activities
  async getAll(): Promise<Activity[]> {
    const result = await queryCollection<Activity>("activities", {
      where: {
        "status.isActive": { equals: true },
      },
      sort: "-status.priority",
      depth: 2, // Include relations
    });
    return result.docs;
  },

  // Get featured activities
  async getFeatured(limit: number = 6): Promise<Activity[]> {
    const result = await queryCollection<Activity>("activities", {
      where: {
        "status.isFeatured": { equals: true },
        "status.isActive": { equals: true },
      },
      sort: "-status.priority",
      limit,
      depth: 2,
    });
    return result.docs;
  },

  // Search activities with filters
  async search(filters: {
    category?: string;
    location?: string;
    date?: string;
    time?: string;
    passengers?: number;
    limit?: number;
    page?: number;
  }): Promise<{
    activities: Activity[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const payload = await getCachedPayload();

      // Build where clause
      const whereClause: any = {
        "status.isActive": { equals: true },
      };

      // Add category filter
      if (filters.category && filters.category !== "all") {
        whereClause["coreInfo.category"] = { in: [filters.category] };
      }

      // Add location filter
      if (filters.location && filters.location !== "all") {
        whereClause["coreInfo.location"] = { in: [filters.location] };
      }

      // Add capacity filter based on passengers
      if (filters.passengers) {
        whereClause["coreInfo.maxCapacity"] = {
          greater_than_equal: filters.passengers,
        };
      }

      const result = await payload.find({
        collection: "activities",
        where: whereClause,
        limit: filters.limit || 12,
        page: filters.page || 1,
        sort: "-status.priority",
        depth: 2,
      });

      return {
        activities: result.docs as Activity[],
        totalCount: result.totalDocs,
        hasMore: result.hasNextPage,
      };
    } catch (error) {
      console.error("Error searching activities:", error);
      return { activities: [], totalCount: 0, hasMore: false };
    }
  },

  // Get activity by slug
  async getBySlug(slug: string): Promise<Activity | null> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "activities",
        where: {
          slug: { equals: slug },
          "status.isActive": { equals: true },
        },
        limit: 1,
        depth: 2,
      });
      return (result.docs[0] as Activity) || null;
    } catch (error) {
      console.error(`Error fetching activity by slug ${slug}:`, error);
      return null;
    }
  },

  // Get activity by ID
  async getById(id: string): Promise<Activity | null> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.findByID({
        collection: "activities",
        id,
        depth: 2,
      });
      return result as Activity;
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error);
      return null;
    }
  },

  // Get activities by category
  async getByCategory(
    categoryId: string,
    limit: number = 10
  ): Promise<Activity[]> {
    const result = await queryCollection<Activity>("activities", {
      where: {
        "coreInfo.category": { in: [categoryId] },
        "status.isActive": { equals: true },
      },
      sort: "-status.priority",
      limit,
      depth: 2,
    });
    return result.docs;
  },

  // Get activities by location
  async getByLocation(
    locationId: string,
    limit: number = 10
  ): Promise<Activity[]> {
    const result = await queryCollection<Activity>("activities", {
      where: {
        "coreInfo.location": { in: [locationId] },
        "status.isActive": { equals: true },
      },
      sort: "-status.priority",
      limit,
      depth: 2,
    });
    return result.docs;
  },
};

/**
 * Activity Category Services
 * -------------------------
 */

export const activityCategoryService = {
  async getAll(): Promise<ActivityCategory[]> {
    const result = await queryCollection<ActivityCategory>(
      "activity-categories",
      {
        sort: "priority",
      }
    );
    return result.docs;
  },

  async getById(id: string): Promise<ActivityCategory | null> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.findByID({
        collection: "activity-categories",
        id,
      });
      return result as ActivityCategory;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return null;
    }
  },

  async getBySlug(slug: string): Promise<ActivityCategory | null> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "activity-categories",
        where: { slug: { equals: slug } },
        limit: 1,
      });
      return (result.docs[0] as ActivityCategory) || null;
    } catch (error) {
      console.error(`Error fetching category by slug ${slug}:`, error);
      return null;
    }
  },
};

/**
 * Time Slot Services
 * -----------------
 */

export const timeSlotService = {
  async getAll(): Promise<TimeSlot[]> {
    const result = await queryCollection<TimeSlot>("time-slots", {
      where: {
        "status.isActive": { equals: true },
      },
      sort: "timing.startTime",
    });
    return result.docs;
  },

  // Get time slots by type
  async getByType(
    type: "ferry" | "boat" | "activity" | "package" | "general"
  ): Promise<TimeSlot[]> {
    const result = await queryCollection<TimeSlot>("time-slots", {
      where: {
        "availability.type": { equals: type },
        "status.isActive": { equals: true },
      },
      sort: "timing.startTime",
    });
    return result.docs;
  },

  // Get time slots for activities
  async getForActivities(): Promise<TimeSlot[]> {
    return this.getByType("activity");
  },

  // Get time slots for ferries
  async getForFerries(): Promise<TimeSlot[]> {
    return this.getByType("ferry");
  },

  // Get time slots for boats
  async getForBoats(): Promise<TimeSlot[]> {
    return this.getByType("boat");
  },

  // Get time slots by category (morning, afternoon, etc.)
  async getByCategory(category: string): Promise<TimeSlot[]> {
    const result = await queryCollection<TimeSlot>("time-slots", {
      where: {
        "display.category": { equals: category },
        "status.isActive": { equals: true },
      },
      sort: "timing.startTime",
    });
    return result.docs;
  },

  // Get popular time slots
  async getPopular(type?: string): Promise<TimeSlot[]> {
    const whereClause: any = {
      "status.isPopular": { equals: true },
      "status.isActive": { equals: true },
    };

    if (type) {
      whereClause["availability.type"] = { equals: type };
    }

    const result = await queryCollection<TimeSlot>("time-slots", {
      where: whereClause,
      sort: "-status.priority",
    });
    return result.docs;
  },

  // Get time slots available on a specific date
  // async getAvailableOnDate(date: string, type?: string): Promise<TimeSlot[]> {
  //   const whereClause: any = {
  //     "status.isActive": { equals: true },
  //   };

  //   if (type) {
  //     whereClause["availability.type"] = { equals: type };
  //   }

  //   const result = await queryCollection<TimeSlot>("time-slots", {
  //     where: whereClause,
  //     sort: "timing.startTime",
  //   });

  //   // Filter by date and day of week on the server side
  //   const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
  //     weekday: "long",
  //   });

  //   const filteredSlots = result.docs.filter((slot: TimeSlot) => {
  //     // Check if slot is available on this day of week
  //     if (
  //       slot.availability.daysOfWeek &&
  //       slot.availability.daysOfWeek.length > 0
  //     ) {
  //       if (!slot.availability.daysOfWeek.includes(dayOfWeek as any)) {
  //         return false;
  //       }
  //     }

  //     // Check seasonal availability
  //     if (slot.availability.seasonalAvailability) {
  //       const { availableFrom, availableTo } =
  //         slot.availability.seasonalAvailability;
  //       const checkDate = new Date(date);

  //       if (availableFrom && checkDate < new Date(availableFrom)) {
  //         return false;
  //       }

  //       if (availableTo && checkDate > new Date(availableTo)) {
  //         return false;
  //       }
  //     }

  //     return true;
  //   });

  //   return filteredSlots;
  // },

  // Get time slot by ID
  async getById(id: string): Promise<TimeSlot | null> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.findByID({
        collection: "time-slots",
        id,
        depth: 1,
      });
      return result as TimeSlot;
    } catch (error) {
      console.error(`Error fetching time slot ${id}:`, error);
      return null;
    }
  },

  // Check if a time slot is available for booking
  // async checkAvailability(
  //   slotId: string,
  //   date: string,
  //   passengers: number
  // ): Promise<{
  //   available: boolean;
  //   reason?: string;
  //   alternatives?: TimeSlot[];
  // }> {
  //   try {
  //     const slot = await this.getById(slotId);

  //     if (!slot || !slot.status.isActive) {
  //       return {
  //         available: false,
  //         reason: "Time slot is currently inactive",
  //       };
  //     }

  //     // Check capacity limits
  //     if (
  //       slot.capacity?.maxPassengers &&
  //       passengers > slot.capacity.maxPassengers
  //     ) {
  //       return {
  //         available: false,
  //         reason: `Maximum ${slot.capacity.maxPassengers} passengers allowed`,
  //       };
  //     }

  //     // Check day of week availability
  //     const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
  //       weekday: "long",
  //     });
  //     if (
  //       slot.availability.daysOfWeek &&
  //       slot.availability.daysOfWeek.length > 0
  //     ) {
  //       if (!slot.availability.daysOfWeek.includes(dayOfWeek as any)) {
  //         return {
  //           available: false,
  //           reason: "Not available on this day",
  //           alternatives: slot.weather?.alternativeSlots || [],
  //         };
  //       }
  //     }

  //     // Check seasonal availability
  //     if (slot.availability.seasonalAvailability) {
  //       const { availableFrom, availableTo } =
  //         slot.availability.seasonalAvailability;
  //       const checkDate = new Date(date);

  //       if (availableFrom && checkDate < new Date(availableFrom)) {
  //         return {
  //           available: false,
  //           reason: `Available from ${new Date(
  //             availableFrom
  //           ).toLocaleDateString()}`,
  //         };
  //       }

  //       if (availableTo && checkDate > new Date(availableTo)) {
  //         return {
  //           available: false,
  //           reason: `Available until ${new Date(
  //             availableTo
  //           ).toLocaleDateString()}`,
  //         };
  //       }
  //     }

  //     return { available: true };
  //   } catch (error) {
  //     console.error("Error checking time slot availability:", error);
  //     return {
  //       available: false,
  //       reason: "Unable to check availability",
  //     };
  //   }
  // },

  // Get time slots grouped by category
  // async getGroupedByCategory(
  //   type?: string
  // ): Promise<Record<string, TimeSlot[]>> {
  //   const slots = type
  //     ? await this.getByType(type as any)
  //     : await this.getAll();

  //   const grouped = slots.reduce((acc, slot) => {
  //     const category = slot.display?.category || "general";
  //     if (!acc[category]) {
  //       acc[category] = [];
  //     }
  //     acc[category].push(slot);
  //     return acc;
  //   }, {} as Record<string, TimeSlot[]>);

  //   return grouped;
  // },
};

/**
 * Combined Form Data Services
 * --------------------------
 */

export const formDataService = {
  // Get all data needed for activity booking form
  async getActivityFormData() {
    try {
      const [categories, locations, timeSlots] = await Promise.all([
        activityCategoryService.getAll(),
        locationService.getActivityLocations(),
        timeSlotService.getForActivities(),
      ]);

      return {
        categories,
        locations,
        timeSlots,
      };
    } catch (error) {
      console.error("Error fetching activity form data:", error);
      return {
        categories: [],
        locations: [],
        timeSlots: [],
      };
    }
  },

  // Get all data needed for ferry booking form
  async getFerryFormData() {
    try {
      const [locations, timeSlots] = await Promise.all([
        locationService.getFerryPorts(),
        timeSlotService.getForFerries(),
      ]);

      return {
        locations,
        timeSlots,
      };
    } catch (error) {
      console.error("Error fetching ferry form data:", error);
      return {
        locations: [],
        timeSlots: [],
      };
    }
  },

  // Get all data needed for boat booking form
  async getBoatFormData() {
    try {
      const [locations, timeSlots] = await Promise.all([
        locationService.getBoatDepartures(),
        timeSlotService.getForBoats(),
      ]);

      return {
        locations,
        timeSlots,
      };
    } catch (error) {
      console.error("Error fetching boat form data:", error);
      return {
        locations: [],
        timeSlots: [],
      };
    }
  },
};

/**
 * Page Data Services
 * -----------------
 * Methods that combine multiple data sources to create page-ready data
 */

export const pageDataService = {
  /**
   * Get data needed for a specific category page
   */
  async getCategoryPageData(categorySlug: string, period?: string) {
    try {
      const [category, periods, packages] = await Promise.all([
        packageCategoryService.getBySlug(categorySlug),
        packagePeriodService.getAll(),
        packageService.getAll({ categorySlug, period }),
      ]);

      if (!category) return null;

      // Process packages to ensure images are handled correctly
      const processedPackages = packages.map((pkg: any) => {
        let imageUrl = "/images/placeholder.png";

        // Extract image URL
        if (pkg.media?.images && pkg.media.images.length > 0) {
          imageUrl = extractImageUrl(pkg.media.images[0].image);
        } else if (pkg.media?.heroImage) {
          imageUrl = extractImageUrl(pkg.media.heroImage);
        }

        return {
          ...pkg,
          processedImage: imageUrl,
        };
      });

      return {
        category,
        packages: processedPackages,
        periodOptions: [
          { id: "all", label: "All Durations" },
          ...periods.map((p) => ({
            id: p.value,
            label: p.shortTitle || p.title,
          })),
        ],
      };
    } catch (error) {
      console.error("Error getting category page data:", error);
      return null;
    }
  },

  /**
   * Get data needed for a specific package detail page
   */
  async getPackageDetailPageData(categorySlug: string, packageSlug: string) {
    try {
      const [packageData, relatedPackages] = await Promise.all([
        packageService.getBySlug(packageSlug, categorySlug),
        packageService.getAll({ categorySlug, limit: 3 }),
      ]);

      if (!packageData) return null;

      // Filter out the current package from related packages
      const filteredRelated = relatedPackages
        .filter((pkg) => pkg.id !== packageData.id)
        .slice(0, 2); // Take only 2 related packages

      // Process package data to ensure all fields are properly formatted
      const processedPackageData = {
        ...packageData,
        // Process images
        images: Array.isArray(packageData.media?.images)
          ? packageData.media.images.map((img: any) => ({
              url: extractImageUrl(img.image),
              alt: img.alt || packageData.title,
              caption: img.caption,
            }))
          : [
              {
                url: "/images/placeholder.png",
                alt: packageData.title,
              },
            ],
      };

      // Process related packages
      const processedRelatedPackages = filteredRelated.map((pkg: any) => {
        let imageUrl = "/images/placeholder.png";

        // Extract image URL
        if (pkg.media?.images && pkg.media.images.length > 0) {
          imageUrl = extractImageUrl(pkg.media.images[0].image);
        } else if (pkg.media?.heroImage) {
          imageUrl = extractImageUrl(pkg.media.heroImage);
        }

        return {
          id: pkg.id,
          slug: pkg.slug,
          title: pkg.title,
          description:
            pkg.descriptions?.shortDescription || pkg.descriptions?.description,
          image: imageUrl,
          price: pkg.pricing?.price,
          duration:
            typeof pkg.coreInfo?.period === "string"
              ? pkg.coreInfo.period
              : pkg.coreInfo?.period?.shortTitle ||
                pkg.coreInfo?.period?.title ||
                "",
          location: pkg.coreInfo?.location || "Andaman",
          href: `/packages/${categorySlug}/${pkg.slug}`,
        };
      });

      return {
        packageData: processedPackageData,
        relatedPackages: processedRelatedPackages,
      };
    } catch (error) {
      console.error("Error getting package detail page data:", error);
      return null;
    }
  },

  /**
   * Get data needed for activity listing page
   */
  async getActivityPageData(
    filters: {
      category?: string;
      location?: string;
      limit?: number;
      page?: number;
    } = {}
  ) {
    try {
      const [categories, locations, searchResults, featuredActivities] =
        await Promise.all([
          activityCategoryService.getAll(),
          locationService.getActivityLocations(),
          activityService.search(filters),
          activityService.getFeatured(6),
        ]);

      return {
        categories: categories.map((cat) => ({
          id: cat.id,
          slug: cat.slug || cat.id,
          name: cat.name,
          description: cat.description,
        })),
        locations: locations.map((loc) => ({
          id: loc.id,
          slug: loc.slug || loc.id,
          name: loc.name,
          type: loc.type,
        })),
        activities: searchResults.activities,
        featuredActivities,
        totalCount: searchResults.totalCount,
        hasMore: searchResults.hasMore,
        filters: {
          categoryOptions: [
            { id: "all", label: "All Categories" },
            ...categories.map((cat) => ({
              id: cat.id,
              label: cat.name,
            })),
          ],
          locationOptions: [
            { id: "all", label: "All Locations" },
            ...locations.map((loc) => ({
              id: loc.id,
              label: loc.name,
            })),
          ],
        },
      };
    } catch (error) {
      console.error("Error getting activity page data:", error);
      return {
        categories: [],
        locations: [],
        activities: [],
        featuredActivities: [],
        totalCount: 0,
        hasMore: false,
        filters: {
          categoryOptions: [{ id: "all", label: "All Categories" }],
          locationOptions: [{ id: "all", label: "All Locations" }],
        },
      };
    }
  },
};

/**
 * Search Services
 * --------------
 * Global search functionality across all content types
 */

export const searchService = {
  /**
   * Global search across packages, activities, and pages
   */
  async globalSearch(
    query: string,
    options: {
      types?: ("packages" | "activities" | "pages")[];
      limit?: number;
    } = {}
  ) {
    const { types = ["packages", "activities", "pages"], limit = 20 } = options;

    try {
      const results: any = {
        packages: [],
        activities: [],
        pages: [],
        total: 0,
      };

      const searchPromises: Promise<any>[] = [];

      if (types.includes("packages")) {
        searchPromises.push(
          (async () => {
            const payload = await getCachedPayload();
            const { docs } = await payload.find({
              collection: "packages",
              where: {
                and: [
                  { "publishingSettings.status": { equals: "published" } },
                  {
                    or: [
                      { title: { contains: query } },
                      { "descriptions.description": { contains: query } },
                      { "descriptions.shortDescription": { contains: query } },
                    ],
                  },
                ],
              },
              limit: Math.ceil(limit / types.length),
              depth: 1,
            });
            results.packages = docs;
          })()
        );
      }

      if (types.includes("activities")) {
        searchPromises.push(
          (async () => {
            const payload = await getCachedPayload();
            const { docs } = await payload.find({
              collection: "activities",
              where: {
                and: [
                  { "status.isActive": { equals: true } },
                  {
                    or: [
                      { title: { contains: query } },
                      { "content.description": { contains: query } },
                      { "content.shortDescription": { contains: query } },
                    ],
                  },
                ],
              },
              limit: Math.ceil(limit / types.length),
              depth: 1,
            });
            results.activities = docs;
          })()
        );
      }

      if (types.includes("pages")) {
        searchPromises.push(
          (async () => {
            const payload = await getCachedPayload();
            const { docs } = await payload.find({
              collection: "pages",
              where: {
                and: [
                  { "publishingSettings.status": { equals: "published" } },
                  {
                    or: [
                      { title: { contains: query } },
                      { "content.description": { contains: query } },
                    ],
                  },
                ],
              },
              limit: Math.ceil(limit / types.length),
              depth: 1,
            });
            results.pages = docs;
          })()
        );
      }

      await Promise.all(searchPromises);

      results.total =
        results.packages.length +
        results.activities.length +
        results.pages.length;

      return results;
    } catch (error) {
      console.error("Error in global search:", error);
      return {
        packages: [],
        activities: [],
        pages: [],
        total: 0,
      };
    }
  },

  /**
   * Get search suggestions based on partial query
   */
  async getSearchSuggestions(query: string, limit: number = 10) {
    if (query.length < 2) return [];

    try {
      const payload = await getCachedPayload();

      // Get suggestions from packages
      const packageSuggestions = await payload.find({
        collection: "packages",
        where: {
          and: [
            { "publishingSettings.status": { equals: "published" } },
            { title: { contains: query } },
          ],
        },
        limit: Math.ceil(limit / 2),
        select: {
          title: true,
          slug: true,
        },
      });

      // Get suggestions from activities
      const activitySuggestions = await payload.find({
        collection: "activities",
        where: {
          and: [
            { "status.isActive": { equals: true } },
            { title: { contains: query } },
          ],
        },
        limit: Math.ceil(limit / 2),
        select: {
          title: true,
          slug: true,
        },
      });

      const suggestions = [
        ...packageSuggestions.docs.map((pkg) => ({
          title: pkg.title,
          type: "package",
          url: `/packages/${pkg.slug}`,
        })),
        ...activitySuggestions.docs.map((activity) => ({
          title: activity.title,
          type: "activity",
          url: `/activities/${activity.slug}`,
        })),
      ];

      return suggestions.slice(0, limit);
    } catch (error) {
      console.error("Error getting search suggestions:", error);
      return [];
    }
  },
};

// Legacy compatibility exports (maintain backwards compatibility)
export const getPageBySlug = pageService.getBySlug;
export const getAllPages = pageService.getAll;
export const getPackageCategories = packageCategoryService.getAll;
export const getPackageCategoryBySlug = packageCategoryService.getBySlug;
export const getPackagePeriods = packagePeriodService.getAll;
export const getPackages = packageService.getAll;
export const getFeaturedPackages = packageService.getFeatured;
export const getPackageBySlug = packageService.getBySlug;
export const getPackageById = packageService.getById;
// export const getPackagesPageData = pageDataService.getPackagesPageData;
export const getCategoryPageData = pageDataService.getCategoryPageData;
export const getPackageDetailPageData =
  pageDataService.getPackageDetailPageData;

// New exports for activities and other services
export const categoryService = activityCategoryService; // Maintain compatibility

//  getPackagesPageData() {
//   try {
//     const [categories, periods, featuredPackages] = await Promise.all([
//       packageCategoryService.getAll(),
//       packagePeriodService.getAll(),
//       packageService.getFeatured(3),
//     ]);

//     return {
//       packageOptions: categories.map((category) => ({
//         id: category.slug,
//         label: category.title?.replace(" Packages", "") || category.title,
//       })),

//       periodOptions: [
//         { id: "all", label: "All Durations" },
//         ...periods.map((period) => ({
//           id: period.value,
//           label: period.shortTitle || period.title,
//         })),
//       ],

//       packageCategoriesContent: categories.map((category: any) => {
//         // Ensure we have a valid media object structure for PackageCard
//         const media: {
//           heroImage: { image: any; alt: string } | null;
//           cardImages: Array<{ image: any; alt: string }>;
//         } = {
//           heroImage: null,
//           cardImages: [],
//         };

//         // Process heroImage if available
//         if (category.media?.heroImage) {
//           media.heroImage = {
//             image: category.media.heroImage.url || category.media.heroImage,
//             alt: category.media.heroImage.alt || `${category.title} hero image`,
//           };
//         }

//         // Process cardImages if available
//         if (
//           category.media?.cardImages &&
//           Array.isArray(category.media.cardImages)
//         ) {
//           media.cardImages = category.media.cardImages.map((img: any) => {
//             // Handle different image structures
//             const imageValue = img.image?.url
//               ? img.image.url
//               : typeof img.image === "string"
//               ? img.image
//               : img.image?.id || img.image;

//             return {
//               image: imageValue,
//               alt: img.alt || `${category.title} image`,
//             };
//           });
//         }
//         // If no cardImages but we have a heroImage, use that
//         else if (media.heroImage) {
//           media.cardImages = [
//             {
//               image: media.heroImage.image,
//               alt: media.heroImage.alt,
//             },
//           ];
//         }
//         // Fallback to ensure we always have at least one cardImage
//         if (!media.cardImages.length) {
//           media.cardImages = [
//             {
//               image: "/images/placeholder.png",
//               alt: `${category.title} image`,
//             },
//           ];
//         }

//         return {
//           id: category.id,
//           slug: category.slug,
//           title: category.title,
//           description: category.categoryDetails?.description || "",
//           media: media,
//           href: `/packages/${category.slug}`,
//         };
//       }),

//       featuredPackages: featuredPackages.map((pkg: any) => {
//         // Extract valid image URL from package media
//         let imageUrl = "/images/placeholder.png";

//         // Handle case where we have a media.images array
//         if (pkg.media?.images && pkg.media.images.length > 0) {
//           const firstImage = pkg.media.images[0].image;
//           imageUrl = extractImageUrl(firstImage);
//         }
//         // Handle case where we have a media.heroImage directly
//         else if (pkg.media?.heroImage) {
//           imageUrl = extractImageUrl(pkg.media.heroImage);
//         }

//         // Extract location name safely
//         let locationName = "Andaman"; // Default fallback
//         if (pkg.coreInfo?.location) {
//           // If location is populated (object with name)
//           if (
//             typeof pkg.coreInfo.location === "object" &&
//             pkg.coreInfo.location.name
//           ) {
//             locationName = pkg.coreInfo.location.name;
//           }
//           // If location is just an ID string, we might need to handle it differently
//           // For now, keep the default fallback
//         }

//         return {
//           id: pkg.id,
//           slug: pkg.slug,
//           title: pkg.title,
//           description:
//             pkg.descriptions?.shortDescription || pkg.descriptions?.description,
//           image: imageUrl,
//           price: pkg.pricing?.price,
//           duration:
//             typeof pkg.coreInfo?.period === "string"
//               ? pkg.coreInfo.period
//               : pkg.coreInfo?.period?.shortTitle ||
//                 pkg.coreInfo?.period?.title ||
//                 "",
//           location: locationName,
//         };
//       }),
//     };
//   } catch (error) {
//     console.error("Error getting packages page data:", error);
//     return {
//       packageOptions: [],
//       periodOptions: [{ id: "all", label: "All Durations" }],
//       packageCategoriesContent: [],
//       featuredPackages: [],
//     };
//   }
// }
