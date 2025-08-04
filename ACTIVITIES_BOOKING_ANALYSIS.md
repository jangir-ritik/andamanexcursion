# Activities Booking System Analysis & Implementation Guide

## Overview

This document provides a comprehensive analysis of the current activities booking system and answers key questions about implementation, improvements, and integration with ferry bookings.

## Questions & Answers

### 1. How would PDF download work (defined in confirmation step of checkout page)?

#### Current Implementation

The confirmation step (`src/app/(frontend)/checkout/components/ConfirmationStep/index.tsx`) has a placeholder PDF download button:

```typescript
// Handle download PDF
const handleDownloadPDF = () => {
  console.log("Download PDF functionality to be implemented");
  alert("PDF download functionality will be implemented");
};
```

#### Recommended Implementation

**Step 1: Install PDF Generation Library**

```bash
npm install jspdf html2canvas
# or
npm install puppeteer
# or
npm install @react-pdf/renderer
```

**Step 2: Create PDF Generation Service**

```typescript
// src/services/pdfService.ts
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface BookingPDFData {
  confirmationNumber: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  activities: Array<{
    title: string;
    date: string;
    time: string;
    location: string;
    passengers: number;
    price: number;
  }>;
  totalAmount: number;
  paymentStatus: string;
}

export const generateBookingPDF = async (
  bookingData: BookingPDFData
): Promise<Blob> => {
  // Method 1: Using jsPDF with manual layout
  const pdf = new jsPDF();

  // Add header
  pdf.setFontSize(20);
  pdf.text("Andaman Excursion - Booking Confirmation", 20, 30);

  // Add booking details
  pdf.setFontSize(12);
  pdf.text(`Confirmation Number: ${bookingData.confirmationNumber}`, 20, 50);
  pdf.text(`Booking ID: ${bookingData.bookingId}`, 20, 60);
  pdf.text(`Customer: ${bookingData.customerName}`, 20, 70);

  // Add activities
  let yPosition = 90;
  bookingData.activities.forEach((activity, index) => {
    pdf.text(`Activity ${index + 1}: ${activity.title}`, 20, yPosition);
    pdf.text(
      `Date: ${activity.date} | Time: ${activity.time}`,
      30,
      yPosition + 10
    );
    pdf.text(`Location: ${activity.location}`, 30, yPosition + 20);
    pdf.text(
      `Passengers: ${activity.passengers} | Price: ₹${activity.price}`,
      30,
      yPosition + 30
    );
    yPosition += 50;
  });

  // Add total
  pdf.text(`Total Amount: ₹${bookingData.totalAmount}`, 20, yPosition + 20);

  return pdf.output("blob");
};

// Method 2: Using React PDF (recommended for complex layouts)
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const BookingPDFDocument = ({
  bookingData,
}: {
  bookingData: BookingPDFData;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Andaman Excursion</Text>
        <Text style={styles.subtitle}>Booking Confirmation</Text>
      </View>

      <View style={styles.section}>
        <Text>Confirmation Number: {bookingData.confirmationNumber}</Text>
        <Text>Booking ID: {bookingData.bookingId}</Text>
        <Text>Customer: {bookingData.customerName}</Text>
        <Text>Email: {bookingData.customerEmail}</Text>
      </View>

      {bookingData.activities.map((activity, index) => (
        <View key={index} style={styles.activitySection}>
          <Text style={styles.activityTitle}>
            Activity {index + 1}: {activity.title}
          </Text>
          <Text>Date: {activity.date}</Text>
          <Text>Time: {activity.time}</Text>
          <Text>Location: {activity.location}</Text>
          <Text>Passengers: {activity.passengers}</Text>
          <Text>Price: ₹{activity.price}</Text>
        </View>
      ))}

      <View style={styles.total}>
        <Text style={styles.totalText}>
          Total Amount: ₹{bookingData.totalAmount}
        </Text>
      </View>
    </Page>
  </Document>
);

export const generateReactPDF = async (
  bookingData: BookingPDFData
): Promise<Blob> => {
  const pdfDoc = <BookingPDFDocument bookingData={bookingData} />;
  return await pdf(pdfDoc).toBlob();
};
```

