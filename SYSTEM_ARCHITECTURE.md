# Andaman Excursion - System Architecture & Documentation

## Overview

This document consolidates all system architecture, implementation details, and technical documentation for the Andaman Excursion booking platform. It replaces multiple fragmented documentation files with a single, comprehensive reference.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Checkout System](#checkout-system)
3. [Ferry Booking System](#ferry-booking-system)
4. [Activity Booking System](#activity-booking-system)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [UI Components](#ui-components)
8. [Database Schema](#database-schema)
9. [Payment Integration](#payment-integration)
10. [Development Guidelines](#development-guidelines)

---

## 1. System Architecture

### High-Level Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   State Mgmt    │    │   Backend       │
│                 │    │                 │    │                 │
│ • Next.js App   │────│ • Zustand       │────│ • API Routes    │
│ • React UI      │    │ • Local State   │    │ • External APIs │
│ • Responsive    │    │ • Form State    │    │ • PayloadCMS    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: CSS Modules with CSS Variables
- **State Management**: Zustand with Immer
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Custom atomic design system
- **Backend**: Next.js API routes, PayloadCMS
- **Payment**: Razorpay integration
- **External APIs**: Ferry operators (Sealink, Makruzz, Green Ocean)

---

## 2. Checkout System

### Strategic Architecture - "Source of Truth" Pattern

The checkout system uses a **simplified adapter pattern** that eliminates complex state management:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ActivityCart  │    │   FerrySession  │    │  CheckoutAdapter│
│   (Source #1)   │────│   (Source #2)   │────│  (Thin Layer)   │
│                 │    │                 │    │                 │
│ • Cart Items    │    │ • Booking Data  │    │ • Route Traffic │
│ • Passengers    │    │ • Seat Selection│    │ • Unify Data    │
│ • Pricing       │    │ • Class Choice  │    │ • Handle Forms  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

1. **CheckoutAdapter** (`src/utils/CheckoutAdapter.ts`)

   - Unified interface for different booking types
   - Eliminates complex state synchronization
   - Provides type-safe data access

2. **SimpleCheckoutStore** (`src/store/SimpleCheckoutStore.ts`)

   - Only handles form state and navigation
   - No business logic or complex metadata computation
   - Bulletproof and performant

3. **SimpleCheckoutFlow** (`src/app/(frontend)/checkout/components/SimpleCheckoutFlow/`)
   - Clean component architecture
   - Props-based data flow
   - No complex state dependencies

### Checkout Flow

```
1. Detect Booking Type (URL: ?type=ferry|activity|mixed)
   ├── CheckoutAdapter.detectBookingType()
   └── Route to appropriate data source

2. Get Unified Data
   ├── Activity: ActivityStore.cart → UnifiedBookingData
   ├── Ferry: FerryStore.bookingSession → UnifiedBookingData
   └── Mixed: Combine both sources

3. Render Forms
   ├── SimpleMemberDetailsStep (step 1)
   ├── SimpleReviewStep (step 2)
   └── ConfirmationStep (step 3)

4. Submit to Payment
   ├── CheckoutAdapter.preparePaymentData()
   └── Razorpay integration
```

### Benefits

- ✅ **Zero Zustand errors** - no complex state dependencies
- ✅ **Simple debugging** - clear data flow
- ✅ **Type-safe** - unified interfaces
- ✅ **Performant** - minimal state management
- ✅ **Extensible** - easy to add new booking types

---

## 3. Ferry Booking System

### Architecture

```
Ferry Search → Operator Aggregation → Unified Results → Booking → Checkout
     ↓               ↓                     ↓           ↓         ↓
   Search API    3 Operators         UnifiedFerry    Session   Adapter
```

### Operators Integration

1. **Sealink** - Fully implemented
2. **Makruzz** - Implemented (currently under maintenance)
3. **Green Ocean** - Fully implemented with seat selection

### Key Features

- **Multi-operator search** with parallel API calls
- **Seat selection** for Green Ocean ferries
- **Real-time pricing** with passenger multipliers
- **Booking sessions** with expiration (30 minutes)
- **Hash-based API authentication** (Green Ocean)

### API Endpoints

- `GET /api/ferry/search` - Search all operators
- `POST /api/ferry/seat-layout` - Get seat layouts
- `POST /api/ferry/booking/create-session` - Create booking session

### Data Flow

```typescript
// 1. Search
FerrySearchParams → FerryAggregationService → UnifiedFerryResult[]

// 2. Selection
UnifiedFerryResult + FerryClass → FerryBookingSession

// 3. Seat Selection (Green Ocean only)
SeatLayoutAPI → SeatSelection → Updated Session

// 4. Checkout
FerryBookingSession → CheckoutAdapter → UnifiedBookingData
```

---

## 4. Activity Booking System

### Architecture

```
Activity Catalog → Cart Management → Checkout → Payment
       ↓               ↓              ↓         ↓
   PayloadCMS     ActivityStore   CheckoutAdapter  Razorpay
```

### Key Features

- **Cart-based booking** with persistence
- **Multi-activity support** in single booking
- **Inventory management** (future enhancement)
- **Dynamic pricing** based on passenger count

### Data Structure

```typescript
interface CartItem {
  id: string;
  activity: Activity;
  searchParams: ActivitySearchParams;
  quantity: number;
  totalPrice: number;
  activityOptionId?: string;
}
```

---

## 5. State Management

### Store Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  ActivityStore  │    │   FerryStore    │    │SimpleCheckoutSt.│
│                 │    │                 │    │                 │
│ • Cart Items    │    │ • Search Data   │    │ • Form State    │
│ • Search State  │    │ • Booking Sess. │    │ • Navigation    │
│ • Pricing       │    │ • Selected Data │    │ • UI State      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Design Principles

1. **Single Responsibility** - each store has one clear purpose
2. **No Cross-Dependencies** - stores don't depend on each other
3. **Minimal State** - only store what's necessary
4. **Type Safety** - full TypeScript coverage
5. **Performance** - selective subscriptions with selectors

### Global Access

For the CheckoutAdapter pattern, stores expose global access:

```typescript
// ActivityStore
window.__ACTIVITY_STORE__ = {
  get cart() {
    return useActivityStore.getState().cart;
  },
  get searchParams() {
    return useActivityStore.getState().searchParams;
  },
};

// FerryStore
window.__FERRY_STORE__ = {
  get bookingSession() {
    return useFerryStore.getState().bookingSession;
  },
  get searchParams() {
    return useFerryStore.getState().searchParams;
  },
};
```

---

## 6. API Integration

### Ferry Operators

#### Green Ocean API

- **Authentication**: Hash-based with public/private keys
- **Endpoints**: Search, seat layout, booking
- **Seat Selection**: Full layout with available/booked/blocked status

#### Sealink API

- **Authentication**: API key based
- **Features**: Search, class selection, pricing

#### Makruzz API

- **Authentication**: Login-based sessions
- **Status**: Currently under maintenance

### Error Handling

```typescript
// Graceful degradation
const searchResults = await Promise.allSettled([
  sealinkSearch(),
  makruzzSearch(),
  greenOceanSearch(),
]);

// Return available results + operator errors
return {
  results: successfulResults,
  operatorErrors: failedOperators,
};
```

---

## 7. UI Components

### Atomic Design Structure

```
components/
├── atoms/           # Basic elements (Button, Input, etc.)
├── molecules/       # Component combinations (Card, FormField, etc.)
├── organisms/       # Complex components (Header, BookingForm, etc.)
└── layout/          # Structural components (Container, Grid, etc.)
```

### Design System

- **CSS Variables** for consistent theming
- **Responsive design** with mobile-first approach
- **Accessibility** compliance (WCAG 2.1)
- **Performance** optimized with CSS Modules

### Key Components

1. **FerryCard** - Display ferry options with pricing
2. **SeatLayoutComponent** - Interactive seat selection
3. **BookingForm** - Unified search form
4. **CheckoutFlow** - Multi-step checkout process

---

## 8. Database Schema (PayloadCMS)

### Collections

#### Activities

```typescript
{
  name: string;
  description: RichText;
  pricing: {
    adultPrice: number;
    childPrice: number;
    infantPrice: number;
  }
  availability: {
    maxCapacity: number;
    minBooking: number;
  }
  location: {
    name: string;
    coordinates: Point;
  }
  category: "water-sports" | "sightseeing" | "adventure" | "cultural";
  isActive: boolean;
}
```

#### Bookings

```typescript
{
  confirmationNumber: string;
  bookingType: 'activity' | 'ferry' | 'mixed';
  bookedActivities: ActivityBooking[];
  bookedFerries: FerryBooking[];
  members: MemberDetails[];
  pricing: {
    totalAmount: number;
  };
  payment: {
    paymentStatus: 'pending' | 'paid' | 'failed';
    transactionId: string;
  };
}
```

#### Activity Inventory (Future)

```typescript
{
  activity: Relationship<Activities>;
  date: string;
  timeSlot: string;
  maxCapacity: number;
  bookedCapacity: number;
  availableCapacity: number;
  status: "available" | "fully-booked" | "cancelled";
}
```

---

## 9. Payment Integration

### Razorpay Integration

#### Flow

```
1. BookingData → Payment Order Creation
2. Razorpay Checkout → User Payment
3. Payment Verification → Booking Confirmation
4. Webhook Handling → Status Updates
```

#### Key Files

- `src/hooks/useRazorpay.ts` - Client-side integration
- `src/app/api/payments/verify/route.ts` - Payment verification
- `src/app/api/payments/webhook/route.ts` - Webhook handling

#### Security

- **Server-side verification** of payment signatures
- **Webhook signature validation** for async updates
- **Booking confirmation** only after successful payment

---

## 10. Development Guidelines

### Code Organization

```
src/
├── app/                 # Next.js 13+ app directory
├── components/          # Reusable UI components
├── store/              # Zustand stores
├── utils/              # Utility functions and adapters
├── services/           # API integration services
├── types/              # TypeScript type definitions
└── styles/             # Global styles and variables
```

### Best Practices

1. **TypeScript First** - Full type coverage
2. **Component Composition** - Prefer composition over inheritance
3. **Error Boundaries** - Graceful error handling
4. **Performance** - Code splitting and lazy loading
5. **Testing** - Unit tests for critical business logic
6. **Documentation** - Keep this document updated

### Git Workflow

```
main (production)
├── develop (integration)
└── feature/checkout-adapter (feature branches)
```

### Environment Variables

```env
# Ferry APIs
GREEN_OCEAN_PUBLIC_KEY=your_public_key
GREEN_OCEAN_PRIVATE_KEY=your_private_key
SEALINK_API_KEY=your_api_key
MAKRUZZ_API_URL=your_api_url

# Payment
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Database
PAYLOAD_SECRET_KEY=your_payload_secret
MONGODB_URI=your_mongodb_connection
```

---

## Implementation Status

### ✅ Completed

- Ferry search and booking system
- Activity cart and checkout
- Unified checkout adapter pattern
- Seat selection for Green Ocean
- Payment integration (Razorpay)
- Responsive UI components

### 🚧 In Progress

- Documentation consolidation
- Testing the new checkout flow

### 📋 Pending

- Activity inventory management
- Email notifications
- PDF ticket generation
- Admin dashboard enhancements
- Performance optimizations

---

## Troubleshooting

### Common Issues

1. **Zustand Store Errors**

   - **Solution**: Use the new CheckoutAdapter pattern
   - **Avoid**: Complex state synchronization between stores

2. **Ferry API Timeouts**

   - **Solution**: Implement proper error handling and fallbacks
   - **Configure**: Appropriate timeout values (5s for API calls)

3. **Checkout Flow Issues**
   - **Solution**: Use SimpleCheckoutStore for form state only
   - **Debug**: Check URL parameters and adapter data flow

### Performance Tips

1. **Lazy Load** non-critical components
2. **Memoize** expensive computations
3. **Use selectors** for Zustand subscriptions
4. **Optimize images** and static assets

---

## 🚀 COMPLETE PAYMENT & BOOKING FLOW

### Payment Integration (Razorpay)

The system uses **real Razorpay payment processing** with ferry provider-specific booking:

#### Payment Flow Steps:

1. **Create Order**: `/api/payments/create-order` - Creates Razorpay order
2. **Payment Modal**: Dynamic Razorpay SDK loading in browser
3. **Payment Processing**: User completes payment via Razorpay
4. **Verification**: `/api/payments/verify` - Verifies payment signature
5. **Provider Booking**: Automatic booking with ferry provider APIs
6. **Confirmation**: Creates booking record in CMS with provider details

#### Environment Variables Required:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Green Ocean API
GREEN_OCEAN_PUBLIC_KEY=your_green_ocean_public_key
GREEN_OCEAN_PRIVATE_KEY=your_green_ocean_private_key

# Sealink API
SEALINK_USERNAME=your_sealink_username
SEALINK_TOKEN=your_sealink_token
SEALINK_AGENCY=your_agency_name

# Makruzz API
MAKRUZZ_USERNAME=your_makruzz_username
MAKRUZZ_PASSWORD=your_makruzz_password
```

### Ferry Provider Integration

#### Green Ocean (Real API Implementation)

- **Booking API**: `/v1/book-ticket` using PHP example implementation
- **Hash Generation**: SHA256 with exact sequence matching
- **Seat Selection**: Full seat layout with real-time booking
- **Passenger Details**: Complete passenger data with passport info

#### Sealink & Makruzz (Placeholder)

- **Ready for Integration**: Service layer prepared
- **Booking Service**: `FerryBookingService` handles all providers
- **Error Handling**: Graceful fallback if provider booking fails

### Reset After Booking

- **Automatic Reset**: `resetAfterBooking()` clears all booking data
- **Store Cleanup**: Resets both ferry and activity stores
- **Navigation**: "Make Another Booking" button returns to appropriate page

## 📧 NOTIFICATION INTEGRATION GUIDE

### Email Notifications

#### Setup Email Service (Recommended: Nodemailer + SMTP)

1. **Install Dependencies**:

```bash
npm install nodemailer @types/nodemailer
```

2. **Create Email Service** (`src/services/notifications/emailService.ts`):

```typescript
import nodemailer from "nodemailer";

export class EmailService {
  private static transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendBookingConfirmation(
    email: string,
    bookingData: any
  ): Promise<void> {
    const html = this.generateBookingEmail(bookingData);

    await this.transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Booking Confirmed - ${bookingData.confirmationNumber}`,
      html,
      attachments: [
        {
          filename: "booking-receipt.pdf",
          content: await this.generatePDF(bookingData),
        },
      ],
    });
  }

  private static generateBookingEmail(data: any): string {
    return `
      <h1>Booking Confirmed!</h1>
      <p>Confirmation Number: ${data.confirmationNumber}</p>
      <p>Booking ID: ${data.bookingId}</p>
      <!-- Add complete email template -->
    `;
  }
}
```

3. **Environment Variables**:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@andamanexcursion.com
```

4. **Integration in Payment Verification**:

```typescript
// In src/app/api/payments/verify/route.ts
import { EmailService } from "@/services/notifications/emailService";

// After successful booking creation
if (bookingData.members?.[0]?.email) {
  try {
    await EmailService.sendBookingConfirmation(
      bookingData.members[0].email,
      bookingRecord
    );
  } catch (emailError) {
    console.error("Email notification failed:", emailError);
    // Don't fail booking for email errors
  }
}
```

### WhatsApp Notifications

#### Option A: WhatsApp Business API (Official)

1. **Setup WhatsApp Business Account**:

   - Apply for WhatsApp Business API access
   - Get API credentials from Meta/Facebook

2. **Create WhatsApp Service** (`src/services/notifications/whatsappService.ts`):

```typescript
export class WhatsAppService {
  private static BASE_URL = "https://graph.facebook.com/v17.0";
  private static ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  private static PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  static async sendBookingConfirmation(
    phoneNumber: string,
    bookingData: any
  ): Promise<void> {
    const message = this.formatBookingMessage(bookingData);

    await fetch(`${this.BASE_URL}/${this.PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: { body: message },
      }),
    });
  }

  private static formatBookingMessage(data: any): string {
    return `🎫 Booking Confirmed!
    
Confirmation: ${data.confirmationNumber}
Booking ID: ${data.bookingId}
Date: ${data.serviceDate}

View details: ${process.env.NEXT_PUBLIC_APP_URL}/booking/${data.bookingId}

Thank you for choosing Andaman Excursion!`;
  }
}
```

3. **Environment Variables**:

```env
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

#### Option B: Third-Party Service (Easier Setup)

Popular options:

- **Twilio WhatsApp API**
- **Gupshup WhatsApp API**
- **MessageBird WhatsApp API**

Example with Twilio:

```typescript
import twilio from "twilio";

export class TwilioWhatsAppService {
  private static client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  static async sendBookingConfirmation(
    phoneNumber: string,
    bookingData: any
  ): Promise<void> {
    await this.client.messages.create({
      from: "whatsapp:" + process.env.TWILIO_WHATSAPP_NUMBER,
      to: "whatsapp:" + phoneNumber,
      body: this.formatBookingMessage(bookingData),
    });
  }
}
```

### Integration Points

#### 1. Payment Verification Hook

```typescript
// In src/app/api/payments/verify/route.ts
// After successful booking
const notifications = [];

if (customerEmail) {
  notifications.push(
    EmailService.sendBookingConfirmation(customerEmail, bookingRecord)
  );
}

if (customerPhone) {
  notifications.push(
    WhatsAppService.sendBookingConfirmation(customerPhone, bookingRecord)
  );
}

// Send notifications in parallel
await Promise.allSettled(notifications);
```

#### 2. Booking Status Updates

```typescript
// Create notification service for updates
export class NotificationService {
  static async sendBookingUpdate(
    bookingId: string,
    status: string,
    message: string
  ): Promise<void> {
    const booking = await getBookingById(bookingId);

    await Promise.allSettled([
      EmailService.sendStatusUpdate(booking.customerEmail, status, message),
      WhatsAppService.sendStatusUpdate(booking.customerPhone, status, message),
    ]);
  }
}
```

#### 3. Webhook Integration

```typescript
// src/app/api/notifications/webhook/route.ts
export async function POST(request: NextRequest) {
  const { bookingId, status, message } = await request.json();

  await NotificationService.sendBookingUpdate(bookingId, status, message);

  return NextResponse.json({ success: true });
}
```

### Email Templates

Create reusable email templates in `src/templates/email/`:

#### Booking Confirmation Template

```html
<!-- src/templates/email/booking-confirmation.html -->
<!DOCTYPE html>
<html>
  <head>
    <style>
      .container {
        max-width: 600px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
      }
      .header {
        background: #3399cc;
        color: white;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 20px;
      }
      .booking-details {
        background: #f5f5f5;
        padding: 15px;
        border-radius: 5px;
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎫 Booking Confirmed!</h1>
      </div>
      <div class="content">
        <p>Dear {{customerName}},</p>
        <p>Your booking has been confirmed. Here are your details:</p>

        <div class="booking-details">
          <h3>Booking Details</h3>
          <p><strong>Confirmation Number:</strong> {{confirmationNumber}}</p>
          <p><strong>Booking ID:</strong> {{bookingId}}</p>
          <p><strong>Service Date:</strong> {{serviceDate}}</p>
          <p><strong>Total Amount:</strong> ₹{{totalAmount}}</p>
        </div>

        <!-- Add ferry/activity specific details -->
      </div>
      <div class="footer">
        <p>Thank you for choosing Andaman Excursion!</p>
      </div>
    </div>
  </body>
</html>
```

This consolidated documentation replaces the following files:

- `ACTIVITIES_BOOKING_ANALYSIS.md`
- `BOOKING_SYSTEM_OVERVIEW.md`
- `checkout_requirements.md`
- `FERRY_STATUS_MONITORING.md`
- `FERRY_SYSTEM_COMPLETE.md`
- `docs/BOOKING_SYSTEM.md`
- `docs/DATA_MANAGEMENT.md`

Keep this document updated as the system evolves.
