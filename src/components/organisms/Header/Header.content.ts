// Content for Header component

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
    label: "Destination",
    href: "/destination",
    children: [
      {
        label: "Sub Item 1",
        href: "/sub-item-1",
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
