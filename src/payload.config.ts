import sharp from "sharp";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { resendAdapter } from "@payloadcms/email-resend";
import { buildConfig } from "payload";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { uploadthingStorage } from "@payloadcms/storage-uploadthing";
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
  BoatRoutes,
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
    BoatRoutes,
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
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || "",
    defaultFromAddress: process.env.FROM_EMAIL || "",
    defaultFromName: "Andaman Excursion",
  }),
  sharp,
  debug: process.env.NODE_ENV === "development",
  cors: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.NEXT_PUBLIC_SITE_URL || "",
  ],
  logger: {
    options: {
      level: process.env.NODE_ENV === "development" ? "debug" : "info",
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
  plugins: [
    // UploadThing Storage Plugin configuration
    uploadthingStorage({
      collections: {
        media: {
          // Enable direct UploadThing URLs
          disablePayloadAccessControl: true,
        },
      },
      options: {
        // Use the secret key for authentication
        token: process.env.UPLOADTHING_SECRET_KEY || process.env.UPLOADTHING_SECRET || "",
        acl: "public-read",
        logLevel: process.env.NODE_ENV === "development" ? "Debug" : "Error",
      },
    }),
    seoPlugin({
      collections: [
        "pages",
        "packages",
        "package-categories",
        "activities",
        "activity-categories",
        "boat-routes",
      ],
      uploadsCollection: "media",
      generateTitle: ({ doc, collectionSlug }) => {
        const siteName = "Andaman Excursion";

        switch (collectionSlug) {
          case "activities":
            return `${doc.title} | Activities | ${siteName}`;
          case "packages":
            return `${doc.title} | Packages | ${siteName}`;
          case "package-categories":
            return `${doc.name} Packages | ${siteName}`;
          case "activity-categories":
            return `${doc.name} Activities | ${siteName}`;
          case "boat-routes":
            return `${doc.routeName} Ferry | Boat Booking | ${siteName}`;
          default:
            return `${doc.title || doc.name} | ${siteName}`;
        }
      },
      generateDescription: ({ doc, collectionSlug }) => {
        switch (collectionSlug) {
          case "activities":
            return (
              doc.coreInfo?.shortDescription ||
              `Experience ${doc.title} in the Andaman Islands`
            );
          case "packages":
            return (
              doc.shortDescription ||
              `Discover our ${doc.title} package in Andaman`
            );
          case "package-categories":
            return `Explore ${doc.name} packages in the Andaman Islands`;
          case "activity-categories":
            return `Find the best ${doc.name} activities in Andaman`;
          default:
            return doc.description?.substring(0, 160);
        }
      },
    }),
  ],
});
