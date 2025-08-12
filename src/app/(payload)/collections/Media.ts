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
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "smallCard",
        width: 405,
        height: 360,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 576,
        position: "centre",
      },
      {
        name: "tablet",
        width: 1024,
        height: undefined,
        position: "centre",
      },
      {
        name: "desktop",
        width: 1920,
        height: undefined,
        position: "centre",
      },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: [
      "image/*",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/avi",
      "video/mov",
      "video/wmv",
    ],
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
    {
      name: "mediaType",
      type: "select",
      options: [
        { label: "Image", value: "image" },
        { label: "Video", value: "video" },
      ],
      required: true,
      admin: {
        position: "sidebar",
      },
    },
    // Video-specific fields
    {
      name: "videoSettings",
      type: "group",
      admin: {
        condition: (data) => data.mediaType === "video",
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
          admin: {
            description: "Required for autoplay to work in most browsers",
          },
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
            description: "Thumbnail image shown before video plays",
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Auto-detect media type based on MIME type
        if (req.file && req.file.mimetype) {
          if (req.file.mimetype.startsWith("image/")) {
            data.mediaType = "image";
          } else if (req.file.mimetype.startsWith("video/")) {
            data.mediaType = "video";
          }
        }
        return data;
      },
    ],
  },
};

export default Media;
