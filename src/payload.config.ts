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
import PackageCategories from "./app/(payload)/collections/PackageCategories";
import PackagePeriods from "./app/(payload)/collections/PackagePeriods";
import Locations from "./app/(payload)/collections/Locations";
import ActivityCategories from "./app/(payload)/collections/ActivityCategories";
import Activities from "./app/(payload)/collections/Activities";
import TimeSlots from "./app/(payload)/collections/TimeSlots";
import ActivityInventory from "./app/(payload)/collections/ActivityInventory";
import Bookings from "./app/(payload)/collections/Bookings";
import Payments from "./app/(payload)/collections/Payments";
import BookingSessions from "./app/(payload)/collections/BookingSessions";
import Navigation from "./app/(payload)/globals/Navigation";

export default buildConfig({
  collections: [
    Users,
    Media,
    Pages,
    Packages,
    PackageCategories,
    PackagePeriods,
    Locations,
    ActivityCategories,
    Activities,
    TimeSlots,
    ActivityInventory,
    Bookings,
    Payments,
    BookingSessions,
  ],
  globals: [Navigation],
  secret: process.env.PAYLOAD_SECRET || "",
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || "",
  }),
  sharp,
  debug: true,
  cors: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.NEXT_PUBLIC_SITE_URL || "",
  ],
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