**Step 3: Create API Endpoint for PDF Generation**

```typescript
// src/app/api/bookings/[id]/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { generateReactPDF } from "@/services/pdfService";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayload({ config });

    // Fetch booking data
    const booking = await payload.findByID({
      collection: "bookings",
      id: params.id,
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Transform booking data for PDF
    const pdfData = {
      confirmationNumber: booking.confirmationNumber,
      bookingId: booking.bookingId,
      customerName: booking.customerInfo.primaryContactName,
      customerEmail: booking.customerInfo.customerEmail,
      activities: booking.bookedActivities.map((activity) => ({
        title: activity.activity.title,
        date: activity.scheduledDate,
        time: activity.scheduledTime,
        location: activity.location?.name || "TBD",
        passengers: activity.passengers.adults + activity.passengers.children,
        price: activity.totalPrice,
      })),
      totalAmount: booking.pricing.totalAmount,
      paymentStatus: booking.paymentStatus,
    };

    // Generate PDF
    const pdfBlob = await generateReactPDF(pdfData);
    const buffer = Buffer.from(await pdfBlob.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="booking-${booking.confirmationNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
```

**Step 4: Update Confirmation Component**

```typescript
// Update handleDownloadPDF function in ConfirmationStep
const handleDownloadPDF = async () => {
  try {
    setIsDownloading(true);

    const response = await fetch(
      `/api/bookings/${bookingConfirmation.bookingId}/pdf`
    );

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-${bookingConfirmation.confirmationNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF download error:", error);
    alert("Failed to download PDF. Please try again.");
  } finally {
    setIsDownloading(false);
  }
};
```

---

### 2. Activity Inventory Management - Implementation Guide

#### Current Status

The `ActivityInventory` collection exists (`src/app/(payload)/collections/ActivityInventory.ts`) but is **not being used** in the booking flow.

#### What Needs to Be Changed

**Step 1: Integrate Inventory Checks in Activity Search**

```typescript
// src/services/api/activities.ts - Update search function
export const searchActivities = async (searchParams: ActivitySearchParams) => {
  const payload = await getPayload({ config });

  // Get activities
  const activities = await payload.find({
    collection: "activities",
    where: {
      // existing filters
    },
  });

  // Check inventory for each activity
  const activitiesWithAvailability = await Promise.all(
    activities.docs.map(async (activity) => {
      const inventory = await payload.find({
        collection: "activity-inventory",
        where: {
          activity: { equals: activity.id },
          date: { equals: searchParams.date },
          timeSlot: searchParams.time
            ? { equals: searchParams.time }
            : undefined,
          isActive: { equals: true },
          status: { equals: "available" },
        },
      });

      const availableCapacity = inventory.docs.reduce(
        (sum, inv) => sum + (inv.availableCapacity || 0),
        0
      );

      return {
        ...activity,
        availableCapacity,
        isAvailable:
          availableCapacity >= searchParams.adults + searchParams.children,
      };
    })
  );

  return activitiesWithAvailability.filter((activity) => activity.isAvailable);
};
```

**Step 2: Reserve Inventory on Add to Cart**

