import { Boat } from "@payload-types";

const API_BASE = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";

export const boatApi = {
  // Get all active boats
  async getActive(): Promise<Boat[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/boats?where[status.isActive][equals]=true&sort=status.priority&limit=100&depth=2`
      );
      if (!response.ok) throw new Error("Failed to fetch boats");
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching boats:", error);
      return [];
    }
  },

  // Get boats by route
  async getByRoute(routeId: string): Promise<Boat[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/boats?where[route][equals]=${routeId}&where[status.isActive][equals]=true&sort=status.priority&limit=100&depth=2`
      );
      if (!response.ok)
        throw new Error(`Failed to fetch boats for route ${routeId}`);
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error(`Error fetching boats for route ${routeId}:`, error);
      return [];
    }
  },

  // Get single boat by ID
  async getById(id: string): Promise<Boat | null> {
    try {
      const response = await fetch(`${API_BASE}/api/boats/${id}?depth=2`);
      if (!response.ok) throw new Error("Failed to fetch boat");
      return await response.json();
    } catch (error) {
      console.error("Error fetching boat:", error);
      return null;
    }
  },

  // Get featured boats
  async getFeatured(): Promise<Boat[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/boats?where[status.isFeatured][equals]=true&where[status.isActive][equals]=true&sort=status.priority&limit=10&depth=2`
      );
      if (!response.ok) throw new Error("Failed to fetch featured boats");
      const data = await response.json();
      return data.docs;
    } catch (error) {
      console.error("Error fetching featured boats:", error);
      return [];
    }
  },
};

// Export the direct function for server components
export const getActiveBoats = boatApi.getActive;
