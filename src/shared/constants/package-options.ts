export const PACKAGE_CATEGORIES = [
  { label: "Honeymoon", value: "honeymoon" },
  { label: "Family", value: "family" },
  { label: "Best Sellers", value: "best" },
];

export const PACKAGE_PERIODS = [
  { label: "3D 2N", value: "3-2" },
  { label: "4D 3N", value: "4-3" },
  { label: "5D 4N", value: "5-4" },
  { label: "6D 5N", value: "6-5" },
  { label: "7D 6N", value: "7-6" },
];

// For frontend usage with "All" option
export const FRONTEND_PERIOD_OPTIONS = [
  { id: "all", label: "All Durations" },
  ...PACKAGE_PERIODS.map((period) => ({
    id: period.value,
    label: period.label,
  })),
];

export const FRONTEND_CATEGORY_OPTIONS = [
  // { id: "all", label: "All Categories" },
  ...PACKAGE_CATEGORIES.map((category) => ({
    id: category.value,
    label: category.label,
  })),
];