```typescript
// src/store/ActivityStore.ts - Update addToCart action
addToCart: async (activity, quantity, activityOptionId, customSearchParams) => {
  const searchParams = customSearchParams || get().searchParams;

  try {
    // Reserve inventory
    const reservationResponse = await fetch("/api/inventory/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityId: activity.id,
        date: searchParams.date,
        timeSlot: searchParams.time,
        passengerCount: searchParams.adults + searchParams.children,
        reservationDuration: 15, // minutes
      }),
    });

    if (!reservationResponse.ok) {
      throw new Error("Failed to reserve inventory");
    }

    const reservation = await reservationResponse.json();

    // Add to cart with reservation ID
    const cartItemId = generateCartItemId();
    const totalPrice = calculateTotalPrice(
      activity,
      searchParams,
      activityOptionId,
      quantity
    );

    set((state) => {
      const newItem: CartItem = {
        id: cartItemId,
        activity,
        quantity,
        totalPrice,
        activityOptionId,
        searchParams: { ...searchParams },
        addedAt: new Date().toISOString(),
        reservationId: reservation.reservationId, // New field
        reservationExpiry: reservation.expiryTime,
      };

      state.cart.push(newItem);
    });
  } catch (error) {
    console.error("Failed to add to cart:", error);
    // Show error to user
  }
};
```

**Step 3: Create Inventory Management APIs**

```typescript
// src/app/api/inventory/reserve/route.ts
export async function POST(request: NextRequest) {
  const { activityId, date, timeSlot, passengerCount, reservationDuration } =
    await request.json();

  const payload = await getPayload({ config });

  // Find inventory slot
  const inventory = await payload.find({
    collection: "activity-inventory",
    where: {
      activity: { equals: activityId },
      date: { equals: date },
      timeSlot: timeSlot ? { equals: timeSlot } : undefined,
      isActive: { equals: true },
    },
  });

  if (inventory.docs.length === 0) {
    return NextResponse.json({ error: "No inventory found" }, { status: 404 });
  }

  const inventorySlot = inventory.docs[0];

  if (inventorySlot.availableCapacity < passengerCount) {
    return NextResponse.json(
      { error: "Insufficient capacity" },
      { status: 400 }
    );
  }

  // Reserve capacity
  const reservationId = `RES_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  const expiryTime = new Date(Date.now() + reservationDuration * 60 * 1000);

  await payload.update({
    collection: "activity-inventory",
    id: inventorySlot.id,
    data: {
      reservedCapacity: (inventorySlot.reservedCapacity || 0) + passengerCount,
    },
  });

  // Create reservation record (you may want a separate collection for this)
  const reservation = await payload.create({
    collection: "inventory-reservations", // New collection needed
    data: {
      reservationId,
      activityInventory: inventorySlot.id,
      passengerCount,
      expiryTime: expiryTime.toISOString(),
      status: "active",
    },
  });

  return NextResponse.json({
    reservationId,
    expiryTime: expiryTime.toISOString(),
  });
}

// src/app/api/inventory/release/route.ts
export async function POST(request: NextRequest) {
  const { reservationId } = await request.json();

  // Release reserved inventory
  // Implementation similar to above
}
```

**Step 4: Update Booking Confirmation to Update Inventory**

```typescript
// In src/app/api/payments/verify/route.ts
// After successful booking creation, update inventory
const updateInventoryPromises = bookingData.activities.map(async (activity) => {
  const inventorySlots = await payload.find({
    collection: "activity-inventory",
    where: {
      activity: { equals: activity.activityBooking.activity.id },
      date: { equals: activity.activityBooking.searchParams.date },
    },
  });

  if (inventorySlots.docs.length > 0) {
    const slot = inventorySlots.docs[0];
    await payload.update({
      collection: "activity-inventory",
      id: slot.id,
      data: {
        bookedCapacity:
          (slot.bookedCapacity || 0) +
          (activity.activityBooking.searchParams.adults +
            activity.activityBooking.searchParams.children),
        reservedCapacity: Math.max(
          0,
          (slot.reservedCapacity || 0) -
            (activity.activityBooking.searchParams.adults +
              activity.activityBooking.searchParams.children)
        ),
      },
    });
  }
});

