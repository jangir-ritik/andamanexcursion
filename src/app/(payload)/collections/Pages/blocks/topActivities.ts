import { Block } from "payload";

export const topActivitiesBlock: Block = {
  slug: "topActivities",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      defaultValue: "Water",
    },
    {
      name: "specialWord",
      type: "text",
      required: true,
      defaultValue: "Adventures",
    },
    {
      name: "description",
      type: "text",
      defaultValue:
        "From snorkeling in coral gardens to jet skiing across blue horizons, your adventure begins here.",
    },
    {
      name: "activities",
      type: "relationship",
      relationTo: "activities",
      hasMany: true,
      required: true,
      admin: {
        description:
          "Select the activities to display in the top activities section",
      },
      filterOptions: ({ data }) => {
        return {
          "status.isActive": { equals: true },
          "status.isFeatured": { equals: true },
        };
      },
    },
    {
      name: "maxActivities",
      type: "number",
      defaultValue: 9,
      admin: {
        description: "Maximum number of activities to display",
      },
    },
    {
      name: "showCustomerFavorite",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Show 'Customer's Favourite' badge on featured activities",
      },
    },
    // fields: [
    //   {
    //     name: "title",
    //     type: "text",
    //     required: true,
    //   },
    //   {
    //     name: "description",
    //     type: "text",
    //     required: true,
    //   },
    //   {
    //     name: "image",
    //     type: "upload",
    //     relationTo: "media",
    //     required: true,
    //   },
    //   {
    //     name: "imageAlt",
    //     type: "text",
    //     required: true,
    //   },
    //   {
    //     name: "badgeLabel",
    //     type: "text",
    //     required: true,
    //   },
    //   {
    //     name: "badgeIcon",
    //     type: "select",
    //     options: ["Star", "Heart"] as const,
    //     defaultValue: "Star",
    //     required: true,
    //   },
    //   {
    //     name: "href",
    //     type: "relationship",
    //     relationTo: "pages",
    //     required: true,
    //   },
    // ],
    // },
  ],
};
