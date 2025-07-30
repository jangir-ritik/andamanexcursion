# Andaman Excursion Booking System Overview

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Frontend Flow](#frontend-flow)
3. [State Management](#state-management)
4. [Database Collections (PayloadCMS)](#database-collections-payloadcms)
5. [API Endpoints](#api-endpoints)
6. [Implementation Steps](#implementation-steps)

## System Architecture

The booking system follows a modern React/Next.js architecture with the following key components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   State Mgmt    │    │   Backend       │
│                 │    │                 │    │                 │
│ • Activity List │────│ • ActivityStore │────│ • PayloadCMS    │
│ • Cart System   │    │ • CartStore     │    │ • Collections   │
│ • Checkout Flow │    │ • CheckoutStore │    │ • API Routes    │
│ • User Forms    │    │ • Form State    │    │ • Validation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Frontend Flow

### 1. Activity Discovery & Selection

- **Location**: `src/app/(frontend)/activities/`
- **Components**:
  - `ActivityCard`: Displays individual activities
  - `ActivitySearch`: Handles filtering and search
  - `ActivityDetail`: Shows detailed activity information

### 2. Cart Management

- **Location**: `src/store/CartStore.ts`
- **Features**:
  - Add/remove activities
  - Update passenger counts
  - Price calculations
  - Persistent storage

### 3. Checkout Process

- **Location**: `src/app/(frontend)/checkout/`
- **Steps**:
  1. **Member Details** (`MemberDetailsStep/`)
     - Passenger information forms
     - Contact details for primary member
     - Terms acceptance
  2. **Review** (`ReviewStep/`)
     - Summary of booking
     - Final price confirmation
  3. **Payment & Confirmation** (`ConfirmationStep/`)
     - Payment processing
     - Booking confirmation

## State Management

### 1. ActivityStore (`src/store/ActivityStore.ts`)

```typescript
interface ActivityState {
  activities: Activity[];
  searchParams: ActivitySearchParams;
  filters: ActivityFilters;
  isLoading: boolean;
}
```

### 2. CartStore (`src/store/CartStore.ts`)

```typescript
interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

interface CartItem {
  id: string;
  activity: Activity;
  searchParams: ActivitySearchParams;
  quantity: number;
  totalPrice: number;
}
```

### 3. CheckoutStore (`src/store/CheckoutStore.ts`)

```typescript
interface CheckoutState {
  // Multi-activity support
  allCheckoutItems: CheckoutItem[];
  currentActivityIndex: number;

  // Unified member management
  allMembers: MemberDetails[];

  // Booking flow
  currentStep: number;
  termsAccepted: boolean;
  bookingConfirmation: BookingConfirmation | null;
}
```

## Database Collections (PayloadCMS)

### 1. Activities Collection

```typescript
// collections/Activities.ts
export const Activities: CollectionConfig = {
  slug: "activities",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "images",
      type: "array",
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
        },
        {
          name: "alt",
          type: "text",
        },
      ],
    },
    {
      name: "pricing",
      type: "group",
      fields: [
        {
          name: "adultPrice",
          type: "number",
          required: true,
        },
        {
          name: "childPrice",
          type: "number",
          required: true,
        },
        {
          name: "infantPrice",
          type: "number",
          defaultValue: 0,
        },
      ],
    },
    {
      name: "availability",
      type: "group",
      fields: [
        {
          name: "maxCapacity",
          type: "number",
          required: true,
        },
        {
          name: "minBooking",
          type: "number",
          defaultValue: 1,
        },
        {
          name: "advanceBookingDays",
          type: "number",
          defaultValue: 1,
        },
      ],
    },
    {
      name: "location",
      type: "group",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "coordinates",
          type: "point",
        },
      ],
    },
    {
      name: "duration",
      type: "text", // "4 hours", "Full day", etc.
    },
    {
      name: "category",
      type: "select",
      options: [
        { label: "Water Sports", value: "water-sports" },
        { label: "Sightseeing", value: "sightseeing" },
        { label: "Adventure", value: "adventure" },
        { label: "Cultural", value: "cultural" },
      ],
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
    },
  ],
};
```

### 2. Bookings Collection

```typescript
// collections/Bookings.ts
export const Bookings: CollectionConfig = {
  slug: "bookings",
  admin: {
    useAsTitle: "confirmationNumber",
  },
  fields: [
    {
      name: "confirmationNumber",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "bookingDate",
      type: "date",
      required: true,
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Confirmed", value: "confirmed" },
        { label: "Pending", value: "pending" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Completed", value: "completed" },
      ],
      defaultValue: "pending",
    },
    {
      name: "activities",
      type: "array",
      fields: [
        {
          name: "activity",
          type: "relationship",
          relationTo: "activities",
          required: true,
        },
        {
          name: "activityDate",
          type: "date",
          required: true,
        },
        {
          name: "passengers",
          type: "group",
          fields: [
            {
              name: "adults",
              type: "number",
              required: true,
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
          name: "pricing",
          type: "group",
          fields: [
            {
              name: "adultPrice",
              type: "number",
              required: true,
            },
            {
              name: "childPrice",
              type: "number",
              required: true,
            },
            {
              name: "infantPrice",
              type: "number",
              defaultValue: 0,
            },
            {
              name: "totalPrice",
              type: "number",
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "members",
      type: "array",
      fields: [
        {
          name: "fullName",
          type: "text",
          required: true,
        },
        {
          name: "age",
          type: "number",
          required: true,
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
          required: true,
        },
        {
          name: "passportNumber",
          type: "text",
          required: true,
        },
        {
          name: "whatsappNumber",
          type: "text",
        },
        {
          name: "email",
          type: "email",
        },
        {
          name: "isPrimary",
          type: "checkbox",
          defaultValue: false,
        },
      ],
    },
    {
      name: "contactDetails",
      type: "group",
      fields: [
        {
          name: "primaryMemberName",
          type: "text",
          required: true,
        },
        {
          name: "email",
          type: "email",
          required: true,
        },
        {
          name: "whatsappNumber",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "payment",
      type: "group",
      fields: [
        {
          name: "totalAmount",
          type: "number",
          required: true,
        },
        {
          name: "paymentStatus",
          type: "select",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Paid", value: "paid" },
            { label: "Failed", value: "failed" },
            { label: "Refunded", value: "refunded" },
          ],
          defaultValue: "pending",
        },
        {
          name: "paymentMethod",
          type: "select",
          options: [
            { label: "Credit Card", value: "credit-card" },
            { label: "UPI", value: "upi" },
            { label: "Net Banking", value: "net-banking" },
            { label: "Wallet", value: "wallet" },
          ],
        },
        {
          name: "transactionId",
          type: "text",
        },
        {
          name: "paymentDate",
          type: "date",
        },
      ],
    },
    {
      name: "notes",
      type: "textarea",
    },
  ],
};
```

### 3. Media Collection (Built-in)

For storing activity images, documents, etc.

### 4. Users Collection (Built-in)

For admin users, customer accounts (future feature)

## API Endpoints

### 1. Activity Endpoints

```typescript
// app/api/activities/route.ts
GET /api/activities
  - Query params: location, category, date, passengers
  - Returns: Filtered activities with availability

GET /api/activities/[id]
  - Returns: Single activity details

POST /api/activities/search
  - Body: SearchParams
  - Returns: Filtered activities
```

### 2. Booking Endpoints

```typescript
// app/api/bookings/route.ts
POST /api/bookings
  - Body: BookingData
  - Creates new booking
  - Returns: BookingConfirmation

GET /api/bookings/[confirmationNumber]
  - Returns: Booking details

PATCH /api/bookings/[id]
  - Body: Partial booking updates
  - Returns: Updated booking
```

### 3. Availability Endpoints

```typescript
// app/api/availability/route.ts
POST /api/availability/check
  - Body: { activityId, date, passengers }
  - Returns: Available slots and pricing
```

## Implementation Steps

### Phase 1: PayloadCMS Setup

1. **Install PayloadCMS**

   ```bash
   npm install payload @payloadcms/bundler-webpack @payloadcms/richtext-slate
   ```

2. **Configure Collections**

   - Create `collections/Activities.ts`
   - Create `collections/Bookings.ts`
   - Configure admin panel

3. **Setup Environment**
   ```env
   PAYLOAD_SECRET_KEY=your-secret-key
   MONGODB_URI=your-mongodb-connection
   ```

### Phase 2: Backend Integration

1. **Create API Routes**

   ```typescript
   // app/api/activities/route.ts
   import payload from "payload";

   export async function GET(request: Request) {
     const activities = await payload.find({
       collection: "activities",
       where: {
         isActive: { equals: true },
       },
     });
     return Response.json(activities);
   }
   ```

2. **Implement Booking Creation**
   ```typescript
   // app/api/bookings/route.ts
   export async function POST(request: Request) {
     const bookingData = await request.json();

     const booking = await payload.create({
       collection: "bookings",
       data: {
         ...bookingData,
         confirmationNumber: generateConfirmationNumber(),
         bookingDate: new Date().toISOString(),
         status: "confirmed",
       },
     });

     return Response.json(booking);
   }
   ```

### Phase 3: Frontend Integration

1. **Update Stores to Use API**

   ```typescript
   // In CheckoutStore.ts
   submitBooking: async () => {
     const response = await fetch("/api/bookings", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(bookingData),
     });

     const booking = await response.json();
     // Update state with confirmation
   };
   ```

2. **Add Error Handling**
   - Network error handling
   - Validation error display
   - Retry mechanisms

### Phase 4: Payment Integration

1. **Add Payment Gateway** (Razorpay/Stripe)
2. **Implement Payment Flow**
3. **Handle Payment Webhooks**

### Phase 5: Additional Features

1. **Email Notifications**
2. **SMS/WhatsApp Integration**
3. **Booking Management Dashboard**
4. **Analytics and Reporting**

## Key Considerations

### 1. Data Validation

- Frontend validation with Zod schemas
- Backend validation in Payload hooks
- Sanitization of user inputs

### 2. Security

- API rate limiting
- Input sanitization
- Secure payment processing
- GDPR compliance for user data

### 3. Performance

- Database indexing
- Caching strategies
- Image optimization
- API response caching

### 4. Scalability

- Database optimization
- CDN for static assets
- Background job processing
- Horizontal scaling considerations

This architecture provides a solid foundation for the Andaman Excursion booking system with room for future enhancements and scaling.
