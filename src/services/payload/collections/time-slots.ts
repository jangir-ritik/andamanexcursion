import { TimeSlot } from "@payload-types";
import { getCachedPayload } from "../base/client";
import { queryCollection } from "../base/queries";
import { getDayOfWeek, isValidDate } from "../base/utils";

/**
 * Time Slot Services
 * -----------------
 * Handle all time slot-related operations
 */

export const timeSlotService = {
  async getAll(): Promise<TimeSlot[]> {
    const result = await queryCollection<TimeSlot>("time-slots", {
      where: {
        "status.isActive": { equals: true },
      },
      sort: "startTime",
    });
    return result.docs;
  },

  // Get time slots by type
  async getByType(
    type: "ferry" | "boat" | "activity" | "package" | "general"
  ): Promise<TimeSlot[]> {
    const result = await queryCollection<TimeSlot>("time-slots", {
      where: {
        type: { equals: type },
        "status.isActive": { equals: true },
      },
      sort: "startTime",
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

  // Get time slots for packages
  async getForPackages(): Promise<TimeSlot[]> {
    return this.getByType("package");
  },

  // Get time slots by category (morning, afternoon, etc.)
  async getByCategory(category: string): Promise<TimeSlot[]> {
    const result = await queryCollection<TimeSlot>("time-slots", {
      where: {
        "display.category": { equals: category },
        "status.isActive": { equals: true },
      },
      sort: "startTime",
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
      whereClause["type"] = { equals: type };
    }

    const result = await queryCollection<TimeSlot>("time-slots", {
      where: whereClause,
      sort: "startTime",
    });
    return result.docs;
  },

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

  // Get time slots by multiple IDs
  async getByIds(ids: string[]): Promise<TimeSlot[]> {
    try {
      const payload = await getCachedPayload();
      const result = await payload.find({
        collection: "time-slots",
        where: {
          and: [{ id: { in: ids } }, { "status.isActive": { equals: true } }],
        },
        sort: "startTime",
      });
      return result.docs as TimeSlot[];
    } catch (error) {
      console.error("Error getting time slots by IDs:", ids, error);
      return [];
    }
  },
};
