import { getPayload } from "payload";
import { cache } from "react";
import config from "@payload-config";
import {
  FRONTEND_CATEGORY_OPTIONS,
  FRONTEND_PERIOD_OPTIONS,
} from "@/shared/constants/package-options";

// Cache payload instance
export const getCachedPayload = cache(async () => {
  try {
    return await getPayload({ config });
  } catch (error) {
    console.error("Error initializing Payload:", error);
    throw error;
  }
});

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

// Package Category methods
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

export async function getPackageCategoryByCategoryId(categoryId: string) {
  try {
    const payload = await getCachedPayload();
    const { docs } = await payload.find({
      collection: "package-categories",
      where: {
        and: [
          {
            "categoryDetails.categoryId": {
              equals: categoryId,
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
    console.error("Error getting package category by category id:", error);
    return null;
  }
}

// Package methods
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
          { "coreInfo.category": { equals: category.id } }, // Use category ID, not slug
          { "publishingSettings.status": { equals: "published" } },
        ],
      },
      sort: "title",
    });
    return docs;
  } catch (error) {
    console.error("Error getting packages by category:", error);
    return [];
  }
}

export async function getFilteredPackages(
  categorySlug: string,
  period: string
) {
  try {
    const payload = await getCachedPayload();

    // Get category by slug first
    const category = await getPackageCategoryBySlug(categorySlug);
    if (!category) return [];

    const { docs } = await payload.find({
      collection: "packages",
      where: {
        and: [
          { "coreInfo.category": { equals: category.id } },
          { "coreInfo.period": { equals: period } },
          { "publishingSettings.status": { equals: "published" } },
        ],
      },
      sort: "title",
    });
    return docs;
  } catch (error) {
    console.error("Error getting filtered packages:", error);
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

export async function getPackagesPageData() {
  try {
    const [packageCategories] = await Promise.all([getPackageCategories()]);

    const periodOptions = FRONTEND_PERIOD_OPTIONS;
    const packageOptions = FRONTEND_CATEGORY_OPTIONS;

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
      packageOptions: FRONTEND_CATEGORY_OPTIONS,
      periodOptions: FRONTEND_PERIOD_OPTIONS,
      packageCategoriesContent,
    };
  } catch (error) {
    console.error("Error getting packages page data:", error);
    return {
      packageOptions: FRONTEND_CATEGORY_OPTIONS,
      periodOptions: FRONTEND_PERIOD_OPTIONS,
      packageCategoriesContent: [],
    };
  }
}

// ===== ENHANCED METHODS FOR BETTER UX =====
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
      conditions.push({ "coreInfo.period": { equals: period } });
    }

    if (featured !== undefined) {
      conditions.push({ "featuredSettings.featured": { equals: featured } });
    }

    const { docs } = await payload.find({
      collection: "packages",
      where: {
        and: conditions,
      },
      sort: featured ? "featuredOrder" : "title",
      limit,
      depth: 1,
    });

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