await Promise.all(updateInventoryPromises);
```

#### Additional Collections Needed

**Inventory Reservations Collection**

```typescript
// src/app/(payload)/collections/InventoryReservations.ts
const InventoryReservations: CollectionConfig = {
  slug: "inventory-reservations",
  fields: [
    {
      name: "reservationId",
      type: "text",
      unique: true,
      required: true,
    },
    {
      name: "activityInventory",
      type: "relationship",
      relationTo: "activity-inventory",
      required: true,
    },
    {
      name: "passengerCount",
      type: "number",
      required: true,
    },
    {
      name: "expiryTime",
      type: "date",
      required: true,
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Confirmed", value: "confirmed" },
        { label: "Expired", value: "expired" },
        { label: "Released", value: "released" },
      ],
      defaultValue: "active",
    },
  ],
};
```

---

### 3. Webhook Route Usage Analysis

#### Current Status: **YES, the webhook route IS being used**

The webhook route (`src/app/api/payments/webhook/route.ts`) is a **complete and functional implementation** that handles Razorpay webhook events. Here's the analysis:

#### What the Webhook Does:

1. **Verifies Razorpay signatures** for security
2. **Handles multiple payment events**:
   - `payment.captured` - Updates payment and booking status to confirmed
   - `payment.failed` - Marks payment and booking as failed/cancelled
   - `order.paid` - Alternative payment confirmation
   - `refund.created` - Processes refunds

#### How It's Different from Verify Route:

- **Verify Route** (`/api/payments/verify`): Handles immediate payment verification after user completes payment
- **Webhook Route** (`/api/payments/webhook`): Handles asynchronous notifications from Razorpay

#### Why Both Are Needed:

1. **Verify Route**: Immediate feedback to user after payment
2. **Webhook Route**: Ensures payment status is updated even if user closes browser before verification completes

#### Current Integration Status:

The webhook is properly implemented but you need to:

1. **Configure webhook URL in Razorpay Dashboard**: `https://yourdomain.com/api/payments/webhook`
2. **Set environment variable**: `RAZORPAY_WEBHOOK_SECRET`
3. **Enable webhook events** in Razorpay Dashboard:
   - payment.captured
   - payment.failed
   - order.paid
   - refund.created

---

### 4. Cart Persistence Analysis

#### Current Status: **Cart is NOT persisted** - stored only in Zustand state

The cart data is managed by:

- `ActivityStore` (Zustand) - Main cart state
- `CheckoutStore` (Zustand) - Checkout-specific state
- No persistence to localStorage or database

#### UX Problems Without Persistence:

1. **Cart lost on page refresh**
2. **Cart lost when user navigates away**
3. **No cart recovery**
4. **Poor mobile experience** (background app termination)

#### Recommended Solution: **Hybrid Approach**

**Option 1: localStorage + Session Tracking (Recommended)**

```typescript
// src/utils/cartPersistence.ts
export const CART_STORAGE_KEY = "andaman_cart";
export const SESSION_STORAGE_KEY = "andaman_session";

export interface PersistedCartData {
  cartItems: CartItem[];
  lastUpdated: string;
  sessionId: string;
  expiryTime: string;
}

export const saveCartToStorage = (cartData: PersistedCartData) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

export const loadCartFromStorage = (): PersistedCartData | null => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return null;

    const data: PersistedCartData = JSON.parse(stored);

    // Check if expired (24 hours)
    if (new Date(data.expiryTime) < new Date()) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    return null;
  }
};

// Update ActivityStore to use persistence
export const useActivityStore = create<ActivityStore>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // ... existing state

        // Enhanced addToCart with persistence
        addToCart: async (
          activity,
          quantity,
          activityOptionId,
          customSearchParams
        ) => {
          // ... existing logic

          // After adding to cart, persist
          const currentCart = get().cart;
          const sessionId = getOrCreateSessionId();

          const persistedData: PersistedCartData = {
            cartItems: currentCart,
            lastUpdated: new Date().toISOString(),
            sessionId,
            expiryTime: new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ).toISOString(),
          };

          saveCartToStorage(persistedData);

          // Optionally sync with backend
          await syncCartWithBackend(sessionId, currentCart);
        },

        // Load cart on initialization
        initializeCart: () => {
          const storedCart = loadCartFromStorage();
          if (storedCart) {
            set((state) => {
              state.cart = storedCart.cartItems;
              state.sessionId = storedCart.sessionId;
            });
          }
        },
      })),
      {
        name: "activity-cart-storage",
        partialize: (state) => ({
          cart: state.cart,
          sessionId: state.sessionId,
        }),
      }
    )
  )
);
```

