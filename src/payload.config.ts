import sharp from "sharp";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { resendAdapter } from "@payloadcms/email-resend";
import { buildConfig } from "payload";
import { fileURLToPath } from "node:url";
import path from "path";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Collections
import {
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
  ActivityTimeSlots,
  ActivityInventory,
  Bookings,
  Payments,
  BookingSessions,
  Enquiries,
} from "./app/(payload)/collections";

// Globals
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
    ActivityTimeSlots,
    ActivityInventory,
    Bookings,
    Payments,
    BookingSessions,
    Enquiries,
  ],
  globals: [Navigation],
  secret: process.env.PAYLOAD_SECRET || "",
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || "",
  }),
  // Add Resend email adapter
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || "",
    defaultFromAddress: process.env.FROM_EMAIL || "",
    defaultFromName: "Andaman Excursion",
      
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
      title: "Andaman Excursion",
      openGraph: {
        title: "Andaman Excursion",
        description: "Andaman Excursion",
        images: [
          {
            url: "/favicon.ico",
          },
        ],
      },
      titleSuffix: "Andaman Excursion",
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
