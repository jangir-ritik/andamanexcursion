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
    // UploadThing handles storage and sizing automatically
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
    formatOptions: {
      format: "webp",
      options: {
        quality: 85,
        effort: 6,
      },
    },
    resizeOptions: {
      width: 2000,
      height: 2000,
      fit: "inside",
      withoutEnlargement: true,
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
    {
      name: "videoSettings",
      type: "group",
      admin: {
        condition: (data) => {
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
    beforeChange: [
      ({ data, req }) => {
        // Auto-detect media type
        if (req.file?.mimetype) {
          data.mediaType = req.file.mimetype.startsWith("image/")
            ? "image"
            : req.file.mimetype.startsWith("video/")
            ? "video"
            : "other";
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, req }) => {
        // Enhanced logging for UploadThing debugging
        if (req.file) {
          console.log(`✅ Media uploaded successfully:`, {
            id: doc.id,
            filename: doc.filename,
            url: doc.url,
            mimeType: doc.mimeType,
            sizes: doc.sizes ? Object.keys(doc.sizes) : [],
            filesize: doc.filesize,
            // Log actual URLs for debugging
            sizeUrls: doc.sizes
              ? Object.entries(doc.sizes).reduce((acc, [key, size]) => {
                  acc[key] = typeof size === "string" ? size : "no url";
                  return acc;
                }, {} as Record<string, string>)
              : {},
          });
        }
      },
    ],
  },
};

export default Media;
