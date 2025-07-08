import { ACTIVITIES } from "@/data/activities";

// ferry, boat, activities(sub), packages(sub), special(sub), live volcanos, fishing, destination(sub), plan your trip, get in touch

export const navItems = [
  {
    label: "Ferry",
    href: "/ferry",
  },
  {
    label: "Boat",
    href: "/boat",
  },
  {
    label: "Activities",
    href: "/activities",
    isClickable: true,
    children: ACTIVITIES.map((activity) => ({
      label: activity.name,
      href: `/activities/booking?activity=${activity.id}`,
    })),
  },
  {
    label: "Packages",
    href: "/packages",
    isClickable: true,
    children: [
      {
        label: "Honeymoon Retreat",
        href: "/packages/honeymoon-retreat",
      },
      {
        label: "Best Sellers",
        href: "/packages/best-sellers",
      },
      {
        label: "Family Tours",
        href: "/packages/family-tours",
      },
    ],
  },
  {
    label: "Specials",
    href: "/specials",
    isClickable: true,
    children: [
      {
        label: "Engagement",
        href: "/specials/engagement",
      },
      {
        label: "Marriage",
        href: "/specials/marriage",
      },
      {
        label: "Honeymoon",
        href: "/specials/honeymoon",
      },
    ],
  },
  {
    label: "Live Volcanos",
    href: "/live-volcanos",
  },
  {
    label: "Fishing",
    href: "/fishing",
  },
  {
    label: "Destinations",
    href: "/destinations",
    isClickable: true,
    children: [
      {
        label: "Jolly Buoy",
        href: "/destinations/jolly-buoy",
      },
      {
        label: "Turtle Island",
        href: "/destinations/turtle-island-island",
      },
      {
        label: "Makokou",
        href: "/destinations/makokou",
      },
    ],
  },
  {
    label: "Plan Your Trip",
    href: "/plan-your-trip",
  },
  {
    label: "Get in Touch",
    href: "/contact",
    unique: true,
  },
];
