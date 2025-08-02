import { CollectionConfig } from "payload";

const BookingSessions: CollectionConfig = {
  slug: "booking-sessions",
  admin: {
    useAsTitle: "sessionId",
    defaultColumns: [
      "sessionId",
      "userEmail",
      "status",
      "totalAmount",
      "itemCount",
      "expiresAt",
      "createdAt",
    ],
    group: "Bookings",
    listSearchableFields: ["sessionId", "userEmail", "userPhone"],
    pagination: {
      defaultLimit: 25,
    },
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    // === SESSION IDENTIFICATION ===
    {
      name: "sessionId",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Unique session identifier (auto-generated)",
        readOnly: true,
      },
    },
    {
      name: "userId",
      type: "text",
      admin: {
        description: "User ID if user is logged in (future implementation)",
      },
    },

    // === SESSION METADATA ===
    {
      name: "userAgent",
      type: "text",
      admin: {
        description: "Browser/device information",
      },
    },
    {
      name: "ipAddress",
      type: "text",
      admin: {
        description: "User's IP address",
      },
    },
    {
      name: "referrer",
      type: "text",
      admin: {
        description: "How the user reached the site",
      },
    },

    // === CONTACT INFORMATION ===
    {
      name: "userEmail",
      type: "email",
      admin: {
        description: "User's email (captured during checkout process)",
      },
    },
    {
      name: "userPhone",
      type: "text",
      admin: {
        description: "User's phone number",
      },
    },
    {
      name: "userName",
      type: "text",
      admin: {
        description: "User's name",
      },
    },

    // === CART DATA ===
    {
      name: "cartItems",
      type: "array",
      fields: [
        {
          name: "activity",
          type: "relationship",
          relationTo: "activities",
          required: true,
        },
        {
          name: "activityOptionId",
          type: "text",
          admin: {
            description: "Selected activity option/variant",
          },
        },
        {
          name: "searchParams",
          type: "json",
          admin: {
            description: "Search parameters (date, time, passengers, location)",
          },
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          defaultValue: 1,
        },
        {
          name: "unitPrice",
          type: "number",
          required: true,
          admin: {
            description: "Price per unit at time of adding to cart",
          },
        },
        {
          name: "totalPrice",
          type: "number",
          required: true,
          admin: {
            description: "Total price for this item",
          },
        },
        {
          name: "addedAt",
          type: "date",
          defaultValue: () => new Date().toISOString(),
          admin: {
            description: "When this item was added to cart",
          },
        },
        {
          name: "inventoryReserved",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Is inventory reserved for this item?",
          },
        },
        {
          name: "reservationExpiry",
          type: "date",
          admin: {
            description: "When the inventory reservation expires",
            condition: (data) => data.inventoryReserved,
          },
        },
      ],
    },

    // === FORM DATA (if partially filled) ===
    {
      name: "memberDetails",
      type: "json",
      admin: {
        description: "Partially filled member details from checkout form",
      },
    },
    {
      name: "checkoutStep",
      type: "number",
      defaultValue: 1,
      admin: {
        description:
          "Last completed checkout step (1=Details, 2=Review, 3=Payment)",
      },
    },

    // === SESSION STATUS ===
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Abandoned", value: "abandoned" },
        { label: "Converted", value: "converted" },
        { label: "Expired", value: "expired" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "expiresAt",
      type: "date",
      required: true,
      admin: {
        description: "When this session expires",
        position: "sidebar",
      },
    },

    // === CONVERSION TRACKING ===
    {
      name: "conversionData",
      type: "group",
      admin: {
        description: "Conversion and analytics data",
        condition: (data) => data.status === "converted",
      },
      fields: [
        {
          name: "convertedBookingId",
          type: "relationship",
          relationTo: "bookings",
          admin: {
            description: "The booking this session converted to",
          },
        },
        {
          name: "convertedAt",
          type: "date",
          admin: {
            description: "When the conversion happened",
          },
        },
        {
          name: "totalAmount",
          type: "number",
          admin: {
            description: "Final booking amount",
          },
        },
        {
          name: "conversionTimeMinutes",
          type: "number",
          admin: {
            description: "Time from session start to conversion (minutes)",
          },
        },
      ],
    },

    // === ANALYTICS ===
    {
      name: "analytics",
      type: "group",
      fields: [
        {
          name: "pageViews",
          type: "number",
          defaultValue: 0,
          admin: {
            description: "Number of pages viewed in this session",
          },
        },
        {
          name: "timeSpentMinutes",
          type: "number",
          defaultValue: 0,
          admin: {
            description: "Total time spent on site (minutes)",
          },
        },
        {
          name: "cartAbandoned",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Did user abandon cart during checkout?",
          },
        },
        {
          name: "abandonedAtStep",
          type: "number",
          admin: {
            description: "At which checkout step was cart abandoned",
            condition: (data) => data.analytics?.cartAbandoned,
          },
        },
      ],
    },

    // === TOTALS (computed fields) ===
    {
      name: "itemCount",
      type: "number",
      admin: {
        description: "Total number of items in cart",
        readOnly: true,
      },
    },
    {
      name: "totalAmount",
      type: "number",
      admin: {
        description: "Total cart amount",
        readOnly: true,
      },
    },

    // === RECOVERY ATTEMPTS ===
    {
      name: "recoveryAttempts",
      type: "array",
      admin: {
        description: "Abandoned cart recovery attempts",
      },
      fields: [
        {
          name: "attemptDate",
          type: "date",
          required: true,
        },
        {
          name: "method",
          type: "select",
          required: true,
          options: [
            { label: "Email", value: "email" },
            { label: "WhatsApp", value: "whatsapp" },
            { label: "SMS", value: "sms" },
            { label: "Push Notification", value: "push" },
          ],
        },
        {
          name: "success",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "response",
          type: "text",
          admin: {
            description: "User response or engagement",
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create") {
          // Generate session ID
          const timestamp = Date.now();
          const random = Math.random().toString(36).substr(2, 8).toUpperCase();
          data.sessionId = `SES${timestamp}${random}`;

          // Set default expiry (24 hours from now)
          const expiryDate = new Date();
          expiryDate.setHours(expiryDate.getHours() + 24);
          data.expiresAt = expiryDate.toISOString();
        }

        // Calculate totals
        if (data.cartItems && Array.isArray(data.cartItems)) {
          data.itemCount = data.cartItems.length;
          data.totalAmount = data.cartItems.reduce(
            (sum, item) => sum + (item.totalPrice || 0),
            0
          );
        }

        return data;
      },
    ],
    afterChange: [
      ({ doc, operation, previousDoc }) => {
        // Trigger abandoned cart recovery workflow
        if (doc.status === "abandoned" && previousDoc?.status !== "abandoned") {
          // Schedule recovery email/WhatsApp
          console.log(
            `Schedule abandoned cart recovery for session: ${doc.sessionId}`
          );
        }
      },
    ],
  },
  defaultSort: "-createdAt",
};

export default BookingSessions;
