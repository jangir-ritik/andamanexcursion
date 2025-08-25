// Script to seed initial boat route data into Payload CMS
// Run this with: node src/scripts/seed-boat-data.js

import payload from "payload";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const boatRoutesData = [
  {
    name: "Port Blair to Ross Island",
    slug: "port-blair-ross-island",
    description:
      "Explore the historical Ross Island with its British colonial ruins and beautiful beaches.",
    fromLocation: "port-blair", // This should match the slug of your location
    toLocation: "Ross Island",
    fare: 470,
    duration: "02 Hrs",
    availableTimings: [
      {
        departureTime: "09:00",
        displayTime: "9:00 AM",
      },
      {
        departureTime: "11:30",
        displayTime: "11:30 AM",
      },
      {
        departureTime: "12:30",
        displayTime: "12:30 PM",
      },
    ],
    metadata: {
      isRoundTrip: true,
      capacity: 50,
      highlights: [
        { highlight: "Historical British colonial ruins" },
        { highlight: "Beautiful beaches and scenic views" },
        { highlight: "Photography opportunities" },
      ],
    },
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Port Blair to Ross Island & North Bay Island",
    slug: "port-blair-ross-north-bay",
    description:
      "Combined trip to both Ross Island and North Bay Island. Experience history at Ross and underwater coral viewing at North Bay.",
    fromLocation: "port-blair", // This should match the slug of your location
    toLocation: "Ross Island & North Bay Island",
    fare: 870,
    duration: "01:30 hrs at Ross Island, 02:00 hrs at North Bay Island",
    availableTimings: [
      {
        departureTime: "09:00",
        displayTime: "9:00 AM",
      },
    ],
    metadata: {
      isRoundTrip: true,
      capacity: 50,
      highlights: [
        { highlight: "Visit two islands in one trip" },
        { highlight: "Historical Ross Island exploration" },
        { highlight: "Underwater coral viewing at North Bay" },
        { highlight: "Sea walking opportunities" },
      ],
    },
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Havelock Island to Elephant Beach",
    slug: "havelock-elephant-beach",
    description:
      "Visit the pristine Elephant Beach known for its crystal clear waters, coral reefs, and water sports activities.",
    fromLocation: "havelock-island", // This should match the slug of your location
    toLocation: "Elephant Beach",
    fare: 1000,
    duration: "02:30 hrs",
    availableTimings: [
      {
        departureTime: "09:00",
        displayTime: "9:00 AM",
      },
    ],
    metadata: {
      isRoundTrip: true,
      capacity: 50,
      highlights: [
        { highlight: "Crystal clear waters and coral reefs" },
        { highlight: "Water sports activities" },
        { highlight: "Snorkeling opportunities" },
        { highlight: "Pristine beach experience" },
      ],
    },
    isActive: true,
    sortOrder: 3,
  },
];

async function seedBoatRoutes() {
  try {
    // Initialize Payload
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      mongoURL: process.env.MONGODB_URI,
      local: true,
    });

    console.log("Seeding boat routes...");

    for (const routeData of boatRoutesData) {
      try {
        // Check if route already exists
        const existing = await payload.find({
          collection: "boat-routes",
          where: {
            slug: {
              equals: routeData.slug,
            },
          },
        });

        if (existing.docs.length > 0) {
          console.log(`Route ${routeData.name} already exists, skipping...`);
          continue;
        }

        // Create the boat route
        const result = await payload.create({
          collection: "boat-routes",
          data: routeData,
        });

        console.log(`✅ Created boat route: ${result.name}`);
      } catch (error) {
        console.error(
          `❌ Error creating route ${routeData.name}:`,
          error.message
        );
      }
    }

    console.log("✨ Boat route seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding
seedBoatRoutes();
