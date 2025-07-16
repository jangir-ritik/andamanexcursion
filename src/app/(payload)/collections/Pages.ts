import { CollectionConfig } from "payload";

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
      options: [
        { label: "Home", value: "home" },
        { label: "Activities", value: "activities" },
        { label: "Fishing", value: "fishing" },
        { label: "Live Volcanos", value: "live-volcanos" },
        { label: "Specials", value: "specials" },
        { label: "Packages", value: "packages" },
        { label: "How to Reach", value: "how-to-reach" },
      ],
    },
    {
      name: "seo",
      type: "group",
      fields: [
        {
          name: "metaTitle",
          type: "text",
        },
        {
          name: "metaDescription",
          type: "textarea",
        },
        {
          name: "metaImage",
          type: "upload",
          relationTo: "media",
        },
      ],
    },
    {
      name: "content",
      type: "blocks",
      blocks: [
        // Hero/Banner Block
        {
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
            {
              name: "imageAlt",
              type: "text",
            },
            {
              name: "ctaText",
              type: "text",
            },
            {
              name: "ctaHref",
              type: "text",
            },
          ],
        },
        // Feature Block
        {
          slug: "feature",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
            },
            {
              name: "specialWord",
              type: "text",
              admin: {
                description: "Word to highlight in the title",
              },
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
            {
              name: "imageAlt",
              type: "text",
            },
            {
              name: "ctaText",
              type: "text",
            },
            {
              name: "ctaHref",
              type: "text",
            },
          ],
        },
        // FAQ Block
        {
          slug: "faq",
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
              name: "items",
              type: "array",
              fields: [
                {
                  name: "question",
                  type: "text",
                  required: true,
                },
                {
                  name: "answer",
                  type: "textarea",
                  required: true,
                },
              ],
            },
          ],
        },
        // Large Card Section Block
        {
          slug: "largeCard",
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
            {
              name: "ctaText",
              type: "text",
            },
            {
              name: "ctaHref",
              type: "text",
            },
          ],
        },
        // Trivia Block
        {
          slug: "trivia",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
            },
            {
              name: "text",
              type: "textarea",
              required: true,
            },
            {
              name: "highlightedPhrases",
              type: "array",
              fields: [
                {
                  name: "phrase",
                  type: "text",
                },
              ],
            },
          ],
        },
        // Experience/Cards Block
        {
          slug: "experience",
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
              name: "cards",
              type: "array",
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
                  name: "icon",
                  type: "upload",
                  relationTo: "media",
                },
              ],
            },
          ],
        },
        // Trust Stats Block
        {
          slug: "trustStats",
          fields: [
            {
              name: "title",
              type: "group",
              fields: [
                {
                  name: "text",
                  type: "text",
                },
                {
                  name: "specialWord",
                  type: "text",
                },
              ],
            },
            {
              name: "stats",
              type: "array",
              fields: [
                {
                  name: "value",
                  type: "text",
                  required: true,
                },
                {
                  name: "label",
                  type: "text",
                  required: true,
                },
                {
                  name: "description",
                  type: "text",
                },
                {
                  name: "icon",
                  type: "text",
                  admin: {
                    description: "Icon identifier or class name",
                  },
                },
              ],
            },
          ],
        },
        // Why Choose Us Block
        {
          slug: "whyChooseUs",
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
              name: "points",
              type: "array",
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
              ],
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
            {
              name: "ctaText",
              type: "text",
            },
            {
              name: "ctaHref",
              type: "text",
            },
          ],
        },
        // Package Carousel Block
        {
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
                {
                  name: "imageAlt",
                  type: "text",
                },
              ],
            },
          ],
        },
        // Hidden Gems Block
        {
          slug: "hiddenGems",
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
              name: "ctaText",
              type: "text",
            },
            {
              name: "ctaHref",
              type: "text",
            },
            {
              name: "images",
              type: "group",
              fields: [
                {
                  name: "island1",
                  type: "group",
                  fields: [
                    {
                      name: "src",
                      type: "upload",
                      relationTo: "media",
                    },
                    {
                      name: "alt",
                      type: "text",
                    },
                  ],
                },
                {
                  name: "island2",
                  type: "group",
                  fields: [
                    {
                      name: "src",
                      type: "upload",
                      relationTo: "media",
                    },
                    {
                      name: "alt",
                      type: "text",
                    },
                  ],
                },
                {
                  name: "island3",
                  type: "group",
                  fields: [
                    {
                      name: "src",
                      type: "upload",
                      relationTo: "media",
                    },
                    {
                      name: "alt",
                      type: "text",
                    },
                  ],
                },
              ],
            },
          ],
        },
        // Explore/Activities Block
        {
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
        },
        // Famous Fishes Block
        {
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
        },
        // How to Reach Block
        {
          slug: "howToReach",
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
              name: "cards",
              type: "array",
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
                  name: "icon",
                  type: "upload",
                  relationTo: "media",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default Pages;
