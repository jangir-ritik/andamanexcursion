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
      unique: true,
      admin: {
        description: 'URL slug (e.g., "honeymoon-retreat")',
      },
    },
    // Category Details
    {
      type: "group",
      name: "categoryDetails",
      fields: [
        // {
        //   name: "categoryId",
        //   type: "text",
        //   required: true,
        //   unique: true,
        //   admin: {
        //     description: "Internal category ID (used in packages and filters)",
        //   },
        // },
        {
          name: "description",
          type: "textarea",
          required: true,
          admin: {
            description: "Brief description shown on category cards",
          },
        },
        {
          name: "shortDescription",
          type: "text",
          admin: {
            description: "Shorter version for compact displays",
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
          name: "isFeatured",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Feature this category prominently",
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
            description: "Word to highlight in the page title",
          },
        },
      ],
    },
    // Content
    {
      type: "group",
      name: "content",
      fields: [
        {
          name: "highlights",
          type: "array",
          maxRows: 5,
          admin: {
            description: "Key highlights or features of this category",
          },
          fields: [
            {
              name: "highlight",
              type: "text",
            },
          ],
        },
        {
          name: "popularDestinations",
          type: "array",
          maxRows: 8,
          admin: {
            description: "Popular destinations for this category",
          },
          fields: [
            {
              name: "destination",
              type: "text",
            },
            {
              name: "isPopular",
              type: "checkbox",
              defaultValue: false,
            },
          ],
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
          admin: {
            description: "SEO title (leave empty to auto-generate)",
          },
        },
        {
          name: "metaDescription",
          type: "textarea",
          admin: {
            description: "SEO description (leave empty to auto-generate)",
          },
        },
        {
          name: "metaImage",
          type: "upload",
          relationTo: "media",
        },
        {
          name: "keywords",
          type: "array",
          maxRows: 10,
          admin: {
            description: "SEO keywords for this category",
          },
          fields: [
            {
              name: "keyword",
              type: "text",
            },
          ],
        },
        {
          name: "systemCategoryId",
          type: "text",
          admin: {
            hidden: true, // Hide from admin UI
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug from title if not provided
        if (!data?.slug && data?.title) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
        }

        // Auto-generate a system categoryId for internal use
        // This creates a stable identifier based on the slug
        data.systemCategoryId = data.slug;

        // Auto-generate pageTitle and specialWord if not provided
        if (!data?.displaySettings?.pageTitle && data?.title) {
          data.displaySettings = {
            ...data.displaySettings,
            pageTitle: data.title.replace(/\s+packages?/gi, "").trim(),
          };
        }

        if (
          !data?.displaySettings?.specialWord &&
          data?.displaySettings?.pageTitle
        ) {
          data.displaySettings = {
            ...data.displaySettings,
            specialWord: data.displaySettings.pageTitle,
          };
        }

        // Auto-generate SEO fields if not provided
        if (!data?.seo?.metaTitle && data?.title) {
          data.seo = {
            ...data.seo,
            metaTitle: `${data.title} - Best Travel Packages & Deals`,
          };
        }

        if (!data?.seo?.metaDescription && data?.categoryDetails?.description) {
          data.seo = {
            ...data.seo,
            metaDescription: `${
              data.categoryDetails.description
            } Book your perfect ${data.title.toLowerCase()} with us today.`,
          };
        }

        return data;
      },
    ],
  },
};

export default PackageCategories;
