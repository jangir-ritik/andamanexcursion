import { createSlugHook } from "@/utils/generateSlug";
import { CollectionConfig } from "payload";

const Boats: CollectionConfig = {
  slug: "boats",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "route", "capacity", "isActive"],
    group: "Boats",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "Name of the boat or service",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "URL-friendly version (auto-generated from name)",
        readOnly: true,
      },
    },

    // === ROUTE INFORMATION ===
    {
      name: "route",
      type: "relationship",
      relationTo: "boat-routes",
      required: true,
      admin: {
        description: "The route this boat operates on",
      },
    },

    // === BOAT DETAILS ===
    {
      name: "boatInfo",
      type: "group",
      fields: [
        {
          name: "description",
          type: "textarea",
          admin: {
            description: "Description of the boat and services",
          },
        },
        {
          name: "capacity",
          type: "number",
          required: true,
          admin: {
            description: "Maximum number of passengers",
          },
        },
        {
          name: "operator",
          type: "text",
          admin: {
            description: "Boat operator/company name",
          },
        },
        {
          name: "boatType",
          type: "select",
          options: [
            { label: "Speed Boat", value: "speed-boat" },
            { label: "Ferry", value: "ferry" },
            { label: "Catamaran", value: "catamaran" },
            { label: "Traditional Boat", value: "traditional" },
          ],
          admin: {
            description: "Type of boat",
          },
        },
      ],
    },

    // === AMENITIES ===
    {
      name: "amenities",
      type: "array",
      admin: {
        description: "Available amenities on the boat",
      },
      fields: [
        {
          name: "amenity",
          type: "select",
          options: [
            { label: "Life Jackets", value: "life-jackets" },
            { label: "Refreshments", value: "refreshments" },
            { label: "Toilet Facilities", value: "toilet" },
            { label: "Covered Seating", value: "covered-seating" },
            { label: "Open Deck", value: "open-deck" },
            { label: "Photography Service", value: "photography" },
            { label: "Guide Service", value: "guide" },
          ],
          required: true,
        },
      ],
    },

    // === PRICING ===
    {
      name: "pricing",
      type: "group",
      fields: [
        {
          name: "basePrice",
          type: "number",
          required: true,
          admin: {
            description: "Base price per person (from route data)",
          },
        },
        {
          name: "discountedPrice",
          type: "number",
          admin: {
            description: "Discounted price per person (optional)",
          },
        },
        {
          name: "childDiscount",
          type: "number",
          admin: {
            description: "Discount percentage for children",
          },
        },
      ],
    },

    // === IMAGES ===
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Main image for this boat",
        position: "sidebar",
      },
    },
    {
      name: "gallery",
      type: "array",
      admin: {
        description: "Additional images of the boat",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "caption",
          type: "text",
          admin: {
            description: "Optional caption for the image",
          },
        },
      ],
    },

    // === STATUS ===
    {
      name: "status",
      type: "group",
      admin: {
        description: "Status and visibility settings",
        position: "sidebar",
      },
      fields: [
        {
          name: "isActive",
          type: "checkbox",
          defaultValue: true,
          index: true,
        },
        {
          name: "isFeatured",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Show this boat in featured sections",
          },
        },
        {
          name: "priority",
          type: "number",
          defaultValue: 0,
          index: true,
          admin: {
            description: "Higher numbers appear first in listings",
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [createSlugHook("name", "slug")],
  },
};

export default Boats;
