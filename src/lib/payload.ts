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
 * 3. Return results with proper error handling
 * 4. Optionally transform data into frontend-friendly format
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

/**
 * Options for fetching packages
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

/**
 * Fetch packages based on provided filters
 */
export async function getPackages(options: PackageOptions = {}) {
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

    // Only include published packages
    conditions.push({ "publishingSettings.status": { equals: "published" } });

    const { docs } = await payload.find({
      collection: "packages",
      where: buildBaseQuery(conditions),
      sort: featured ? "featuredSettings.featuredOrder" : "title",
      limit,
      depth, // This will populate relationships like location, category, period
    });

    return docs;
  } catch (error) {
    console.error("Error getting packages:", error);
    return [];
  }
}

/**
 * Convenience methods that use getPackages with specific options
 */

export async function getFeaturedPackages(limit: number = 3) {
  return getPackages({ featured: true, limit });
}

export async function getPackageBySlug(slug: string, categorySlug?: string) {
  const options: PackageOptions = { slug, limit: 1, depth: 3 };
  if (categorySlug) {
    options.categorySlug = categorySlug;
  }
  const packages = await getPackages(options);
  return packages[0] || null;
}

export async function getPackageById(id: string) {
  const packages = await getPackages({ id, limit: 1, depth: 3 });
  return packages[0] || null;
}

/**
 * Page Data Methods
 * ----------------
 * Methods that combine multiple data sources to create page-ready data
 */

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
 * Get data needed for the packages list page
 */
export async function getPackagesPageData() {
  try {
    const [categories, periods, featuredPackages] = await Promise.all([
      getPackageCategories(),
      getPackagePeriods(),
      getFeaturedPackages(3),
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

      packageCategoriesContent: categories.map((category: any) => {
        // Ensure we have a valid media object structure for PackageCard
        const media: {
          heroImage: { image: any; alt: string } | null;
          cardImages: Array<{ image: any; alt: string }>;
        } = {
          heroImage: null,
          cardImages: [],
        };

        // Process heroImage if available
        if (category.media?.heroImage) {
          media.heroImage = {
            image: category.media.heroImage.url || category.media.heroImage,
            alt: category.media.heroImage.alt || `${category.title} hero image`,
          };
        }

        // Process cardImages if available
        if (
          category.media?.cardImages &&
          Array.isArray(category.media.cardImages)
        ) {
          media.cardImages = category.media.cardImages.map((img: any) => {
            // Handle different image structures
            const imageValue = img.image?.url
              ? img.image.url
              : typeof img.image === "string"
              ? img.image
              : img.image?.id || img.image;

            return {
              image: imageValue,
              alt: img.alt || `${category.title} image`,
            };
          });
        }
        // If no cardImages but we have a heroImage, use that
        else if (media.heroImage) {
          media.cardImages = [
            {
              image: media.heroImage.image,
              alt: media.heroImage.alt,
            },
          ];
        }
        // Fallback to ensure we always have at least one cardImage
        if (!media.cardImages.length) {
          media.cardImages = [
            {
              image: "/images/placeholder.png",
              alt: `${category.title} image`,
            },
          ];
        }

        return {
          id: category.id,
          slug: category.slug,
          title: category.title,
          description: category.categoryDetails?.description || "",
          media: media,
          href: `/packages/${category.slug}`,
        };
      }),

      featuredPackages: featuredPackages.map((pkg: any) => {
        // Extract valid image URL from package media
        let imageUrl = "/images/placeholder.png";

        // Handle case where we have a media.images array
        if (pkg.media?.images && pkg.media.images.length > 0) {
          const firstImage = pkg.media.images[0].image;
          imageUrl = extractImageUrl(firstImage);
        }
        // Handle case where we have a media.heroImage directly
        else if (pkg.media?.heroImage) {
          imageUrl = extractImageUrl(pkg.media.heroImage);
        }

        // Extract location name safely
        let locationName = "Andaman"; // Default fallback
        if (pkg.coreInfo?.location) {
          // If location is populated (object with name)
          if (
            typeof pkg.coreInfo.location === "object" &&
            pkg.coreInfo.location.name
          ) {
            locationName = pkg.coreInfo.location.name;
          }
          // If location is just an ID string, we might need to handle it differently
          // For now, keep the default fallback
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
          location: locationName,
        };
      }),
    };
  } catch (error) {
    console.error("Error getting packages page data:", error);
    return {
      packageOptions: [],
      periodOptions: [{ id: "all", label: "All Durations" }],
      packageCategoriesContent: [],
      featuredPackages: [],
    };
  }
}
/**
 * Get data needed for a specific category page
 */
export async function getCategoryPageData(
  categorySlug: string,
  period?: string
) {
  try {
    const [category, periods, packages] = await Promise.all([
      getPackageCategoryBySlug(categorySlug),
      getPackagePeriods(),
      getPackages({ categorySlug, period }),
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
}

/**
 * Get data needed for a specific package detail page
 */
export async function getPackageDetailPageData(
  categorySlug: string,
  packageSlug: string
) {
  try {
    const [packageData, relatedPackages] = await Promise.all([
      getPackageBySlug(packageSlug, categorySlug),
      getPackages({ categorySlug, limit: 3 }),
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
}
