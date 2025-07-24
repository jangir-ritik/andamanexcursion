import { activityCategoryService } from "../collections/activities";
import { locationService } from "../collections/locations";
import { timeSlotService } from "../collections/time-slots";

/**
 * Form Data Service
 * --------------------------
 * Combines data from multiple services to provide complete data for forms
 */

export const formDataService = {
  // Get all data needed for activity booking form
  async getActivityFormData() {
    try {
      const [categories, locations, timeSlots] = await Promise.all([
        activityCategoryService.getActive(),
        locationService.getActivityLocations(),
        timeSlotService.getForActivities(),
      ]);

      return {
        categories,
        locations,
        timeSlots,
      };
    } catch (error) {
      console.error("Error fetching activity form data:", error);
      return {
        categories: [],
        locations: [],
        timeSlots: [],
      };
    }
  },

  // Get all data needed for ferry booking form
  async getFerryFormData() {
    try {
      const [locations, timeSlots] = await Promise.all([
        locationService.getFerryPorts(),
        timeSlotService.getForFerries(),
      ]);

      return {
        locations,
        timeSlots,
      };
    } catch (error) {
      console.error("Error fetching ferry form data:", error);
      return {
        locations: [],
        timeSlots: [],
      };
    }
  },

  // Get all data needed for boat booking form
  async getBoatFormData() {
    try {
      const [locations, timeSlots] = await Promise.all([
        locationService.getBoatDepartures(),
        timeSlotService.getForBoats(),
      ]);

      return {
        locations,
        timeSlots,
      };
    } catch (error) {
      console.error("Error fetching boat form data:", error);
      return {
        locations: [],
        timeSlots: [],
      };
    }
  },

  // Get all data needed for package booking form
  async getPackageFormData() {
    try {
      const timeSlots = await timeSlotService.getForPackages();

      return {
        timeSlots,
      };
    } catch (error) {
      console.error("Error fetching package form data:", error);
      return {
        timeSlots: [],
      };
    }
  },
};
