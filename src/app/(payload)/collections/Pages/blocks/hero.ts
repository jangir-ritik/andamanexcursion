import { Block } from "payload";

export const heroBlock: Block = {
  slug: "hero",
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "subtitle",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      required: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "ctaText",
      type: "text",
      required: true,
    },
    {
      name: "ctaHref",
      type: "text",
      required: true,
    },
  ],
};
