import { CollectionConfig } from "payload";

const Packages: CollectionConfig = {
  slug: "packages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "period", "price", "featured"],
    group: "Packages",
  },
  access: {
    read: () => true, // Public read access
  },
  fields: [
    // Core Package Information
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description:
          "URL-friendly version of the title (auto-generated if empty)",
      },
    },
    {
      name: "coreInfo",
      type: "group",
      admin: {
        description: "Core details of the package",
      },
      fields: [
        {
          name: "category",
          type: "relationship",
          relationTo: "package-categories",
          required: true,
          admin: {
            description: "Select the package category",
          },
          // Filter to only show active categories
          filterOptions: {
            "displaySettings.isActive": {
              equals: true,
            },
          },
        },
        {
          name: "period",
          type: "relationship",
          relationTo: "package-periods",
          required: true,
          admin: {
            description: "Select the package period",
          },
          // Remove the filterOptions temporarily
        },
        {
          name: "location",
          type: "relationship",
          relationTo: "locations",
          required: true,
          admin: {
            description: "Select the package location",
          },
        },
      ],
    },
    // Descriptions
    {
      name: "descriptions",
      type: "group",
      admin: {
        description: "Descriptions for the package",
      },
      fields: [
        {
          name: "description",
          type: "textarea",
          required: true,
        },
        {
          name: "shortDescription",
          type: "text",
          admin: {
            description: "Brief description for cards and listings",
          },
        },
      ],
    },
    // Pricing
    {
      name: "pricing",
      type: "group",
      admin: {
        description: "Pricing details",
      },
      fields: [
        {
          name: "price",
          type: "number",
          required: true,
          admin: {
            description: "Price in your currency",
          },
        },
        {
          name: "originalPrice",
          type: "number",
          admin: {
            description: "Original price (for showing discounts)",
          },
        },
      ],
    },
    // Media
    {
      name: "media",
      type: "group",
      admin: {
        description: "Images for the package",
      },
      fields: [
        {
          name: "images",
          type: "array",
          required: true,
          minRows: 1,
          maxRows: 10,
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
            {
              name: "caption",
              type: "text",
            },
          ],
        },
      ],
    },
    // Package Details
    {
      name: "packageDetails",
      type: "group",
      admin: {
        description: "Detailed package information",
      },
      fields: [
        {
          name: "highlights",
          type: "array",
          fields: [
            {
              name: "highlight",
              type: "text",
              required: true,
            },
          ],
        },
        {
          name: "inclusions",
          type: "array",
          fields: [
            {
              name: "inclusion",
              type: "text",
              required: true,
            },
          ],
        },
        {
          name: "exclusions",
          type: "array",
          fields: [
            {
              name: "exclusion",
              type: "text",
              required: true,
            },
          ],
        },
        {
          name: "itinerary",
          type: "array",
          fields: [
            {
              name: "day",
              type: "number",
              required: true,
            },
            {
              name: "title",
              type: "text",
              required: true,
            },
            {
              name: "description",
              type: "textarea",
            },
            {
              name: "activities",
              type: "array",
              fields: [
                {
                  name: "activity",
                  type: "text",
                  required: true,
                },
              ],
            },
          ],
        },
        {
          name: "accommodation",
          type: "textarea",
        },
        {
          name: "transportation",
          type: "textarea",
        },
        {
          name: "bestTimeToVisit",
          type: "text",
        },
        {
          name: "specialNotes",
          type: "textarea",
        },
      ],
    },
    // Featured Settings (Sidebar)
    {
      name: "featuredSettings",
      type: "group",
      admin: {
        description: "Settings for featuring the package",
        position: "sidebar",
      },
      fields: [
        {
          name: "featured",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Show in top 3 packages on homepage",
          },
        },
        {
          name: "featuredOrder",
          type: "number",
          admin: {
            description: "Order for featured packages (1-3)",
            condition: (data) => data.featuredSettings?.featured,
          },
        },
      ],
    },
    // SEO Settings (Sidebar)
    {
      name: "seo",
      type: "group",
      admin: {
        description: "SEO settings",
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
    // Publication Settings (Sidebar)
    {
      name: "publishingSettings",
      type: "group",
      label: "Publishing Settings",
      admin: {
        description: "Control page visibility and publishing",
        position: "sidebar",
      },
      fields: [
        {
          name: "status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
            { label: "Archived", value: "archived" },
          ],
          defaultValue: "draft",
          admin: {
            description: "Publishing status of this page",
          },
        },
        {
          name: "publishedAt",
          type: "date",
          admin: {
            description: "When this page was published",
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        // Auto-generate slug from title if not provided
        if (!data.coreInfo?.slug && data.coreInfo?.title) {
          data.coreInfo.slug = data.coreInfo.title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        }
        return data;
      },
    ],
  },
};

export default Packages;
