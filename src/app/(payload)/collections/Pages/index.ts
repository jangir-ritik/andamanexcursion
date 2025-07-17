import { CollectionConfig } from "payload";
import { pageTypeOptions } from "./config/pageTypes";
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
        description: "URL path for this page",
      },
    },
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
    seoFields,
    {
      name: "content",
      type: "blocks",
      blocks: contentBlocks,
    },
  ],
};

export default Pages;