**Option 2: Backend Session Management**

```typescript
// Create booking sessions for anonymous users
// Use existing BookingSessions collection

// src/hooks/useCartSession.ts
export const useCartSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  const createOrUpdateSession = async (cartItems: CartItem[]) => {
    const payload = await getPayloadClient();

    if (sessionId) {
      // Update existing session
      await payload.update({
        collection: "booking-sessions",
        id: sessionId,
        data: {
          cartItems: cartItems.map((item) => ({
            activity: item.activity.id,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            searchParams: item.searchParams,
            addedAt: item.addedAt,
          })),
          lastActivity: new Date().toISOString(),
        },
      });
    } else {
      // Create new session
      const session = await payload.create({
        collection: "booking-sessions",
        data: {
          status: "active",
          cartItems: cartItems.map((item) => ({
            activity: item.activity.id,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            searchParams: item.searchParams,
            addedAt: item.addedAt,
          })),
          deviceInfo: {
            userAgent: navigator.userAgent,
            sessionStarted: new Date().toISOString(),
          },
        },
      });

      setSessionId(session.id);
    }
  };

  return { sessionId, createOrUpdateSession };
};
```

#### Best Approach:

1. **Use localStorage for immediate persistence**
2. **Create anonymous sessions for cart recovery**
3. **Implement cart expiry (24 hours)**
4. **Add cart recovery prompts**
5. **Sync cart before checkout**

---

### 5. Email Notification System Implementation

#### Current Status: **No email system implemented**

While email fields are captured throughout the system, there's no actual email sending functionality.

#### Recommended Implementation

**Step 1: Choose Email Service**

```bash
# Option 1: SendGrid (Recommended)
npm install @sendgrid/mail

# Option 2: Nodemailer + SMTP
npm install nodemailer
npm install @types/nodemailer

# Option 3: Resend (Modern alternative)
npm install resend
```

**Step 2: Create Email Service**

