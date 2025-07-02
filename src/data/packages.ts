export interface Package {
  id: string;
  title: string;
  description: string;
  category: "honeymoon" | "family" | "best";
  period: string; // e.g., "4-3" for 4 days 3 nights
  price: number;
  discountedPrice?: number;
  images: string[];
  highlights: string[];
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
  }>;
  includes: string[];
  excludes: string[];
  location: string;
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
    location: "Havelock",
    period: "4-3", // 4 days, 3 nights
    price: 1500,
    discountedPrice: 1500,
    images: [
      "/images/packages/honeymoonRetreat/package1/image.png",
      "/images/packages/honeymoonRetreat/package1/heroImage.png",
    ],
    highlights: [
      "Private beach dinners",
      "Couple spa treatments",
      "Romantic sunset cruise",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival and Welcome",
        description: "Arrive at Port Blair and transfer to your luxury resort",
      },
      {
        day: 2,
        title: "Island Exploration",
        description: "Explore the beautiful Havelock Island",
      },
      {
        day: 3,
        title: "Water Activities",
        description: "Enjoy various water activities together",
      },
      {
        day: 4,
        title: "Departure",
        description: "Farewell to the beautiful islands",
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
    location: "Havelock",
    highlights: [
      "Island hopping",
      "Private beach access",
      "Honeymoon photoshoot",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival at Port Blair",
        description: "Welcome to the Andaman Islands",
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
  {
    id: "secluded-shores",
    title: "Secluded Shores",
    description:
      "Step into a world where time slows down. This 5-day, 4-night honeymoon is crafted for couples who crave privacy, intimacy, and untouched beauty. Explore the hidden corners of Neil Island and the soft, golden sands of Radhanagar Beach. Every detail, from ocean-view breakfasts to quiet kayak rides at sunrise, is tailored to deepen your connection and free you from the noise of the world. It's not about doing more, but feeling more — together.",
    category: "honeymoon",
    location: "Neil & Havelock",
    period: "5-4",
    price: 1900,
    discountedPrice: 1700,
    images: [
      "/images/packages/honeymoonRetreat/package1/image.png",
      "/images/packages/honeymoonRetreat/package1/heroImage.png",
    ],
    highlights: [
      "Oceanfront candle-lit dinner",
      "Sunrise kayaking for two",
      "Couple's photography session on hidden beaches",
    ],
    itinerary: [
      {
        day: 1,
        title: "Private Arrival",
        description: "Arrive in Port Blair and check in to your boutique stay",
      },
      {
        day: 2,
        title: "Neil Island Escape",
        description:
          "Travel to the serene Neil Island and settle into a quiet beachside resort",
      },
      {
        day: 3,
        title: "Untouched Beauty",
        description:
          "Wake early for a peaceful kayak ride followed by a spa session",
      },
      {
        day: 4,
        title: "Havelock Indulgence",
        description: "Spend the day at Radhanagar Beach",
      },
      {
        day: 5,
        title: "Goodbye for Now",
        description: "Return to Port Blair and fly back with lifelong memories",
      },
    ],
    includes: [
      "Accommodation in premium beach resorts",
      "All meals (Breakfast, Dinner)",
      "Ferry tickets & private transfers",
      "Kayaking & spa",
    ],
    excludes: ["Flights", "Lunches", "Optional excursions"],
  },
  {
    id: "tropical-bliss",
    title: "Tropical Bliss",
    description:
      "A dreamy 4-day honeymoon designed for couples who want to mix comfort with a touch of tropical adventure. From private candle-lit dinners to reef snorkeling, this package is ideal for newlyweds who want to relax but also create unforgettable experiences together in Andaman's vibrant waters and golden sunsets.",
    category: "honeymoon",
    location: "Port Blair & Havelock",
    period: "4-3",
    price: 1600,
    discountedPrice: 1450,
    images: [
      "/images/packages/honeymoonRetreat/package1/image.png",
      "/images/packages/honeymoonRetreat/package1/heroImage.png",
    ],
    highlights: [
      "Couple snorkeling with guide",
      "Floating breakfast",
      "Sunset cruise with live acoustic music",
    ],
    itinerary: [
      {
        day: 1,
        title: "Island Welcome",
        description:
          "Arrive in Port Blair and unwind at your resort with drinks and dinner",
      },
      {
        day: 2,
        title: "Adventurous Waters",
        description: "Head to Havelock for underwater exploration",
      },
      {
        day: 3,
        title: "Golden Hour Romance",
        description:
          "Relax through the day and end with a romantic sunset cruise",
      },
      {
        day: 4,
        title: "Departure",
        description: "Wrap up the journey and transfer back to the airport",
      },
    ],
    includes: [
      "Luxury resort stay",
      "Breakfast & Dinner",
      "Snorkeling equipment & guide",
      "Transfers & ferry tickets",
    ],
    excludes: ["Flights", "Lunch", "Alcoholic beverages"],
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
    location: "Andaman",
    discountedPrice: 26999,
    images: ["/images/packages/family/family-adventure.jpg"],
    highlights: [
      "Kid-friendly activities",
      "Family rooms",
      "Educational tours",
    ],
    itinerary: [
      {
        day: 1,
        title: "Family Arrival",
        description: "Welcome to Andaman",
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
  {
    id: "family-escape",
    title: "Andaman Family Escape",
    description:
      "A relaxed and fun-filled 4-day getaway designed for families of all ages. Stay in family-friendly resorts in Port Blair and Havelock, with curated activities that engage kids and adults alike. From beach games to shallow snorkeling and island picnics, every day is crafted to balance downtime with discovery.",
    category: "family",
    location: "Port Blair & Havelock",
    period: "4-3",
    price: 1400,
    discountedPrice: 1250,
    images: [
      "/images/packages/honeymoonRetreat/package1/image.png",
      "/images/packages/honeymoonRetreat/package1/heroImage.png",
    ],
    highlights: [
      "Family beach games",
      "Kid-friendly snorkeling",
      "Island picnics with local cuisine",
    ],
    itinerary: [
      {
        day: 1,
        title: "Warm Welcome",
        description:
          "Arrive in Port Blair and enjoy a comfortable family check-in followed by light sightseeing",
      },
      {
        day: 2,
        title: "Havelock Island",
        description: "Explore Havelock with easy-paced activities for everyone",
      },
      {
        day: 3,
        title: "Marine Fun",
        description:
          "Explore underwater life in a safe and guided environment suitable for all ages",
      },
      {
        day: 4,
        title: "Wrap-up & Return",
        description: "Return to Port Blair and end with some local shopping",
      },
    ],
    includes: [
      "Accommodation in family rooms",
      "Breakfast & Dinner",
      "Ferry tickets",
      "Sightseeing transfers",
    ],
    excludes: ["Flights", "Lunch", "Extra adventure activities"],
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
    location: "Andaman",
    highlights: [
      "All major attractions",
      "Premium accommodations",
      "Experienced guides",
    ],
    itinerary: [
      {
        day: 1,
        title: "Begin Your Journey",
        description: "Arrive at Port Blair and start your adventure",
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
  {
    id: "island-explorer",
    title: "Island Explorer",
    description:
      "Perfect for adventurers and nature lovers, this 5-day, 4-night trip takes you deep into the heart of Andaman. Split your time between the bustling Port Blair and the unspoiled serenity of Neil Island. Hike through dense tropical forests, relax on lesser-known beaches, and snorkel around coral gardens. Whether you're chasing sunsets or seeking underwater life, this journey promises a balance of thrill and tranquility.",
    category: "best",
    location: "Neil Island",
    period: "5-4",
    price: 1800,
    discountedPrice: 1650,
    images: [
      "/images/packages/honeymoonRetreat/package1/image.png",
      "/images/packages/honeymoonRetreat/package1/heroImage.png",
    ],
    highlights: [
      "Jungle treks & nature walks",
      "Snorkeling & marine life tours",
      "Sunset at Natural Bridge",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Port Blair",
        description: "Check in, local exploration, and orientation",
      },
      {
        day: 2,
        title: "To Neil Island",
        description: "Ferry to Neil Island and exploration of secluded beaches",
      },
      {
        day: 3,
        title: "Marine Life Experience",
        description:
          "Explore coral gardens and marine biodiversity in their natural habitat",
      },
      {
        day: 4,
        title: "Hiking & Hidden Coves",
        description: "Trek through forest trails and swim in secret lagoons",
      },
      {
        day: 5,
        title: "Departure",
        description: "Return to Port Blair and farewell to the islands",
      },
    ],
    includes: [
      "Accommodation",
      "Breakfast",
      "All inter-island transfers",
      "Entry tickets to attractions",
    ],
    excludes: [
      "Lunch & Dinner",
      "Flights",
      "Personal shopping",
      "Optional tours",
    ],
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
