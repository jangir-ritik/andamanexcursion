import { getPayload } from "payload";
import { cache } from "react";
import config from "@payload-config";

/**
 * PayloadCMS API Layer
 * -------------------
 * This file contains methods for accessing CMS data through PayloadCMS.
 * All methods use the same pattern:
 * 1. Initialize PayloadCMS (cached)
 * 2. Query collections with appropriate filters
 * 3. Transform data into frontend-friendly format if needed
 * 4. Return results with proper error handling
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

/**
 * Page Methods
 * -----------
 * Methods for accessing general page content
 */

export async function getPageBySlug(slug: string) {
  try {
    const payload = await getCachedPayload();

    const { docs } = await payload.find({
      collection: "pages",
      where: {
        and: [
          { slug: { equals: slug } },
          { "publishingSettings.status": { equals: "published" } },
        ],
      },
      limit: 1,
      depth: 2,
    });

    return docs[0] || null;
  } catch (error) {
    console.error("Error getting page by slug:", slug, error);
    return null;
  }
}

export async function getAllPages() {
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
}

/**
 * Package Category Methods
 * -----------------------
 * Methods for accessing package categories
 */

export async function getPackageCategories() {
  try {
    const payload = await getCachedPayload();
    const { docs } = await payload.find({
      collection: "package-categories",
      where: {
        "displaySettings.isActive": {
          equals: true,
        },
      },
      sort: "displaySettings.order",
    });
    return docs;
  } catch (error) {
    console.error("Error getting package categories:", error);
    return [];
  }
}

export async function getPackageCategoryBySlug(slug: string) {
  try {
    const payload = await getCachedPayload();
    const { docs } = await payload.find({
      collection: "package-categories",
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          {
            "displaySettings.isActive": {
              equals: true,
            },
          },
        ],
      },
      limit: 1,
    });
    return docs[0] || null;
  } catch (error) {
    console.error("Error getting package category by slug:", error);
    return null;
  }
}

/**
 * Package Period Methods
 * --------------------
 * Methods for accessing package periods
 */

export async function getAllPackagePeriods() {
  try {
    const payload = await getCachedPayload();
    const { docs } = await payload.find({
      collection: "package-periods",
      where: {
        isActive: {
          equals: true,
        },
      },
      sort: "order",
    });
    return docs;
  } catch (error) {
    console.error("Error getting package periods:", error);
    return [];
  }
}

/**
 * Package Methods
 * --------------
 * Methods for accessing and filtering packages
 */

export async function getPackagesByCategory(categorySlug: string) {
  try {
    const payload = await getCachedPayload();

    // First get the category to get its ID
    const category = await getPackageCategoryBySlug(categorySlug);
    if (!category) return [];

    const { docs } = await payload.find({
      collection: "packages",
      where: {
        and: [
          // Using relationship value - this will match the ID of the category
          { "coreInfo.category": { equals: category.id } },
          { "publishingSettings.status": { equals: "published" } },
        ],
      },
      sort: "title",
      depth: 2,
    });

    return docs;
  } catch (error) {
    console.error("Error getting packages by category:", error);
    return [];
  }
}

export async function getPackageBySlug(slug: string) {
  try {
    const payload = await getCachedPayload();
    const { docs } = await payload.find({
      collection: "packages",
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          {
            "publishingSettings.status": {
              equals: "published",
            },
          },
        ],
      },
      limit: 1,
      depth: 2,
    });
    return docs[0] || null;
  } catch (error) {
    console.error("Error getting package by slug:", error);
    return null;
  }
}

export async function getFeaturedPackages(limit: number = 3) {
  try {
    const payload = await getCachedPayload();
    const { docs } = await payload.find({
      collection: "packages",
      where: {
        and: [
          { "featuredSettings.featured": { equals: true } },
          { "publishingSettings.status": { equals: "published" } },
        ],
      },
      sort: "featuredOrder",
      limit,
      depth: 1,
    });
    return docs;
  } catch (error) {
    console.error("Error getting featured packages:", error);
    return [];
  }
}

