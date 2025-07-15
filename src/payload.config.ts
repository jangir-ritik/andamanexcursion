import sharp from "sharp";
// import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { buildConfig } from "payload";
import { fileURLToPath } from "node:url";
import path from "path";
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

import Users from "./app/(payload)/collections/Users";

export default buildConfig({
  collections: [Users],
  secret: process.env.PAYLOAD_SECRET || "",
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || "",
  }),
  sharp,
  admin: {
    importMap: {
      baseDir: path.resolve(dirname, "components"),
    },
    meta: {
      icons: [
        {
          rel: "icon",
          type: "image/ico",
          url: "/favicon.ico",
        },
      ],
      title: "Boat Booking",
      openGraph: {
        title: "Boat Booking",
        description: "Boat Booking",
        images: [],
      },
      titleSuffix: "Boat Booking",
      formatDetection: {
        telephone: false,
      },
    },
    avatar: "default",
    components: {
      graphics: {
        Icon: "/atoms/CustomIcon/CustomIcon",
      },
    },
  },
});
