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

// Base query builder for common filtering patterns
const buildBaseQuery = (additionalConditions: any[] = []) => ({
  and: [
    { "publishingSettings.status": { equals: "published" } },
    ...additionalConditions,
  ],
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
      where: buildBaseQuery([{ slug: { equals: slug } }]),
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
 */

export async function getPackageCategories() {
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
}

export async function getPackageCategoryBySlug(slug: string) {
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
}

/**
 * Package Period Methods
 * --------------------
 */

export async function getPackagePeriods() {
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
}

/**
 * Package Methods
 * --------------
 */

export async function getAllPackages(
  options: {
    categorySlug?: string;
    period?: string;
    featured?: boolean;
    limit?: number;
    depth?: number;
  } = {}
) {
  const { categorySlug, period, featured, limit = 100, depth = 2 } = options;

  try {
    const payload = await getCachedPayload();
    const conditions: any[] = [];

    // Handle category filtering
    if (categorySlug) {
      const category = await getPackageCategoryBySlug(categorySlug);
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
      // Try to find period by value first, then by id
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
}

export async function getFeaturedPackages(limit: number = 3) {
  return getAllPackages({ featured: true, limit });
}

export async function getPackageBySlug(slug: string, categorySlug?: string) {
  try {
    const payload = await getCachedPayload();
    const conditions: any[] = [{ slug: { equals: slug } }];

    // If category is provided, filter by it
    if (categorySlug) {
      const category = await getPackageCategoryBySlug(categorySlug);
      if (category) {
        conditions.push({
          "coreInfo.category": { equals: category.id },
        });
      }
    }

    const { docs } = await payload.find({
      collection: "packages",
      where: buildBaseQuery(conditions),
      limit: 1,
      depth: 3, // Deep fetch for package details
    });
    return docs[0] || null;
  } catch (error) {
    console.error("Error getting package by slug:", error);
    return null;
  }
}

/**
 * Composite Methods
 * ----------------
 */

export async function getPackagesPageData() {
  try {
    const [categories, periods] = await Promise.all([
      getPackageCategories(),
      getPackagePeriods(),
    ]);

    return {
      packageOptions: categories.map((category) => ({
        id: category.slug,
        label: category.title?.replace(" Packages", "") || category.title,
      })),

      periodOptions: [
        { id: "all", label: "All Durations" },
        ...periods.map((period) => ({
          id: period.value,
          label: period.shortTitle || period.title,
        })),
      ],

      packageCategoriesContent: categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        title: category.title,
        description: category.categoryDetails?.description || "",
        media: category.media,
        href: `/packages/${category.slug}`,
      })),
    };
  } catch (error) {
    console.error("Error getting packages page data:", error);
    return {
      packageOptions: [],
      periodOptions: [{ id: "all", label: "All Durations" }],
      packageCategoriesContent: [],
    };
  }
}

export async function getCategoryPageData(
  categorySlug: string,
  period?: string
) {
  try {
    const [category, periods, packages] = await Promise.all([
      getPackageCategoryBySlug(categorySlug),
      getPackagePeriods(),
      getAllPackages({ categorySlug, period }),
    ]);

    if (!category) return null;

    return {
      category,
      packages,
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
}
