import { CollectionConfig } from "payload";

const Payments: CollectionConfig = {
  slug: "payments",
  admin: {
    useAsTitle: "transactionId",
    defaultColumns: [
      "transactionId",
      "bookingReference",
      "amount",
      "status",
      "paymentMethod",
      "createdAt",
    ],
    group: "Bookings",
    listSearchableFields: [
      "transactionId",
      "razorpayPaymentId",
      "razorpayOrderId",
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
    // === PAYMENT IDENTIFICATION ===
    {
      name: "transactionId",
      type: "text",
      unique: true,
      admin: {
        description: "Internal transaction ID (auto-generated)",
        readOnly: true,
      },
    },
    {
      name: "bookingReference",
      type: "relationship",
      relationTo: "bookings",
      admin: {
        description: "Associated booking (set after booking creation)",
      },
    },

    // === RAZORPAY INTEGRATION ===
    {
      name: "razorpayData",
      type: "group",
      admin: {
        description: "Razorpay specific transaction data",
      },
      fields: [
        {
          name: "razorpayOrderId",
          type: "text",
          admin: {
            description: "Razorpay Order ID",
          },
        },
        {
          name: "razorpayPaymentId",
          type: "text",
          admin: {
            description: "Razorpay Payment ID (after successful payment)",
          },
        },
        {
          name: "razorpaySignature",
          type: "text",
          admin: {
            description: "Razorpay payment signature for verification",
          },
        },
        {
          name: "razorpayWebhookData",
          type: "json",
          admin: {
            description: "Raw webhook data from Razorpay",
          },
        },
      ],
    },

    // === PAYMENT DETAILS ===
    {
      name: "amount",
      type: "number",
      required: true,
      admin: {
        description: "Payment amount in smallest currency unit (paise for INR)",
      },
    },
    {
      name: "currency",
      type: "text",
      required: true,
      defaultValue: "INR",
    },
    {
      name: "paymentMethod",
      type: "select",
      required: true,
      options: [
        { label: "Card", value: "card" },
        { label: "Net Banking", value: "netbanking" },
        { label: "UPI", value: "upi" },
        { label: "Wallet", value: "wallet" },
        { label: "EMI", value: "emi" },
        { label: "Bank Transfer", value: "bank_transfer" },
        { label: "Cash", value: "cash" },
        { label: "Other", value: "other" },
      ],
    },

    // === PAYMENT STATUS ===
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Success", value: "success" },
        { label: "Failed", value: "failed" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Refunded", value: "refunded" },
        { label: "Partially Refunded", value: "partially_refunded" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "paymentDate",
      type: "date",
      admin: {
        description: "Date when payment was completed",
      },
    },

    // === CUSTOMER INFORMATION ===
    {
      name: "customerDetails",
      type: "group",
      fields: [
        {
          name: "customerName",
          type: "text",
          admin: {
            description: "Customer name for payment",
          },
        },
        {
          name: "customerEmail",
          type: "email",
          admin: {
            description: "Customer email for payment receipt",
          },
        },
        {
          name: "customerPhone",
          type: "text",
          admin: {
            description: "Customer phone for payment notifications",
          },
        },
      ],
    },

    // === FAILURE/ERROR DETAILS ===
    {
      name: "failureReason",
      type: "text",
      admin: {
        description: "Reason for payment failure (if applicable)",
        condition: (data) => data.status === "failed",
      },
    },
    {
      name: "errorCode",
      type: "text",
      admin: {
        description: "Error code from payment gateway",
        condition: (data) => data.status === "failed",
      },
    },

    // === REFUND INFORMATION ===
    {
      name: "refundDetails",
      type: "group",
      admin: {
        description: "Refund information (if applicable)",
        condition: (data) =>
          data.status === "refunded" || data.status === "partially_refunded",
      },
      fields: [
        {
          name: "refundId",
          type: "text",
          admin: {
            description: "Razorpay refund ID",
          },
        },
        {
          name: "refundAmount",
          type: "number",
          admin: {
            description: "Refunded amount in smallest currency unit",
          },
        },
        {
          name: "refundDate",
          type: "date",
        },
        {
          name: "refundReason",
          type: "text",
        },
        {
          name: "refundStatus",
          type: "select",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Processing", value: "processing" },
            { label: "Processed", value: "processed" },
            { label: "Failed", value: "failed" },
          ],
        },
      ],
    },

    // === PAYMENT GATEWAY RESPONSE ===
    {
      name: "gatewayResponse",
      type: "json",
      admin: {
        description: "Complete response from payment gateway",
      },
    },

    // === INTERNAL TRACKING ===
    {
      name: "attemptNumber",
      type: "number",
      defaultValue: 1,
      admin: {
        description: "Payment attempt number (for retry tracking)",
      },
    },
    {
      name: "ipAddress",
      type: "text",
      admin: {
        description: "Customer IP address during payment",
      },
    },
    {
      name: "userAgent",
      type: "text",
      admin: {
        description: "Customer browser/device information",
      },
    },

    // === NOTES ===
    {
      name: "internalNotes",
      type: "textarea",
      admin: {
        description: "Internal notes about this payment",
      },
    },

    // === RECONCILIATION ===
    {
      name: "reconciliation",
      type: "group",
      admin: {
        description: "Payment reconciliation information",
        position: "sidebar",
      },
      fields: [
        {
          name: "isReconciled",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description: "Has this payment been reconciled?",
          },
        },
        {
          name: "reconciledDate",
          type: "date",
          admin: {
            condition: (data) => data.reconciliation?.isReconciled,
          },
        },
        {
          name: "settlementId",
          type: "text",
          admin: {
            description: "Bank settlement reference",
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create" && !data.transactionId) {
          // Generate transaction ID
          const timestamp = Date.now();
          const random = Math.random().toString(36).substr(2, 6).toUpperCase();
          data.transactionId = `TXN${timestamp}${random}`;
        }
        return data;
      },
    ],
  },
  defaultSort: "-createdAt",
};

export default Payments;