```typescript
// src/services/emailService.ts
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export interface BookingEmailData {
  customerEmail: string;
  customerName: string;
  confirmationNumber: string;
  bookingId: string;
  activities: Array<{
    title: string;
    date: string;
    time: string;
    location: string;
  }>;
  totalAmount: number;
}

export const sendBookingConfirmationEmail = async (data: BookingEmailData) => {
  const msg = {
    to: data.customerEmail,
    from: {
      email: "bookings@andamanexcursion.com",
      name: "Andaman Excursion",
    },
    subject: `Booking Confirmed - ${data.confirmationNumber}`,
    html: generateBookingEmailHTML(data),
    text: generateBookingEmailText(data),
  };

  try {
    await sgMail.send(msg);
    console.log("Booking confirmation email sent:", data.customerEmail);
  } catch (error) {
    console.error("Failed to send booking email:", error);
    throw error;
  }
};

const generateBookingEmailHTML = (data: BookingEmailData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .header { background-color: #007bff; color: white; padding: 20px; }
        .content { padding: 20px; }
        .activity { border: 1px solid #ddd; margin: 10px 0; padding: 15px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Booking Confirmed!</h1>
      </div>
      
      <div class="content">
        <p>Dear ${data.customerName},</p>
        
        <p>Your booking has been confirmed. Here are your details:</p>
        
        <p><strong>Confirmation Number:</strong> ${data.confirmationNumber}</p>
        <p><strong>Booking ID:</strong> ${data.bookingId}</p>
        
        <h3>Activities Booked:</h3>
        ${data.activities
          .map(
            (activity, index) => `
          <div class="activity">
            <h4>Activity ${index + 1}: ${activity.title}</h4>
            <p><strong>Date:</strong> ${activity.date}</p>
            <p><strong>Time:</strong> ${activity.time}</p>
            <p><strong>Location:</strong> ${activity.location}</p>
          </div>
        `
          )
          .join("")}
        
        <p><strong>Total Amount:</strong> ₹${data.totalAmount}</p>
        
        <p>You will receive your e-tickets via WhatsApp shortly.</p>
        
        <p>Thank you for choosing Andaman Excursion!</p>
      </div>
      
      <div class="footer">
        <p>Andaman Excursion | andamanexcursion@gmail.com | +91-XXXXXXXXXX</p>
      </div>
    </body>
    </html>
  `;
};
```

**Step 3: Create Email Templates Collection (Optional)**

```typescript
// src/app/(payload)/collections/EmailTemplates.ts
const EmailTemplates: CollectionConfig = {
  slug: "email-templates",
  admin: {
    group: "Communications",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "subject",
      type: "text",
      required: true,
    },
    {
      name: "htmlTemplate",
      type: "textarea",
      required: true,
      admin: {
        description: "HTML template with Handlebars syntax",
      },
    },
    {
      name: "textTemplate",
      type: "textarea",
      admin: {
        description: "Plain text version",
      },
    },
    {
      name: "variables",
      type: "json",
      admin: {
        description: "Available template variables",
      },
    },
  ],
};
```

**Step 4: Create Notification Queue System**

```typescript
// src/app/api/notifications/send/route.ts
export async function POST(request: NextRequest) {
  const { type, data } = await request.json();

  try {
    switch (type) {
      case "booking_confirmation":
        await sendBookingConfirmationEmail(data);
        break;
      case "payment_failed":
        await sendPaymentFailedEmail(data);
        break;
      case "booking_reminder":
        await sendBookingReminderEmail(data);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification sending failed:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
```

**Step 5: Integrate with Booking Flow**

```typescript
// In src/app/api/payments/verify/route.ts
// After successful booking creation
try {
  // Send email notification
  await fetch("/api/notifications/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "booking_confirmation",
      data: {
        customerEmail: bookingRecord.customerInfo.customerEmail,
        customerName: bookingRecord.customerInfo.primaryContactName,
        confirmationNumber: bookingRecord.confirmationNumber,
        bookingId: bookingRecord.bookingId,
        activities: bookingRecord.bookedActivities.map((activity) => ({
          title: activity.activity.title,
          date: activity.scheduledDate || bookingRecord.serviceDate,
          time: activity.scheduledTime || "TBD",
          location: activity.location?.name || "TBD",
        })),
        totalAmount: bookingRecord.pricing.totalAmount,
      },
    }),
  });
} catch (emailError) {
  console.error("Failed to send booking confirmation email:", emailError);
  // Don't fail the booking if email fails
}
```

#### Do You Need a Notifications Collection?

**Not required, but recommended for:**

- Email delivery tracking
- Retry failed emails
- Email analytics
- Template management

---

### 6. Ferry Checkout Integration Strategy

#### Current Ferry Implementation Status

- Ferry UI components exist (`src/components/molecules/Cards/FerryCard/`)
- Ferry service exists (`src/services/ferryService.ts`)
- Ferry booking hook exists but is commented out (`src/hooks/useFerryBooking.ts`)
- Ferry pages exist (`src/app/(frontend)/ferry/`)

#### Recommendation: **Reuse Existing Checkout System**

The existing checkout system is already designed to be modular and can handle different booking types:

#### Current System Supports Multiple Booking Types:

```typescript
// From Bookings collection
bookingType: "select",
options: [
  { label: "Activity", value: "activity" },
  { label: "Ferry", value: "ferry" },    // Already supported!
  { label: "Package", value: "package" },
  { label: "Mixed", value: "mixed" },
]
```

#### Implementation Strategy:

**Step 1: Extend CheckoutStore for Ferry Support**

```typescript
// src/store/CheckoutStore.ts - Add ferry support
export interface FerryBooking {
  id: string;
  ferry: Ferry;
  searchParams: FerrySearchParams;
  selectedClass: string;
  passengerCount: number;
  totalPrice: number;
  seatSelections?: SeatSelection[];
}

