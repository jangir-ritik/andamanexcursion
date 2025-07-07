// Content for Header component

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
    label: "Special",
    href: "/special",
    children: [
      {
        label: "Sub Item 1",
        href: "/sub-item-1",
      },
      {
        label: "Sub Item 2",
        href: "/sub-item-2",
      },
      {
        label: "Sub Item 3",
        href: "/sub-item-3",
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
    href: "/get-in-touch",
    unique: true,
  },
];
