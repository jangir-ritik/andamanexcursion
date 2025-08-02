import { CollectionConfig } from "payload";

const ActivityInventory: CollectionConfig = {
  slug: "activity-inventory",
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "activity",
      "date",
      "timeSlot",
      "totalCapacity",
      "bookedCapacity",
      "availableCapacity",
      "status",
    ],
    group: "Activities",
    listSearchableFields: ["activity", "date"],
    pagination: {
      defaultLimit: 50,
    },
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    // === IDENTIFICATION ===
    {
      name: "title",
      type: "text",
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: "activity",
      type: "relationship",
      relationTo: "activities",
      required: true,
      admin: {
        description: "The activity this inventory is for",
      },
    },
    {
      name: "activityOption",
      type: "text",
      admin: {
        description: "Specific activity option/variant (if applicable)",
      },
    },

    // === DATE & TIME ===
    {
      name: "date",
      type: "date",
      required: true,
      admin: {
        description: "Service date (YYYY-MM-DD)",
      },
    },
    {
      name: "timeSlot",
      type: "relationship",
      relationTo: "time-slots",
      admin: {
        description:
          "Time slot for this inventory (optional for full-day activities)",
      },
    },

    // === CAPACITY MANAGEMENT ===
    {
      name: "totalCapacity",
      type: "number",
      required: true,
      min: 1,
      admin: {
        description: "Maximum number of people that can be accommodated",
      },
    },
    {
      name: "bookedCapacity",
      type: "number",
      defaultValue: 0,
      min: 0,
      admin: {
        description: "Number of people currently booked",
        readOnly: true,
      },
    },
    {
      name: "availableCapacity",
      type: "number",
      admin: {
        description: "Remaining capacity (auto-calculated)",
        readOnly: true,
      },
    },
    {
      name: "reservedCapacity",
      type: "number",
      defaultValue: 0,
      min: 0,
      admin: {
        description: "Temporarily held capacity (for pending payments)",
      },
    },

    // === STATUS & AVAILABILITY ===
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "available",
      options: [
        { label: "Available", value: "available" },
        { label: "Fully Booked", value: "fully_booked" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Suspended", value: "suspended" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Is this inventory slot active for booking?",
        position: "sidebar",
      },
    },

    // === PRICING OVERRIDES ===
    {
      name: "priceOverrides",
      type: "group",
      admin: {
        description: "Optional price overrides for this specific date/time",
      },
      fields: [
        {
          name: "hasOverride",
          type: "checkbox",
          defaultValue: false,
        },
        {
          name: "adultPrice",
          type: "number",
          admin: {
            condition: (data) => data.priceOverrides?.hasOverride,
            description: "Override price for adults",
          },
        },
        {
          name: "childPrice",
          type: "number",
          admin: {
            condition: (data) => data.priceOverrides?.hasOverride,
            description: "Override price for children",
          },
        },
      ],
    },

    // === OPERATIONAL NOTES ===
    {
      name: "operationalNotes",
      type: "textarea",
      admin: {
        description:
          "Special notes for this date/time (weather, equipment, etc.)",
      },
    },
    {
      name: "weatherDependency",
      type: "select",
      defaultValue: "no",
      options: [
        { label: "No Dependency", value: "no" },
        { label: "Weather Dependent", value: "dependent" },
        { label: "Indoor Activity", value: "indoor" },
      ],
    },

    // === LOCATION OVERRIDE ===
    {
      name: "locationOverride",
      type: "relationship",
      relationTo: "locations",
      admin: {
        description:
          "Override location for this specific date/time (if different from activity default)",
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, originalDoc }) => {
        // Calculate available capacity
        const booked = data.bookedCapacity || 0;
        const reserved = data.reservedCapacity || 0;
        const total = data.totalCapacity || 0;

        data.availableCapacity = Math.max(0, total - booked - reserved);

        // Auto-update status based on capacity
        if (data.availableCapacity === 0) {
          data.status = "fully_booked";
        } else if (
          data.status === "fully_booked" &&
          data.availableCapacity > 0
        ) {
          data.status = "available";
        }

        // Generate title for admin display
        if (data.activity && data.date) {
          const activityTitle =
            typeof data.activity === "object"
              ? data.activity.title
              : "Activity";
          data.title = `${activityTitle} - ${data.date}${
            data.timeSlot ? ` - ${data.timeSlot}` : ""
          }`;
        }

        return data;
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        // Here you could trigger webhook notifications
        // for inventory updates, low stock alerts, etc.
        console.log(
          `Inventory updated for ${doc.title}: ${doc.availableCapacity} slots available`
        );
      },
    ],
  },
  defaultSort: "date",
};

export default ActivityInventory;
