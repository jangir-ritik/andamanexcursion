import { CollectionConfig } from "payload";

const Bookings: CollectionConfig = {
  slug: "bookings",
  admin: {
    useAsTitle: "confirmationNumber",
    defaultColumns: [
      "confirmationNumber",
      "customerEmail",
      "bookingDate",
      "totalAmount",
      "status",
      "paymentStatus",
    ],
    group: "Bookings",
    listSearchableFields: [
      "confirmationNumber",
      "customerEmail",
      "customerPhone",
    ],
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
    // === BOOKING IDENTIFICATION ===
    {
      name: "confirmationNumber",
      type: "text",
      unique: true,
      admin: {
        description: "Unique booking confirmation number (auto-generated)",
        readOnly: true,
      },
    },
    {
      name: "bookingId",
      type: "text",
      unique: true,
      admin: {
        description: "Internal booking ID (auto-generated)",
        readOnly: true,
      },
    },

    // === CUSTOMER INFORMATION ===
    {
      name: "customerInfo",
      type: "group",
      fields: [
        {
          name: "primaryContactName",
          type: "text",
          required: true,
          admin: {
            description: "Name of the primary contact person",
          },
        },
        {
          name: "customerEmail",
          type: "email",
          required: true,
          admin: {
            description: "Primary email for booking correspondence",
          },
        },
        {
          name: "customerPhone",
          type: "text",
          required: true,
          admin: {
            description: "WhatsApp number for updates",
          },
        },
        {
          name: "nationality",
          type: "text",
          defaultValue: "Indian",
        },
      ],
    },

    // === BOOKING DETAILS ===
    {
      name: "bookingType",
      type: "select",
      required: true,
      defaultValue: "activity",
      options: [
        { label: "Activity", value: "activity" },
        { label: "Ferry", value: "ferry" },
        { label: "Package", value: "package" },
        { label: "Mixed", value: "mixed" },
      ],
    },
    {
      name: "bookingDate",
      type: "date",
      admin: {
        description: "Date when the booking was made (auto-generated)",
        readOnly: true,
      },
    },
    {
      name: "serviceDate",
      type: "date",
      required: true,
      admin: {
        description: "Date of the actual service/activity",
      },
    },

    // === BOOKED ACTIVITIES ===
    {
      name: "bookedActivities",
      type: "array",
      minRows: 0, // Change to 0 since ferry bookings won't have activities
      fields: [
        {
          name: "activity",
          type: "relationship",
          relationTo: "activities",
          required: true,
        },
        {
          name: "activityOption",
          type: "text",
          admin: {
            description: "Specific activity option/variant selected",
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
            description: "Price per unit at the time of booking",
          },
        },
        {
          name: "totalPrice",
          type: "number",
          required: true,
          admin: {
            description: "Total price for this activity (quantity * unitPrice)",
          },
        },
        {
          name: "scheduledTime",
          type: "text",
          admin: {
            description: "Scheduled time for this activity (HH:MM format)",
          },
        },
        {
          name: "location",
          type: "relationship",
          relationTo: "locations",
          admin: {
            description: "Location for this activity",
          },
        },
        {
          name: "passengers",
          type: "group",
          fields: [
            {
              name: "adults",
              type: "number",
              defaultValue: 0,
            },
            {
              name: "children",
              type: "number",
              defaultValue: 0,
            },
            {
              name: "infants",
              type: "number",
              defaultValue: 0,
            },
          ],
        },
      ],
    },

    // === BOOKED FERRIES ===
    {
      name: "bookedFerries",
      type: "array",
      minRows: 0,
      fields: [
        {
          name: "operator",
          type: "select",
          required: true,
          options: [
            { label: "Sealink Adventures", value: "sealink" },
            { label: "Makruzz", value: "makruzz" },
            { label: "Green Ocean Seaways", value: "greenocean" },
          ],
          admin: {
            description: "Ferry operator/provider",
          },
        },
        {
          name: "ferryName",
          type: "text",
          required: true,
          admin: {
            description: "Name of the ferry (e.g., Makruzz, Green Ocean 1)",
          },
        },
        {
          name: "route",
          type: "group",
          fields: [
            {
              name: "from",
              type: "text",
              required: true,
              admin: {
                description: "Departure location",
              },
            },
            {
              name: "to",
              type: "text",
              required: true,
              admin: {
                description: "Arrival location",
              },
            },
            {
              name: "fromCode",
              type: "text",
              admin: {
                description: "Port code for departure (e.g., PB, SW, SH)",
              },
            },
            {
              name: "toCode",
              type: "text",
              admin: {
                description: "Port code for arrival (e.g., PB, SW, SH)",
              },
            },
          ],
        },
        {
          name: "schedule",
          type: "group",
          fields: [
            {
              name: "departureTime",
              type: "text",
              required: true,
              admin: {
                description: "Departure time (HH:MM format)",
              },
            },
            {
              name: "arrivalTime",
              type: "text",
              required: true,
              admin: {
                description: "Arrival time (HH:MM format)",
              },
            },
            {
              name: "duration",
              type: "text",
              admin: {
                description: "Journey duration (e.g., 1h 30m)",
              },
            },
            {
              name: "travelDate",
              type: "date",
              required: true,
              admin: {
                description: "Date of travel",
              },
            },
          ],
        },
        {
          name: "selectedClass",
          type: "group",
          fields: [
            {
              name: "classId",
              type: "text",
              required: true,
            },
            {
              name: "className",
              type: "text",
              required: true,
              admin: {
                description: "Class name (e.g., Premium, Economy, Royal)",
              },
            },
            {
              name: "price",
              type: "number",
              required: true,
              admin: {
                description: "Price per seat for this class",
              },
            },
          ],
        },
        {
          name: "passengers",
          type: "group",
          fields: [
            {
              name: "adults",
              type: "number",
              required: true,
              defaultValue: 0,
            },
            {
              name: "children",
              type: "number",
              defaultValue: 0,
            },
            {
              name: "infants",
              type: "number",
              defaultValue: 0,
            },
          ],
        },
        {
          name: "selectedSeats",
          type: "array",
          fields: [
            {
              name: "seatNumber",
              type: "text",
              required: true,
              admin: {
                description: "Seat number (e.g., 1A, 2B)",
              },
            },
            {
              name: "seatId",
              type: "text",
              admin: {
                description: "Internal seat ID from operator",
              },
            },
            {
              name: "passengerName",
              type: "text",
              admin: {
                description: "Name of passenger assigned to this seat",
              },
            },
          ],
        },
        {
          name: "providerBooking",
          type: "group",
          admin: {
            description: "Booking details from ferry operator",
          },
          fields: [
            {
              name: "pnr",
              type: "text",
              admin: {
                description: "PNR/Booking reference from ferry operator",
              },
            },
            {
              name: "operatorBookingId",
              type: "text",
              admin: {
                description: "Booking ID from ferry operator system",
              },
            },
            {
              name: "bookingStatus",
              type: "select",
              options: [
                { label: "Confirmed", value: "confirmed" },
                { label: "Failed", value: "failed" },
                { label: "Pending", value: "pending" },
              ],
              defaultValue: "pending",
            },
            {
              name: "providerResponse",
              type: "textarea",
              admin: {
                description: "Raw response from ferry operator API (JSON)",
              },
            },
            {
              name: "errorMessage",
              type: "text",
              admin: {
                description: "Error message if booking failed",
              },
            },
          ],
        },
        {
          name: "totalPrice",
          type: "number",
          required: true,
          admin: {
            description: "Total price for this ferry booking",
          },
        },
      ],
    },

    // === PASSENGER DETAILS ===
    {
      name: "passengers",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "isPrimary",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Is this the primary contact person?",
          },
        },
        {
          name: "fullName",
          type: "text",
          required: true,
        },
        {
          name: "age",
          type: "number",
          required: true,
          min: 0,
          max: 120,
        },
        {
          name: "gender",
          type: "select",
          options: [
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
            { label: "Other", value: "Other" },
          ],
        },
        {
          name: "nationality",
          type: "text",
          defaultValue: "Indian",
        },
        {
          name: "passportNumber",
          type: "text",
          admin: {
            description: "Passport/ID number for verification",
          },
        },
        {
          name: "whatsappNumber",
          type: "text",
          admin: {
            description: "WhatsApp number (only for primary contact)",
          },
        },
        {
          name: "email",
          type: "email",
          admin: {
            description: "Email address (only for primary contact)",
          },
        },
        {
          name: "assignedActivities",
          type: "array",
          fields: [
            {
              name: "activityIndex",
              type: "number",
              required: true,
              admin: {
                description:
                  "Index of the activity this passenger is assigned to",
              },
            },
          ],
        },
      ],
    },

    // === PRICING ===
    {
      name: "pricing",
      type: "group",
      fields: [
        {
          name: "subtotal",
          type: "number",
          required: true,
          admin: {
            description: "Subtotal before taxes and fees",
          },
        },
        {
          name: "taxes",
          type: "number",
          defaultValue: 0,
          admin: {
            description: "Total tax amount",
          },
        },
        {
          name: "fees",
          type: "number",
          defaultValue: 0,
          admin: {
            description: "Processing and other fees",
          },
        },
        {
          name: "totalAmount",
          type: "number",
          required: true,
          admin: {
            description: "Final total amount",
          },
        },
        {
          name: "currency",
          type: "text",
          defaultValue: "INR",
        },
      ],
    },

    // === STATUS TRACKING ===
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Completed", value: "completed" },
        { label: "No Show", value: "no_show" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "paymentStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Paid", value: "paid" },
        { label: "Failed", value: "failed" },
        { label: "Refunded", value: "refunded" },
        { label: "Partially Refunded", value: "partially_refunded" },
      ],
      admin: {
        position: "sidebar",
      },
    },

    // === PAYMENT REFERENCE ===
    {
      name: "paymentTransactions",
      type: "relationship",
      relationTo: "payments",
      hasMany: true,
      admin: {
        description: "Associated payment transactions",
        position: "sidebar",
      },
    },

    // === ADDITIONAL INFORMATION ===
    {
      name: "specialRequests",
      type: "textarea",
      admin: {
        description: "Any special requests or notes from the customer",
      },
    },
    {
      name: "internalNotes",
      type: "textarea",
      admin: {
        description: "Internal notes for staff (not visible to customer)",
      },
    },
    {
      name: "termsAccepted",
      type: "checkbox",
      required: true,
      defaultValue: false,
      admin: {
        description: "Customer accepted terms and conditions",
      },
    },

    // === COMMUNICATION ===
    {
      name: "communicationPreferences",
      type: "group",
      fields: [
        {
          name: "sendWhatsAppUpdates",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "sendEmailUpdates",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "language",
          type: "select",
          defaultValue: "en",
          options: [
            { label: "English", value: "en" },
            { label: "Hindi", value: "hi" },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create") {
          // Generate booking ID and confirmation number
          const timestamp = Date.now();
          const random = Math.random().toString(36).substr(2, 4).toUpperCase();

          data.bookingId = `AE${timestamp}`;
          data.confirmationNumber = `AC${random}${timestamp
            .toString()
            .substr(-4)}`;
          data.bookingDate = new Date().toISOString();
        }
        return data;
      },
    ],
  },
  defaultSort: "-bookingDate",
};

export default Bookings;
