import { getCachedPayload } from "../base/client";

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
        select: { title: true, slug: true },
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
        select: { title: true, slug: true },
      });

      const suggestions = [
        ...packageSuggestions.docs.map((pkg: any) => ({
          title: pkg.title,
          type: "package",
          url: `/packages/${pkg.slug}`,
        })),
        ...activitySuggestions.docs.map((activity: any) => ({
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
