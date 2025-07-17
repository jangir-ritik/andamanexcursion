import { Block } from "payload";

export const famousFishesBlock: Block = {
  slug: "famousFishes",
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
      name: "fishes",
      type: "array",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "subtitle",
          type: "text",
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