export async function getAllPackages(limit: number = 100) {
  try {
    const payload = await getCachedPayload();
    const { docs } = await payload.find({
      collection: "packages",
      where: {
        "publishingSettings.status": { equals: "published" },
      },
      sort: "title",
      limit,
    });
    return docs;
  } catch (error) {
    console.error("Error getting all packages:", error);
    return [];
  }
}

/**
 * Composite Methods
 * ----------------
 * Methods that combine multiple data sources
 */

export async function getPackagesPageData() {
  try {
    const [packageCategories, packagePeriods] = await Promise.all([
      getPackageCategories(),
      getAllPackagePeriods(),
    ]);

    // Create period options with "All" option first
    const periodOptions = [
      { id: "all", label: "All Durations" },
      ...packagePeriods.map((period) => ({
        id: period.value,
        label: period.shortTitle || period.title,
      })),
    ];

    // Create package options from categories
    const packageOptions = packageCategories.map((category) => ({
      id: category.slug, // Use slug as reliable ID
      label: category.title?.replace(" Packages", "") || category.title,
    }));

    const packageCategoriesContent = packageCategories.map((category) => ({
      id: category.id,
      slug: category.slug,
      title: category.title,
      description: category.categoryDetails?.description || "",
      media: category.media,
      heroImage: category.media?.heroImage,
      href: `/packages/${category.slug}`,
    }));

    return {
      packageOptions,
      periodOptions,
      packageCategoriesContent,
    };
  } catch (error) {
    console.error("Error getting packages page data:", error);
    // Return fallback options if API fails
    return {
      packageOptions: [{ id: "honeymoon", label: "Honeymoon" }],
      periodOptions: [{ id: "all", label: "All Durations" }],
      packageCategoriesContent: [],
    };
  }
}

/**
 * Advanced Filter Methods
 * ---------------------
 * Enhanced methods for complex filtering needs
 */

export async function getPackagesByFilters({
  categorySlug,
  period,
  featured,
  limit = 50,
}: {
  categorySlug?: string;
  period?: string;
  featured?: boolean;
  limit?: number;
}) {
  try {
    const payload = await getCachedPayload();

    const conditions: any[] = [
      { "publishingSettings.status": { equals: "published" } },
    ];

    if (categorySlug) {
      const category = await getPackageCategoryBySlug(categorySlug);
      if (category) {
        conditions.push({ "coreInfo.category": { equals: category.id } });
      }
    }

    if (period) {
      // With relationship fields, we need to query for packages where the period.value equals our filter
      // But since we're searching inside a relationship, we need to use payload's special format

      // First, find the period by value to get its ID
      const periodObj = await payload.find({
        collection: "package-periods",
        where: {
          value: { equals: period },
        },
        limit: 1,
      });

      if (periodObj.docs.length > 0) {
        // Use the ID of the period for filtering
        conditions.push({
          "coreInfo.period": { equals: periodObj.docs[0].id },
        });
      } else {
        console.warn(`Period ${period} not found in database`);
      }
    }

    if (featured !== undefined) {
      conditions.push({ "featuredSettings.featured": { equals: featured } });
    }

    console.log(
      "Fetching packages with conditions:",
      JSON.stringify(conditions)
    );

    const { docs } = await payload.find({
      collection: "packages",
      where: {
        and: conditions,
      },
      sort: featured ? "featuredOrder" : "title",
      limit,
      depth: 2, // Include related data
    });

    // Debug log first package if available
    if (docs.length > 0) {
      console.log(
        `Found ${docs.length} packages. First package period:`,
        docs[0]?.coreInfo?.period
      );
    } else {
      console.log("No packages found with conditions:", conditions);
    }

    return docs;
  } catch (error) {
    console.error("Error getting packages by filters:", error);
    return [];
  }
}

export async function getPackageWithCategory(packageSlug: string) {
  try {
    const payload = await getCachedPayload();
    const { docs } = await payload.find({
      collection: "packages",
      where: {
        and: [
          { slug: { equals: packageSlug } },
          { "publishingSettings.status": { equals: "published" } },
        ],
      },
      limit: 1,
      depth: 2, // This will populate the category relationship
    });
    return docs[0] || null;
  } catch (error) {
    console.error("Error getting package with category:", error);
    return null;
  }
}
