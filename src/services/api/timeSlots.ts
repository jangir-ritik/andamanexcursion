// services/api/timeSlots.ts
import { TimeSlot } from "@payload-types";

const API_BASE = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";

export const timeSlotApi = {
  // Get all time slots
  async getAll(): Promise<TimeSlot[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/time-slots?sort=order&limit=100`
      );
      if (!response.ok) throw new Error("Failed to fetch time slots");
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching time slots:", error);
      return [];
    }
  },

  // Get time slots by type
  async getByType(type: string): Promise<TimeSlot[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/time-slots?where[type][equals]=${type}&sort=order&limit=100`
      );
      if (!response.ok) throw new Error(`Failed to fetch ${type} time slots`);
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error(`Error fetching ${type} time slots:`, error);
      return [];
    }
  },

  // Get activity time slots
  async getForActivities(): Promise<TimeSlot[]> {
    return this.getByType("activity");
  },

  // Get ferry time slots
  async getForFerries(): Promise<TimeSlot[]> {
    return this.getByType("ferry");
  },
};