export interface CheckoutItem {
  type: "activity" | "ferry";
  activityBooking?: ActivityBooking;
  ferryBooking?: FerryBooking; // Add ferry support
}

// Update store actions
const useCheckoutStore = create<CheckoutStore>()(
  immer((set, get) => ({
    // ... existing code

    initializeFromFerryCart: (ferryCartItems: FerryCartItem[]) => {
      set((state) => {
        state.bookingType = "ferry";
        state.activities = ferryCartItems.map((cartItem) => ({
          type: "ferry" as BookingType,
          ferryBooking: {
            id: cartItem.id,
            ferry: cartItem.ferry,
            searchParams: cartItem.searchParams,
            selectedClass: cartItem.selectedClass,
            passengerCount: cartItem.passengerCount,
            totalPrice: cartItem.totalPrice,
            seatSelections: cartItem.seatSelections,
          },
        }));

        // Compute metadata for forms
        state.ferryMetadata = computeFerryMetadata(state.activities);
        state.isInitialized = true;
      });
    },

    initializeFromMixedCart: (
      activityItems: ActivityCartItem[],
      ferryItems: FerryCartItem[]
    ) => {
      set((state) => {
        state.bookingType = "mixed";
        state.activities = [
          ...activityItems.map((item) => ({
            type: "activity",
            activityBooking: item,
          })),
          ...ferryItems.map((item) => ({ type: "ferry", ferryBooking: item })),
        ];
        state.isInitialized = true;
      });
    },
  }))
);
```

**Step 2: Update Checkout Components for Ferry Support**

```typescript
// src/app/(frontend)/checkout/components/ReviewStep/index.tsx
const ReviewStep = () => {
  const checkoutItems = useCheckoutItems();

  const renderBookingItem = (item: CheckoutItem, index: number) => {
    if (item.type === "activity" && item.activityBooking) {
      return <ActivityBookingCard key={index} booking={item.activityBooking} />;
    }

    if (item.type === "ferry" && item.ferryBooking) {
      return <FerryBookingCard key={index} booking={item.ferryBooking} />;
    }

    return null;
  };

  return (
    <div className={styles.reviewStep}>
      {checkoutItems.map((item, index) => renderBookingItem(item, index))}
    </div>
  );
};

// Create FerryBookingCard component
const FerryBookingCard = ({ booking }: { booking: FerryBooking }) => (
  <div className={styles.bookingCard}>
    <h4>{booking.ferry.name}</h4>
    <p>
      Route: {booking.ferry.route.from} → {booking.ferry.route.to}
    </p>
    <p>Date: {booking.searchParams.date}</p>
    <p>Time: {booking.searchParams.time}</p>
    <p>Class: {booking.selectedClass}</p>
    <p>Passengers: {booking.passengerCount}</p>
    <p>Price: ₹{booking.totalPrice}</p>
  </div>
);
```

**Step 3: Update Member Details Step**

```typescript
// The member details step can remain the same since it's generic
// Ferry bookings will just use the same passenger information
```

**Step 4: Update Payment Processing**

```typescript
// src/app/api/payments/verify/route.ts
// Add ferry booking support

