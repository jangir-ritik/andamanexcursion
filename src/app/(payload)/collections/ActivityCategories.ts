import { createSlugHook } from "@/utils/generateSlug";
import { CollectionConfig } from "payload";

const ActivityCategories: CollectionConfig = {
  slug: "activity-categories",
  admin: {
    useAsTitle: "name", // Must be top-level field
    defaultColumns: ["name", "parentCategory", "isActive", "sortOrder"],
    group: "Activities",
    listSearchableFields: ["name", "description"],
    pagination: {
      defaultLimit: 25,
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    // === TOP-LEVEL FIELDS (for admin functionality) ===
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "e.g., 'Scuba Diving', 'Water Sports', 'Adventure'",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL-friendly version (auto-generated from name)",
        readOnly: true,
      },
    },
    {
      name: "description",
      type: "textarea",
      required: true,
      admin: {
        description: "Brief description of this activity category",
        rows: 3,
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Uncheck to hide this category from public view",
        position: "sidebar",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Display order (0 = first, higher numbers = later)",
        step: 1,
        position: "sidebar",
      },
    },
    {
      name: "parentCategory",
      type: "relationship",
      relationTo: "activity-categories",
      admin: {
        description: "Select parent category for hierarchical organization",
        position: "sidebar",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description:
          "Image representing this category (recommended: square format, min 64x64px)",
      },
    },
    {
      name: "seo",
      type: "group",
      label: "SEO Settings",
      admin: {
        description: "Search engine optimization settings",
        condition: (data) => data.isActive, // Only show SEO if category is active
        position: "sidebar",
      },
      fields: [
        {
          name: "metaTitle",
          type: "text",
          admin: {
            description: "Leave blank to auto-generate from category name",
            placeholder: "Auto-generated from name if empty",
          },
        },
        {
          name: "metaDescription",
          type: "textarea",
          admin: {
            description:
              "Brief description for search engines (150-160 characters recommended)",
            rows: 2,
          },
          validate: (val) => {
            if (val && val.length > 160) {
              return "Meta description should be under 160 characters for best SEO results";
            }
            return true;
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      // Auto-generate slug using utility function
      createSlugHook("name", "slug", { maxLength: 60 }),

      // Auto-generate meta title
      ({ data }) => {
        if (data.isActive && data.name && !data.seo?.metaTitle) {
          data.seo = data.seo || {};
          data.seo.metaTitle = `${data.name} Activities | Your Site Name`;
        }
        return data;
      },
    ],
    beforeValidate: [
      ({ data, originalDoc, operation }) => {
        // Prevent circular parent-child relationships
        // Only check this during updates when we have an existing document ID
        if (
          operation === "update" &&
          originalDoc?.id &&
          data?.parentCategory === originalDoc.id
        ) {
          throw new Error("A category cannot be its own parent");
        }
        return data;
      },
    ],
  },
};

export default ActivityCategories;
