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
      sort: "timing.startTime",
    });
    return result.docs;
  },

  // Get time slots by type
  async getByType(
    type: "ferry" | "boat" | "activity" | "package" | "general"
  ): Promise<TimeSlot[]> {
    const result = await queryCollection<TimeSlot>("time-slots", {
      where: {
        "availability.type": { equals: type },
        "status.isActive": { equals: true },
      },
      sort: "timing.startTime",
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
      sort: "timing.startTime",
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
      whereClause["availability.type"] = { equals: type };
    }

    const result = await queryCollection<TimeSlot>("time-slots", {
      where: whereClause,
      sort: "-status.priority",
    });
    return result.docs;
  },

  // // Get time slots available on a specific date
  // async getAvailableOnDate(date: string, type?: string): Promise<TimeSlot[]> {
  //   if (!isValidDate(date)) {
  //     console.error("Invalid date provided:", date);
  //     return [];
  //   }

  //   const whereClause: any = {
  //     "status.isActive": { equals: true },
  //   };

  //   if (type) {
  //     whereClause["availability.type"] = { equals: type };
  //   }

  //   const result = await queryCollection<TimeSlot>("time-slots", {
  //     where: whereClause,
  //     sort: "timing.startTime",
  //   });

  //   // Filter by date and day of week on the server side
  //   const dayOfWeek = getDayOfWeek(date);

  //   const filteredSlots = result.docs.filter((slot: TimeSlot) => {
  //     // Check if slot is available on this day of week
  //     if (
  //       slot.availability?.daysOfWeek &&
  //       slot.availability.daysOfWeek.length > 0
  //     ) {
  //       if (!slot.availability?.daysOfWeek.includes(dayOfWeek as any)) {
  //         return false;
  //       }
  //     }

  //     // Check seasonal availability
  //     if (slot.availability.seasonalAvailability) {
  //       const { availableFrom, availableTo } =
  //         slot.availability.seasonalAvailability;
  //       const checkDate = new Date(date);

  //       if (availableFrom && checkDate < new Date(availableFrom)) {
  //         return false;
  //       }

  //       if (availableTo && checkDate > new Date(availableTo)) {
  //         return false;
  //       }
  //     }

  //     return true;
  //   });

  //   return filteredSlots;
  // },

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
        sort: "timing.startTime",
      });
      return result.docs as TimeSlot[];
    } catch (error) {
      console.error("Error getting time slots by IDs:", ids, error);
      return [];
    }
  },

  // Check if a time slot is available for booking
  // async checkAvailability(
  //   slotId: string,
  //   date: string,
  //   passengers: number
  // ): Promise<{
  //   available: boolean;
  //   reason?: string;
  //   alternatives?: TimeSlot[];
  // }> {
  //   try {
  //     if (!isValidDate(date)) {
  //       return {
  //         available: false,
  //         reason: "Invalid date provided",
  //       };
  //     }

  //     const slot = await this.getById(slotId);

  //     if (!slot || !slot.status.isActive) {
  //       return {
  //         available: false,
  //         reason: "Time slot is currently inactive",
  //       };
  //     }

  //     // Check capacity limits
  //     if (
  //       slot.capacity?.maxPassengers &&
  //       passengers > slot.capacity.maxPassengers
  //     ) {
  //       return {
  //         available: false,
  //         reason: `Maximum ${slot.capacity.maxPassengers} passengers allowed`,
  //       };
  //     }

  //     // Check minimum passengers
  //     if (
  //       slot.capacity?.minPassengers &&
  //       passengers < slot.capacity.minPassengers
  //     ) {
  //       return {
  //         available: false,
  //         reason: `Minimum ${slot.capacity.minPassengers} passengers required`,
  //       };
  //     }

  //     // Check day of week availability
  //     const dayOfWeek = getDayOfWeek(date);
  //     if (
  //       slot.availability.daysOfWeek &&
  //       slot.availability.daysOfWeek.length > 0
  //     ) {
  //       if (!slot.availability.daysOfWeek.includes(dayOfWeek as any)) {
  //         return {
  //           available: false,
  //           reason: "Not available on this day",
  //           alternatives: slot.weather?.alternativeSlots || [],
  //         };
  //       }
  //     }

  //     // Check seasonal availability
  //     if (slot.availability.seasonalAvailability) {
  //       const { availableFrom, availableTo } =
  //         slot.availability.seasonalAvailability;
  //       const checkDate = new Date(date);

  //       if (availableFrom && checkDate < new Date(availableFrom)) {
  //         return {
  //           available: false,
  //           reason: `Available from ${new Date(
  //             availableFrom
  //           ).toLocaleDateString()}`,
  //         };
  //       }

  //       if (availableTo && checkDate > new Date(availableTo)) {
  //         return {
  //           available: false,
  //           reason: `Available until ${new Date(
  //             availableTo
  //           ).toLocaleDateString()}`,
  //         };
  //       }
  //     }

  //     return { available: true };
  //   } catch (error) {
  //     console.error("Error checking time slot availability:", error);
  //     return {
  //       available: false,
  //       reason: "Unable to check availability",
  //     };
  //   }
  // },

  // Get time slots grouped by category
  // async getGroupedByCategory(
  //   type?: string
  // ): Promise<Record<string, TimeSlot[]>> {
  //   const slots = type
  //     ? await this.getByType(type as any)
  //     : await this.getAll();

  //   const grouped = slots.reduce((acc, slot) => {
  //     const category = slot.display?.category || "general";
  //     if (!acc[category]) {
  //       acc[category] = [];
  //     }
  //     acc[category].push(slot);
  //     return acc;
  //   }, {} as Record<string, TimeSlot[]>);

  //   return grouped;
  // },

  // Get time slots grouped by time of day
  // async getGroupedByTimeOfDay(type?: string): Promise<{
  //   morning: TimeSlot[];
  //   afternoon: TimeSlot[];
  //   evening: TimeSlot[];
  //   night: TimeSlot[];
  // }> {
  //   const slots = type
  //     ? await this.getByType(type as any)
  //     : await this.getAll();

  //   const grouped = {
  //     morning: [] as TimeSlot[],
  //     afternoon: [] as TimeSlot[],
  //     evening: [] as TimeSlot[],
  //     night: [] as TimeSlot[],
  //   };

  //   slots.forEach((slot) => {
  //     if (!slot.timing?.startTime) return;

  //     const hour = parseInt(slot.timing.startTime.split(":")[0]);

  //     if (hour >= 5 && hour < 12) {
  //       grouped.morning.push(slot);
  //     } else if (hour >= 12 && hour < 17) {
  //       grouped.afternoon.push(slot);
  //     } else if (hour >= 17 && hour < 21) {
  //       grouped.evening.push(slot);
  //     } else {
  //       grouped.night.push(slot);
  //     }
  //   });

  //   return grouped;
  // },

  // Get available time slots for a specific activity/package
  // async getForItem(
  //   itemType: "activity" | "package",
  //   itemId: string,
  //   date?: string
  // ): Promise<TimeSlot[]> {
  //   try {
  //     // Get time slots of the appropriate type
  //     const slots = await this.getByType(itemType);

  //     // If no date provided, return all slots for this type
  //     if (!date) {
  //       return slots;
  //     }

  //     // Filter by date availability
  //     return this.getAvailableOnDate(date, itemType);
  //   } catch (error) {
  //     console.error(
  //       `Error getting time slots for ${itemType} ${itemId}:`,
  //       error
  //     );
  //     return [];
  //   }
  // },

  // Get next available slots for a specific type
  // async getNextAvailable(type: string, limit: number = 5): Promise<TimeSlot[]> {
  //   const today = new Date().toISOString().split("T")[0];

  //   try {
  //     const availableSlots = await this.getAvailableOnDate(today, type);
  //     return availableSlots.slice(0, limit);
  //   } catch (error) {
  //     console.error(`Error getting next available slots for ${type}:`, error);
  //     return [];
  //   }
  // },
};
