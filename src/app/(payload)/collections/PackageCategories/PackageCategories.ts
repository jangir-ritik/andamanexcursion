import { PACKAGE_CATEGORIES } from "@/shared/constants/package-options";
import { CollectionConfig } from "payload";

const PackageCategories: CollectionConfig = {
  slug: "package-categories",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "order", "isActive"],
    description: "Manage package category information displayed on the website",
  },
  access: {
    read: () => true,
  },
  fields: [
    // Core Information
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description:
          'Display title for the category (e.g., "Honeymoon Packages")',
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      admin: {
        description: 'URL slug (e.g., "honeymoon-retreat")',
      },
    },
    // Category Details
    {
      type: "group",
      name: "categoryDetails",
      fields: [
        {
          name: "categoryId",
          type: "select",
          required: true,
          unique: true,
          options: PACKAGE_CATEGORIES,
          admin: {
            description:
              "Internal category ID (must match package category field)",
          },
        },
        {
          name: "description",
          type: "textarea",
          required: true,
          admin: {
            description: "Brief description shown on category cards",
          },
        },
      ],
    },
    // Media
    {
      type: "group",
      name: "media",
      fields: [
        {
          name: "heroImage",
          type: "upload",
          relationTo: "media",
          admin: {
            description: "Main image for the category",
          },
        },
        {
          name: "cardImages",
          type: "array",
          maxRows: 3,
          admin: {
            description: "Images shown on category cards (max 3)",
          },
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
            },
            {
              name: "alt",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
    // Display Settings (Sidebar)
    {
      type: "group",
      name: "displaySettings",
      admin: {
        position: "sidebar",
      },
      fields: [
        {
          name: "order",
          type: "number",
          required: true,
          defaultValue: 1,
          admin: {
            description: "Display order on the packages page",
          },
        },
        {
          name: "isActive",
          type: "checkbox",
          defaultValue: true,
          index: true,
          admin: {
            description: "Show this category on the website",
          },
        },
        {
          name: "pageTitle",
          type: "text",
          admin: {
            description:
              'Custom page title for category page (e.g., "Honeymoon")',
          },
        },
        {
          name: "specialWord",
          type: "text",
          admin: {
            description: "Word to highlight in the section title",
          },
        },
      ],
    },
    // SEO (Sidebar)
    {
      name: "seo",
      type: "group",
      admin: {
        position: "sidebar",
      },
      fields: [
        {
          name: "metaTitle",
          type: "text",
        },
        {
          name: "metaDescription",
          type: "textarea",
        },
        {
          name: "metaImage",
          type: "upload",
          relationTo: "media",
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug from title if not provided
        if (!data.slug && data.title) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        }

        // Auto-generate pageTitle and specialWord if not provided
        if (!data.pageTitle && data.title) {
          data.pageTitle = data.title.replace(" Packages", "");
        }

        if (!data.specialWord && data.pageTitle) {
          data.specialWord = data.pageTitle;
        }

        return data;
      },
    ],
  },
};

export default PackageCategories;
