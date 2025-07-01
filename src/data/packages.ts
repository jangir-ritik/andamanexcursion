export interface Package {
  id: string;
  title: string;
  description: string;
  category: "honeymoon" | "family" | "best";
  period: string; // e.g., "4-3" for 4 days 3 nights
  price: number;
  discountedPrice?: number;
  images: string[];
  features: string[];
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities: string[];
  }>;
  includes: string[];
  excludes: string[];
}

// Sample packages data
export const packages: Package[] = [
  // Honeymoon packages
  {
    id: "romantic-getaway",
    title: "Romantic Retreat",
    description:
      "Enjoy a magical 3-night, 4-day honeymoon in the Andaman Islands. Start with a night in lively Port Blair, then relax for two nights on the beautiful Swaraj Dweep (Havelock).e",
    category: "honeymoon",
    period: "4-3", // 4 days, 3 nights
    price: 1500,
    discountedPrice: 1500,
    images: [""],
    features: [
      "Private beach dinners",
      "Couple spa treatments",
      "Romantic sunset cruise",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival and Welcome",
        description: "Arrive at Port Blair and transfer to your luxury resort",
        activities: ["Airport pickup", "Welcome drinks", "Evening beach walk"],
      },
      {
        day: 2,
        title: "Island Exploration",
        description: "Explore the beautiful Havelock Island",
        activities: [
          "Ferry to Havelock",
          "Radhanagar Beach visit",
          "Candle-light dinner",
        ],
      },
      {
        day: 3,
        title: "Water Activities",
        description: "Enjoy various water activities together",
        activities: [
          "Snorkeling at Elephant Beach",
          "Glass bottom boat ride",
          "Couple massage",
        ],
      },
      {
        day: 4,
        title: "Departure",
        description: "Farewell to the beautiful islands",
        activities: ["Souvenir shopping", "Transfer to airport"],
      },
    ],
    includes: [
      "Accommodation",
      "Meals (Breakfast & Dinner)",
      "Transfers",
      "Sightseeing",
    ],
    excludes: ["Flights", "Personal expenses", "Optional activities"],
  },
  {
    id: "island-escapade",
    title: "Island Escapade for Two",
    description:
      "Discover secluded islands and pristine beaches with your partner",
    category: "honeymoon",
    period: "6-5", // 6 days, 5 nights
    price: 34999,
    discountedPrice: 32999,
    images: ["/images/packages/honeymoon/island-escapade.jpg"],
    features: [
      "Island hopping",
      "Private beach access",
      "Honeymoon photoshoot",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival at Port Blair",
        description: "Welcome to the Andaman Islands",
        activities: [
          "Airport transfer",
          "Hotel check-in",
          "Local market visit",
        ],
      },
      // More days would be added here
    ],
    includes: [
      "Luxury accommodation",
      "All meals",
      "Private transfers",
      "Guided tours",
    ],
    excludes: ["Flights", "Personal expenses", "Optional activities"],
  },

  // Family packages
  {
    id: "family-adventure",
    title: "Family Adventure Package",
    description:
      "Create lasting memories with the whole family on this exciting adventure",
    category: "family",
    period: "5-4", // 5 days, 4 nights
    price: 28999,
    discountedPrice: 26999,
    images: ["/images/packages/family/family-adventure.jpg"],
    features: ["Kid-friendly activities", "Family rooms", "Educational tours"],
    itinerary: [
      {
        day: 1,
        title: "Family Arrival",
        description: "Welcome to Andaman",
        activities: ["Airport pickup", "Welcome gifts for kids", "Beach games"],
      },
      // More days would be added here
    ],
    includes: [
      "Family accommodation",
      "Meals",
      "Kid-friendly activities",
      "All transfers",
    ],
    excludes: ["Flights", "Personal expenses", "Optional activities"],
  },

  // Best-seller packages
  {
    id: "andaman-explorer",
    title: "Andaman Explorer",
    description:
      "Our most popular package covering all the must-see destinations",
    category: "best",
    period: "7-6", // 7 days, 6 nights
    price: 39999,
    discountedPrice: 37999,
    images: ["/images/packages/best/andaman-explorer.jpg"],
    features: [
      "All major attractions",
      "Premium accommodations",
      "Experienced guides",
    ],
    itinerary: [
      {
        day: 1,
        title: "Begin Your Journey",
        description: "Arrive at Port Blair and start your adventure",
        activities: [
          "Airport transfer",
          "Cellular Jail visit",
          "Light & Sound show",
        ],
      },
      // More days would be added here
    ],
    includes: [
      "Premium accommodations",
      "All meals",
      "All transfers",
      "Entry tickets",
    ],
    excludes: ["Flights", "Personal expenses", "Optional activities"],
  },
];

// Helper functions
export const getPackagesByCategory = (category: string) => {
  return packages.filter((pkg) => pkg.category === category);
};

export const getPackageById = (id: string) => {
  return packages.find((pkg) => pkg.id === id);
};

export const getFilteredPackages = (category: string, period: string) => {
  return packages.filter(
    (pkg) =>
      (category === "all" || pkg.category === category) &&
      (period === "all" || pkg.period === period)
  );
};
