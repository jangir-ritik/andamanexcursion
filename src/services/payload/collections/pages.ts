import { getCachedPayload } from "../base/client";
import { getPublishedQuery } from "../base/utils";

/**
 * Page Services
 * -------------
 * Handle all page-related operations
 */

export const pageService = {
  async getBySlug(slug: string) {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "pages",
        where: getPublishedQuery("pages", [{ slug: { equals: slug } }]),
        limit: 1,
        depth: 2,
      });
      return docs[0] || null;
    } catch (error) {
      console.error(`Error fetching page by slug ${slug}:`, error);
      return null;
    }
  },

  async getAll() {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "pages",
        where: getPublishedQuery("pages"),
        sort: "title",
      });
      return docs;
    } catch (error) {
      console.error("Error fetching all pages:", error);
      return [];
    }
  },

  async getById(id: string) {
    try {
      const payload = await getCachedPayload();
      const result = await payload.findByID({
        collection: "pages",
        id,
        depth: 2,
      });
      return result;
    } catch (error) {
      console.error("Error getting page by ID:", id, error);
      return null;
    }
  },

  async getByIds(ids: string[]) {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "pages",
        where: getPublishedQuery("pages", [{ id: { in: ids } }]),
        depth: 2,
      });
      return docs;
    } catch (error) {
      console.error("Error getting pages by IDs:", ids, error);
      return [];
    }
  },

  /**
   * Get main destination by main category slug
   */
  async getMainDestinationBySlug(mainCategorySlug: string) {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "pages",
        where: getPublishedQuery("pages", [
          { "basicInfo.pageType": { equals: "destinations" } },
          { "destinationInfo.destinationType": { equals: "main" } },
          { "destinationInfo.mainCategorySlug": { equals: mainCategorySlug } },
        ]),
        limit: 1,
        depth: 2,
      });
      return docs[0] || null;
    } catch (error) {
      console.error(
        `Error fetching main destination by slug ${mainCategorySlug}:`,
        error
      );
      return null;
    }
  },

  /**
   * Get sub-destination by main category slug and subcategory slug
   */
  async getSubDestinationBySlug(
    mainCategorySlug: string,
    subcategorySlug: string
  ) {
    try {
      const payload = await getCachedPayload();

      // First find the main destination to get its ID
      const mainDestination = await this.getMainDestinationBySlug(
        mainCategorySlug
      );
      if (!mainDestination) {
        return null;
      }

      // Then find the sub-destination that belongs to this main destination
      const { docs } = await payload.find({
        collection: "pages",
        where: getPublishedQuery("pages", [
          { "basicInfo.pageType": { equals: "destinations" } },
          { "destinationInfo.destinationType": { equals: "sub" } },
          {
            "destinationInfo.parentMainCategory": {
              equals: mainDestination.id,
            },
          },
          { "destinationInfo.subcategorySlug": { equals: subcategorySlug } },
        ]),
        limit: 1,
        depth: 2,
      });
      return docs[0] || null;
    } catch (error) {
      console.error(
        `Error fetching sub-destination by slugs ${mainCategorySlug}/${subcategorySlug}:`,
        error
      );
      return null;
    }
  },

  /**
   * Get all destinations for navigation generation
   */
  async getDestinationsForNavigation() {
    try {
      const payload = await getCachedPayload();
      const { docs } = await payload.find({
        collection: "pages",
        where: {
          and: [
            // Get published pages OR pages with no status set (for backward compatibility)
            {
              or: [
                { "publishingSettings.status": { equals: "published" } },
                { "publishingSettings.status": { exists: false } },
              ],
            },
            { "basicInfo.pageType": { equals: "destinations" } },
            // Make showInNavigation optional - default to true if not set
            {
              or: [
                {
                  "destinationInfo.navigationSettings.showInNavigation": {
                    equals: true,
                  },
                },
                {
                  "destinationInfo.navigationSettings.showInNavigation": {
                    exists: false,
                  },
                },
              ],
            },
          ],
        },
        sort: [
          "destinationInfo.destinationType",
          "destinationInfo.navigationSettings.navigationOrder",
          "title",
        ],
        depth: 2,
        limit: 100, // Ensure we get all destinations
      });

      // Group destinations by type (main vs sub)
      const mainDestinations = docs.filter(
        (doc: any) => doc.destinationInfo?.destinationType === "main"
      );
      const subDestinations = docs.filter(
        (doc: any) => doc.destinationInfo?.destinationType === "sub"
      );

      console.log(
        "🔍 DEBUG: PageService - getDestinationsForNavigation result:",
        {
          totalDocs: docs.length,
          mainCount: mainDestinations.length,
          subCount: subDestinations.length,
          mainTitles: mainDestinations.map((m: any) => ({
            id: m.id,
            title: m.title,
            mainCategorySlug: m.destinationInfo?.mainCategorySlug,
            showInNav: m.destinationInfo?.navigationSettings?.showInNavigation,
            navOrder: m.destinationInfo?.navigationSettings?.navigationOrder,
          })),
          subDetails: subDestinations.map((s: any) => ({
            id: s.id,
            title: s.title,
            subcategorySlug: s.destinationInfo?.subcategorySlug,
            parentMainCategory: s.destinationInfo?.parentMainCategory,
            parentType: typeof s.destinationInfo?.parentMainCategory,
            showInNav: s.destinationInfo?.navigationSettings?.showInNavigation,
            navOrder: s.destinationInfo?.navigationSettings?.navigationOrder,
          })),
        }
      );

      return {
        main: mainDestinations,
        sub: subDestinations,
        all: docs,
      };
    } catch (error) {
      console.error("Error fetching destinations for navigation:", error);
      return { main: [], sub: [], all: [] };
    }
  },
};
