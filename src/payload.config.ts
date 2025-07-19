import sharp from "sharp";
// import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { buildConfig } from "payload";
import { fileURLToPath } from "node:url";
import path from "path";
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Collections
import Users from "./app/(payload)/collections/Users";
import Media from "./app/(payload)/collections/Media";
import Pages from "./app/(payload)/collections/Pages";
import Packages from "./app/(payload)/collections/Packages";
import PackageCategories from "./app/(payload)/collections/PackageCategories/PackageCategories";
import PackagePeriods from "./app/(payload)/collections/PackagePeriods/PackagePeriods";

export default buildConfig({
  collections: [
    Users,
    Media,
    Pages,
    Packages,
    PackageCategories,
    PackagePeriods,
  ],
  secret: process.env.PAYLOAD_SECRET || "",
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || "",
  }),
  sharp,
  debug: true,
  logger: {
    options: {
      level: "debug",
    },
  },
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
        Icon: "/atoms/BrandIcon/BrandIcon",
        Logo: "/atoms/BrandLogo/BrandLogo",
      },
    },
  },
});
