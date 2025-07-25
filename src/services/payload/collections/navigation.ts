import { getCachedPayload } from "../base/client";
import { getPublishedQuery } from "../base/utils";

/**
 * Navigation Services
 * --------------------
 * Handle all the navigation data using payload local API
 */

export const navigationService = {
  /**
   * Get the main navigation configuration
   */
  async getMainNavigation() {
    try {
      const payload = await getCachedPayload();
      const result = await payload.findGlobal({
        slug: "navigation",
        depth: 2,
      });
      return result;
    } catch (error) {
      console.error("Error fetching navigation data:", error);
      return null;
    }
  },

  /**
   * Get active activity categories for navigation
   */
  async getActiveActivityCategories() {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "activity-categories",
        where: {
          and: [
            { isActive: { equals: true } },
            { parentCategory: { exists: false } }, // Only top-level categories
          ],
        },
        sort: "sortOrder",
        limit: 20,
        depth: 0, // We only need basic fields
      });
      return docs;
    } catch (error) {
      console.error("Error fetching activity categories:", error);
      return [];
    }
  },

  /**
   * Get active package categories for navigation
   */
  async getActivePackageCategories() {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "package-categories",
        where: {
          and: [
            { isActive: { equals: true } },
            { "displaySettings.isActive": { equals: true } },
          ],
        },
        sort: "displaySettings.order",
        limit: 20,
        depth: 0,
      });
      return docs;
    } catch (error) {
      console.error("Error fetching package categories:", error);
      return [];
    }
  },

  /**
   * Get active special categories for navigation (assuming similar structure)
   */
  // async getActiveSpecialCategories() {
  //   try {
  //     const payload = await getCachedPayload();
  //     const { docs } = await payload.find({
  //       collection: "special-categories", // Update with your actual collection slug
  //       where: { isActive: { equals: true } },
  //       sort: "order",
  //       limit: 20,
  //       depth: 0,
  //     });
  //     return docs;
  //   } catch (error) {
  //     console.error("Error fetching special categories:", error);
  //     return [];
  //   }
  // },
};

// Export individual category services for reuse
export const activityCategoryService = {
  async getAll() {
    return navigationService.getActiveActivityCategories();
  },

  async getBySlug(slug: string) {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "activity-categories",
        where: {
          and: [{ slug: { equals: slug } }, { isActive: { equals: true } }],
        },
        limit: 1,
        depth: 2,
      });
      return docs[0] || null;
    } catch (error) {
      console.error(`Error fetching activity category by slug ${slug}:`, error);
      return null;
    }
  },
};

export const packageCategoryService = {
  async getAll() {
    return navigationService.getActivePackageCategories();
  },

  async getBySlug(slug: string) {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "package-categories",
        where: {
          and: [
            { slug: { equals: slug } },
            { isActive: { equals: true } },
            { "displaySettings.isActive": { equals: true } },
          ],
        },
        limit: 1,
        depth: 2,
      });
      return docs[0] || null;
    } catch (error) {
      console.error(`Error fetching package category by slug ${slug}:`, error);
      return null;
    }
  },
};