import path from "path";
import { CollectionConfig } from "payload";

const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  upload: {
    staticDir: path.resolve(process.cwd(), "public/media"),
    imageSizes: [
      {
        name: "thumbnail",
        width: 150,
        height: 150,
        position: "centre",
        formatOptions: {
          format: "webp",
          options: { quality: 75, effort: 6 },
        },
      },
      {
        name: "small",
        width: 400,
        height: undefined, // Maintain aspect ratio
        position: "centre",
        formatOptions: {
          format: "webp",
          options: { quality: 80, effort: 6 },
        },
      },
      {
        name: "medium",
        width: 768,
        height: undefined,
        position: "centre",
        formatOptions: {
          format: "webp",
          options: { quality: 85, effort: 6 },
        },
      },
      {
        name: "large",
        width: 1200,
        height: undefined,
        position: "centre",
        formatOptions: {
          format: "webp",
          options: { quality: 85, effort: 6 },
        },
      },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*", "video/mp4", "video/webm", "video/ogg"],

    // Simple, consistent optimization for originals
    formatOptions: {
      format: "webp",
      options: {
        quality: 85,
        effort: 6,
      },
    },
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      type: "text",
    },
    // Remove the complex optimization settings - keep it simple
    {
      name: "videoSettings",
      type: "group",
      admin: {
        condition: (data) => {
          // Auto-detect video files
          return data.mimeType?.startsWith("video/");
        },
      },
      fields: [
        {
          name: "autoplay",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "loop",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "muted",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "controls",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "poster",
          type: "upload",
          relationTo: "media",
          admin: {
            condition: (data) => data.mimeType?.startsWith("image/"),
          },
        },
      ],
    },
  ],
  hooks: {
    // Keep it minimal - just auto-detect media type
    beforeChange: [
      ({ data, req }) => {
        if (req.file?.mimetype) {
          data.mediaType = req.file.mimetype.startsWith("image/")
            ? "image"
            : "video";
        }
        return data;
      },
    ],
    // Remove afterChange hook - let Payload handle everything
  },
};

export default Media;