const createBookingRecord = async (bookingData: any, payload: any) => {
  const bookingType = determineBookingType(bookingData);

  if (bookingType === "ferry") {
    return await payload.create({
      collection: "bookings",
      data: {
        // ... common fields
        bookingType: "ferry",
        bookedFerries: await Promise.all(
          bookingData.ferries?.map(async (ferry: any) => ({
            ferry: await getFerryId(ferry.ferry.id),
            route: ferry.searchParams.route,
            travelDate: ferry.searchParams.date,
            travelTime: ferry.searchParams.time,
            selectedClass: ferry.selectedClass,
            passengerCount: ferry.passengerCount,
            totalPrice: ferry.totalPrice,
            seatSelections: ferry.seatSelections,
          }))
        ),
      },
    });
  }

  if (bookingType === "mixed") {
    return await payload.create({
      collection: "bookings",
      data: {
        // ... common fields
        bookingType: "mixed",
        bookedActivities: await processActivities(bookingData.activities),
        bookedFerries: await processFerries(bookingData.ferries),
      },
    });
  }

  // Handle activity bookings (existing code)
};
```

**Step 5: Create Ferry-Specific Collections (if needed)**

```typescript
// src/app/(payload)/collections/Ferries.ts
const Ferries: CollectionConfig = {
  slug: "ferries",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "operator",
      type: "text",
      required: true,
    },
    {
      name: "route",
      type: "group",
      fields: [
        {
          name: "from",
          type: "relationship",
          relationTo: "locations",
          required: true,
        },
        {
          name: "to",
          type: "relationship",
          relationTo: "locations",
          required: true,
        },
      ],
    },
    {
      name: "classes",
      type: "array",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "price",
          type: "number",
          required: true,
        },
        {
          name: "capacity",
          type: "number",
          required: true,
        },
      ],
    },
    {
      name: "schedule",
      type: "array",
      fields: [
        {
          name: "departureTime",
          type: "text",
          required: true,
        },
        {
          name: "arrivalTime",
          type: "text",
          required: true,
        },
        {
          name: "operatingDays",
          type: "array",
          fields: [
            {
              name: "day",
              type: "select",
              options: [
                { label: "Monday", value: "monday" },
                // ... other days
              ],
            },
          ],
        },
      ],
    },
  ],
};
```

#### Benefits of Reusing Checkout System:

1. **Consistent UX** across activity and ferry bookings
2. **Shared member details** - same form for all booking types
3. **Unified payment processing**
4. **Mixed bookings support** (activities + ferries in one order)
5. **Shared infrastructure** (email notifications, PDF generation, etc.)

#### What Needs to Be Updated:

1. ✅ **CheckoutStore** - Add ferry support (extend existing types)
2. ✅ **Review Step** - Add ferry booking cards
3. ✅ **Payment APIs** - Handle ferry bookings
4. ✅ **Booking Collection** - Already supports ferry type
5. ✅ **Email Templates** - Add ferry booking templates

---

## Implementation Priority

### Phase 1: Critical (Immediate)

1. **Fix PDF Download** - Users expect this functionality
2. **Implement Cart Persistence** - Critical UX issue
3. **Configure Webhook** - Ensure payment reliability

### Phase 2: Important (Next Sprint)

4. **Email Notifications** - Professional booking experience
5. **Activity Inventory** - Prevent overbooking

### Phase 3: Enhancement (Future)

6. **Ferry Integration** - Expand service offerings

---

## Environment Variables Needed

```env
# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=bookings@andamanexcursion.com

# Razorpay Webhook
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# PDF Generation (if using external service)
PDF_SERVICE_API_KEY=your_pdf_service_key
```

---

## Database Migrations Needed

1. **Add reservationId to CartItem interface**
2. **Create InventoryReservations collection**
3. **Create EmailTemplates collection (optional)**
4. **Create Ferries collection**
5. **Add ferry fields to Bookings collection**

---

## Testing Strategy

1. **PDF Generation**: Test with real booking data
2. **Inventory Management**: Test capacity limits and reservations
3. **Email Notifications**: Test with different email providers
4. **Cart Persistence**: Test browser refresh, navigation
5. **Ferry Bookings**: Test mixed bookings (activities + ferries)

This comprehensive implementation guide should address all your questions and provide a clear roadmap for enhancing the activities booking system.
