import { Block } from "payload";

export const exploreBlock: Block = {
  slug: "explore",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "specialWord",
      type: "text",
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
          name: "subtitle",
          type: "text",
        },
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
        },
        {
          name: "imageAlt",
          type: "text",
        },
      ],
    },
  ],
};