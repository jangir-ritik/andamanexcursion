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
    // Remove staticDir - UploadThing handles storage
    // staticDir: path.resolve(process.cwd(), "public/media"),

    // UploadThing will handle image resizing automatically based on these configurations
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
    // UploadThing will handle format optimization
    formatOptions: {
      format: "webp",
      options: {
        quality: 85,
        effort: 6,
      },
    },
    // Add resizeOptions for better UploadThing compatibility
    resizeOptions: {
      width: 2000, // Max width
      height: 2000, // Max height
      fit: "inside", // Maintain aspect ratio
      withoutEnlargement: true, // Don't upscale small images
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
        // Log successful upload for debugging
        if (req.file) {
          console.log(`✅ Media uploaded successfully:`, {
            id: doc.id,
            filename: doc.filename,
            url: doc.url,
            sizes: doc.sizes,
          });
        }
      },
    ],
  },
};

export default Media;
