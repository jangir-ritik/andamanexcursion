// // services/api/activityTimeSlots.ts
// export interface ActivityTimeSlot {
//   id: string;
//   title: string;
//   startTime: string;
//   endTime: string;
//   displayTime: string;
//   duration: number;
//   activityTypes: Array<{
//     id: string;
//     name: string;
//     slug: string;
//   }>;
//   isActive: boolean;
//   sortOrder: number;
//   notes?: string;
// }

// const API_BASE =
//   process.env.NEXT_PUBLIC_API_URL ||
//   (typeof window !== "undefined" ? window.location.origin : "");

// export const activityTimeSlotApi = {
//   // Get all active activity time slots
//   async getAll(): Promise<ActivityTimeSlot[]> {
//     try {
//       const response = await fetch(
//         `${API_BASE}/api/activity-time-slots-filter`
//       );
//       if (!response.ok) throw new Error("Failed to fetch activity time slots");
//       const data = await response.json();
//       return data.success ? data.data : [];
//     } catch (error) {
//       console.error("Error fetching activity time slots:", error);
//       return [];
//     }
//   },

//   // Get time slots for specific activity category
//   async getForCategory(categorySlug: string): Promise<ActivityTimeSlot[]> {
//     try {
//       const response = await fetch(
//         `${API_BASE}/api/activity-time-slots-filter?categorySlug=${encodeURIComponent(
//           categorySlug
//         )}`
//       );
//       if (!response.ok)
//         throw new Error(
//           `Failed to fetch time slots for category ${categorySlug}`
//         );
//       const data = await response.json();
//       return data.success ? data.data : [];
//     } catch (error) {
//       console.error(
//         `Error fetching time slots for category ${categorySlug}:`,
//         error
//       );
//       return [];
//     }
//   },

//   // Get specific time slots by IDs
//   async getByIds(timeSlotIds: string[]): Promise<ActivityTimeSlot[]> {
//     if (!timeSlotIds.length) return [];

//     try {
//       const idsParam = timeSlotIds.join(",");
//       const response = await fetch(
//         `${API_BASE}/api/activity-time-slots-filter?timeSlotIds=${encodeURIComponent(
//           idsParam
//         )}`
//       );
//       if (!response.ok) throw new Error("Failed to fetch specific time slots");
//       const data = await response.json();
//       return data.success ? data.data : [];
//     } catch (error) {
//       console.error("Error fetching specific time slots:", error);
//       return [];
//     }
//   },

//   // Client-side utility to filter UI time slots based on activity time slots
//   filterUITimeSlots(
//     activityTimeSlots: ActivityTimeSlot[],
//     allUITimeSlots: Array<{
//       id: string;
//       value: string;
//       label: string;
//       time?: string;
//     }>
//   ): Array<{ id: string; value: string; label: string; time?: string }> {
//     if (!activityTimeSlots.length) return allUITimeSlots;

//     return allUITimeSlots.filter((uiSlot) => {
//       const slotTime = uiSlot.time || uiSlot.value.replace("-", ":");
//       return this.isTimeInSlots(slotTime, activityTimeSlots);
//     });
//   },

//   // Check if a time falls within any of the provided time slots
//   isTimeInSlots(time: string, timeSlots: ActivityTimeSlot[]): boolean {
//     const timeMinutes = this.timeToMinutes(time);

//     return timeSlots.some((slot) => {
//       const startMinutes = this.timeToMinutes(slot.startTime);
//       const endMinutes = this.timeToMinutes(slot.endTime);
//       return timeMinutes >= startMinutes && timeMinutes < endMinutes;
//     });
//   },

//   // Convert time string to minutes for comparison
//   timeToMinutes(timeStr: string): number {
//     const [hours, minutes] = timeStr.split(":").map(Number);
//     return hours * 60 + minutes;
//   },
// };
