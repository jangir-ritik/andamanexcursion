import { Block } from "payload";

export const packageCarouselBlock: Block = {
  slug: "packageCarousel",
  fields: [
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
      name: "slides",
      type: "array",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "price",
          type: "text",
        },
        {
          name: "description",
          type: "textarea",
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
        },
      ],
    },
  ],
};
