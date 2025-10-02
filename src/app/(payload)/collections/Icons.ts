import { CollectionConfig } from "payload";

const Icons: CollectionConfig = {
  slug: "icons",
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  upload: {
    // No image processing - upload SVGs as-is
    disableLocalStorage: false,

    // Only accept SVG files
    mimeTypes: ["image/svg+xml"],

    // No image sizes needed for SVGs
    imageSizes: [],

    // Admin thumbnail
    adminThumbnail: ({ doc }): string | null => {
      if (doc.url && typeof doc.url === "string") {
        return doc.url;
      }

      if (doc.uploadthingKey && typeof doc.uploadthingKey === "string") {
        const UPLOADTHING_APP_ID =
          process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID || "zu0uz82q68";
        return `https://${UPLOADTHING_APP_ID}.ufs.sh/f/${doc.uploadthingKey}`;
      }

      return null;
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "Descriptive name for the icon",
      },
    },
    {
      name: "category",
      type: "select",
      options: [
        { label: "Activity", value: "activity" },
        { label: "Feature", value: "feature" },
        { label: "Navigation", value: "navigation" },
        { label: "Step", value: "step" },
        { label: "Other", value: "other" },
      ],
      admin: {
        description: "Category to help organize icons",
      },
    },
    {
      name: "uploadthingKey",
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "uploadthingUrl",
      type: "text",
      admin: {
        hidden: true,
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        if (operation === "create" && doc.url && typeof doc.url === "string") {
          doc.uploadthingUrl = doc.url;

          const keyMatch = doc.url.match(/\/f\/([^/?#]+)/);
          if (keyMatch && keyMatch[1] !== ".") {
            doc.uploadthingKey = keyMatch[1];
          }

          console.log(`✅ Icon uploaded successfully:`, {
            id: doc.id,
            name: doc.name,
            filename: doc.filename,
            url: doc.url,
            uploadthingKey: doc.uploadthingKey,
          });
        }
      },
    ],
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "category", "filename", "updatedAt"],
    description:
      "Upload SVG icons for use throughout the site. Only SVG format is accepted.",
  },
};

export default Icons;
