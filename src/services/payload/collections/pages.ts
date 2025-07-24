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
};
