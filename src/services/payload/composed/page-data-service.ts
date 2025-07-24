import {
  activityCategoryService,
  activityService,
} from "../collections/activities";
import { locationService } from "../collections/locations";
import {
  packageCategoryService,
  packagePeriodService,
  packageService,
} from "../collections/packages";
import { extractImageUrl } from "../base/utils";

/**
 * Page Data Service
 * -----------------
 * Combines data from multiple services to create page-ready data structures
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
      query?: string;
    } = {}
  ) {
    try {
      const [categories, locations, searchResults, featuredActivities] =
        await Promise.all([
          activityCategoryService.getActive(),
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
