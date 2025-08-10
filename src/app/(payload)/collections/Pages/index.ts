import { CollectionConfig } from "payload";
import { pageTypeOptions } from "@/shared/constants/page-types";
import { seoFields } from "./fields/seo";
import { contentBlocks } from "./blocks";

const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "pageType", "updatedAt"],
  },
  access: {
    read: () => true,
  },
  fields: [
    // === BASIC INFORMATION ===
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Main title of the page",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      admin: {
        description: "URL path for this page (e.g., /about-us)",
      },
    },
    {
      name: "basicInfo",
      type: "group",
      label: "Basic Information",
      admin: {
        description: "Essential page details",
        position: "sidebar",
      },
      fields: [
        {
          name: "pageType",
          type: "select",
          required: true,
          options: pageTypeOptions,
          defaultValue: "home",
          admin: {
            description: "Type of page this is",
          },
        },
      ],
    },

    // === DESTINATION-SPECIFIC FIELDS ===
    {
      name: "destinationInfo",
      type: "group",
      label: "Destination Settings",
      admin: {
        condition: (data) => data.basicInfo?.pageType === "destinations",
        description: "Settings specific to destination pages",
        position: "sidebar",
      },
      fields: [
        {
          name: "parentDestination",
          type: "relationship",
          relationTo: "pages",
          filterOptions: ({ relationTo, data }) => {
            return {
              "basicInfo.pageType": { equals: "destinations" },
              id: { not_equals: data.id }, // Prevent self-reference
            };
          },
          admin: {
            description:
              "Select parent destination (for sub-destinations like beaches)",
          },
        },
        {
          name: "destinationType",
          type: "select",
          options: [
            { label: "Main Destination", value: "main" },
            { label: "Beach", value: "beach" },
            { label: "Island", value: "island" },
            { label: "Attraction", value: "attraction" },
          ],
        },
      ],
    },

    // === SEO & METADATA ===
    {
      name: "seoMeta",
      type: "group",
      label: "SEO & Metadata",
      admin: {
        description: "Search engine optimization settings",
        position: "sidebar",
      },
      fields: [...seoFields.fields],
    },

    // === PAGE CONTENT ===
    {
      name: "pageContent",
      type: "group",
      label: "Page Content",
      admin: {
        description: "Main content blocks for this page",
      },
      fields: [
        {
          name: "content",
          type: "blocks",
          blocks: contentBlocks,
          label: "Content Blocks",
          admin: {
            description: "Add and arrange content blocks for this page",
          },
        },
      ],
    },

    // === PUBLISHING & STATUS ===
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
};

export default Pages;
