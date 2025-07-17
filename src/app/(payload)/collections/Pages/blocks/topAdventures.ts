import { Block } from "payload";

export const topAdventuresBlock: Block = {
  slug: "topAdventures",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "specialWord",
      type: "text",
      required: true,
    },
    {
      name: "adventures",
      type: "array",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "description",
          type: "text",
          required: true,
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "imageAlt",
          type: "text",
          required: true,
        },
        {
          name: "badgeLabel",
          type: "text",
          required: true,
        },
        {
          name: "badgeIcon",
          type: "select",
          options: ["Star", "Heart"] as const,
          defaultValue: "Star",
          required: true,
        },
        {
          name: "href",
          type: "relationship",
          relationTo: "pages",
          required: true,
        },
      ],
    },
  ],
};
