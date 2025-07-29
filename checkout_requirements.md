# Multi-Step Checkout Form - Requirements Document

## Overview

Create a 3-step checkout form for ferry booking with member details collection, review, and confirmation pages.
Check plan your trip, contact, atomic components, variables.css for fields and other components
The user is being navigated from activities/search page. The cart stores details about the selected activity (cart is defined in a zustand store inside of store/activityStore). This data needs to be stored in backend (mongodb via payload collections)
NOTE - Currently, only activity flow is created, a similar flow is to be created for ferries. Checkout page must be able to distinguish from where the user is coming and what is in the cart. (The cart is not global right now, what do you recommend? creating different stores for ferry and activity) Or have a single one? Activities are fetched from own payload collection, but ferries are to be fetched from external APIs (makruzz, green ocean and one another) 

## Technical Stack

- **TypeScript** - Full type safety
- **CSS Modules** - Component-scoped styling
- **CSS Variables** - Consistent design tokens
- **Radix Primitives** - Accessible UI components
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Zustand** - Global state management (if needed)

## User Flow

1. **Step 1**: Enter member details
2. **Step 2**: Review entered information
3. **Step 3**: Booking confirmation with details

## Detailed Requirements

### Step 1: Member Details Form

#### Layout & Structure

- **Progress Indicator**: 3-step horizontal progress bar with current step highlighted
- **Page Title**: "Add Member Details" with orange underline styling
- **Description**: Explanatory text about filling traveler information
- **Form Sections**: Dynamic member forms (Adult 1, Adult 2, Kid 1, etc.)

#### Form Fields per Member

**Basic Details Section:**

- **Full Name** (required)

  - Type: Text input
  - Validation: Required, min 2 characters
  - Placeholder: "Enter full name as per ID"

- **Age** (required)

  - Type: Number input
  - Validation: Required, 1-120 years
  - Auto-categorization: Adult (18+), Kid (<18)

- **Gender** (required)

  - Type: Select dropdown
  - Options: Male, Female, Other
  - Default: No selection

- **Nationality** (required)

  - Type: Select dropdown with search
  - Default: "Indian"
  - Options: All countries list

- **Passport Number** (required)
  - Type: Text input
  - Validation: Alphanumeric, 6-12 characters
  - Format: Uppercase transformation

**Contact Details Section:**

- **WhatsApp Number** (required for primary member)

  - Type: Phone input with country code
  - Validation: Valid phone format
  - Note: "Ticket will be sent via WhatsApp"

- **Email ID** (required for primary member)
  - Type: Email input
  - Validation: Valid email format
  - Optional for additional members

#### Dynamic Member Management

- **Member Count**: Show the number of members selected from the cart summary
- **Member Categories**: Auto-detect Adult/Kid based on age (from the cart summary)
- **Pricing Display**: Show per-person pricing if applicable (althought it will be populated from the cart summary)

#### Terms & Conditions Section

- **Cancellation Policy**:
  - 48+ hours before departure: ₹250 per ticket
  - 24-48 hours before: 50% of ticket price
  - <24 hours: 100% of ticket price (no refund)
- **Checkbox**: "I agree with the Terms & Conditions" (required)
- **Link**: Clickable terms link

#### Form Validation Rules

```typescript
// Zod Schema Example
const memberSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(1).max(120),
  gender: z.enum(["Male", "Female", "Other"]),
  nationality: z.string().min(1, "Please select nationality"),
  passportNumber: z
    .string()
    .regex(/^[A-Z0-9]{6,12}$/, "Invalid passport format"),
  whatsappNumber: z.string().optional(),
  email: z.string().email().optional(),
});
```

### Step 2: Review Page

- **Display Only**: Show all entered information in read-only format
- **Edit Functionality**: Allow going back to Step 1 for modifications
- **Validation**: Ensure all required fields are complete
- **Summary**: Trip details, member count, total pricing (from the cart summary)

### Step 3: Confirmation Page

#### Booking Details Card (can be multiple cards)

- **Service Name**: activity name from the cart summary
- **Location**: location from the cart summary
- **Schedule**: Date, time, duration from the cart summary
- **Booking ID**: Generated unique identifier for the booking

#### Guest Information Display

- **Member Cards**: Each traveler in separate card
- **Information per Member**:
  - Name, age, gender
  - Contact details (phone, email)
  - Passport number
  - Contact info shows "NA" for non-primary members without details

#### Important Instructions Section

- **Arrival Instructions**: Boarding time requirements
- **Policy Reminders**: No-show policy
- **Requirements**: ID carrying, e-ticket, baggage limits
- **Updates**: Weather and contact information

#### Actions

- **Download PDF**: Generate booking confirmation
- **Print Option**: Browser print functionality

## Component Architecture

### Core Components

```
CheckoutFlow/
├── index.tsx
├── CheckoutFlow.module.css
├── components/
│   ├── ProgressIndicator/
│   ├── MemberForm/
│   ├── ReviewPage/
│   ├── ConfirmationPage/
│   └── shared/
│       ├── FormField/
│       ├── Button/
│       └── Card/
├── hooks/
│   ├── useCheckoutForm.ts
│   └── useBookingState.ts
├── schemas/
│   └── memberValidation.ts
└── types/
    └── checkout.types.ts
```

### State Management

```typescript
// Zustand Store (if needed)
interface CheckoutStore {
  currentStep: number;
  members: Member[];
  bookingDetails: BookingDetails;
  actions: {
    setStep: (step: number) => void;
    addMember: (member: Member) => void;
    updateMember: (index: number, member: Member) => void;
    removeMember: (index: number) => void;
  };
}
```

## Styling Requirements

look at the existing styles in the project and use them for the checkout page (variables.css)

### Responsive Design

- **Mobile First**: Design for mobile, enhance for desktop
- **Breakpoints**:
  - Mobile: <768px
  - Tablet: 768px-1024px
  - Desktop: >1024px
- **Form Layout**: Stack fields vertically on mobile, 2-column on desktop

## Accessibility Requirements

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader**: Proper ARIA labels and descriptions
- **Focus Management**: Clear focus indicators
- **Error Handling**: Clear error messages with proper ARIA attributes
- **Color Contrast**: WCAG AA compliance

## Performance Considerations

- **Form Persistence**: Save form data in session storage as backup
- **Lazy Loading**: Load steps on demand
- **Debounced Validation**: Avoid excessive validation calls
- **Optimistic Updates**: Update UI immediately, validate asynchronously

## Testing Requirements

- **Unit Tests**: All validation functions and utilities
- **Integration Tests**: Form submission flow
- **Accessibility Tests**: Screen reader and keyboard navigation
- **Cross-browser Testing**: Chrome, Firefox, Safari, Edge

## API Integration Points

- **Country List**: Fetch countries for nationality dropdown (already integrated in contact page)
- **Form Submission**: POST member details to booking endpoint
- **Booking Confirmation**: GET booking details for confirmation page
- **PDF Generation**: Generate and download booking PDF

## Error Handling

- **Validation Errors**: Show field-level errors inline
- **Network Errors**: Show retry mechanism for API failures
- **Session Timeout**: Handle expired sessions gracefully
- **Browser Compatibility**: Fallbacks for unsupported features

## Security Considerations

- **Data Sanitization**: Clean all user inputs
- **HTTPS Only**: Ensure secure data transmission
- **No Sensitive Data**: Don't store payment info in client state
- **Input Validation**: Both client and server-side validation

Desktop Layout Specifications
Page 1: Member Details Form Layout
Header Section

Container: Max-width container (likely 1200px) with horizontal padding

Main Content Area

Progress Indicator: (already integrated in the codebase, in plan your trip. Get it from there)

Positioned at top of main content
3 circular steps connected by horizontal lines
Step 1 highlighted in orange, Steps 2-3 in gray
Labels below each circle: "Enter your details", "Review", "Checkout" (already integrated in the codebase, in plan your trip. Get it from there, labels might be different)

Page Header:

Large heading "Add Member Details" with orange underline decoration (already integrated in the codebase as SectionTitle, in plan your trip. Get it from there, text might be different)
Subtitle paragraph explaining the purpose

Form Layout Structure

Single-Column Grid Layout:

Member forms
Terms & conditions section
Gap between columns: ~54px

Individual Member Form Cards

Card Container: Accordion with white background with subtle border/shadow
Card Header: Member type label (Adult 1, Adult 2, Kid 1, carat icons)
Form Grid Inside Card:

Fields by group : Basic Details (Full Name, Age, Gender, Nationality, Passport Number)
, Contact Details (WhatsApp Number, Email ID)
The fields are already integrated in the codebase. Check 'plan your trip' and 'contact' page for the fields.

Small helper text below WhatsApp field

Sticky Footer Section

Terms & Conditions Card:

White background with border
Bullet points for cancellation policy
Checkbox with "I agree" text and linked terms
"Continue" button (full width, primary, use Button component)

Page 2: Review Page Layout
Same Header & Progress Structure

Progress indicator shows Step 2 active (orange)
Same navigation and branding

Content Layout

Two-Column Layout:
Column 1: Review Cards (collapsible): Each member's information displayed in read-only cards with inline edit button (top right)
Column 2: Summary Section: Trip details, total cost, member count (from the cart summary)
Action Buttons:

"Back" button (secondary styling)
"Proceed to Pay" button (primary blue)
Buttons aligned right or center

Page 3: Confirmation Page Layout
Header Section

Same navigation structure as previous pages
Progress indicator shows Step 3 complete

Main Content Layout

Single Column, Centered Layout
Booking Details Card:

Header Row: "Booking Details" (left) | "Booking ID: 08Y754334254" (right)
Service Info Row: activity image with name
Trip Details Grid:

5-column layout: Location | Time | Date | Duration

Guest Information Section

Section Header: "Guests Information (2)" in orange
Guest Cards Layout:

Each guest in separate card with white background
Guest Header: Name (left) | Age & Gender (right)
Details Grid: 3-column layout

Contact Number | Mail ID | Passport Number
Values displayed below headers

Missing Info: Shows "NA" for empty fields

Actions & Instructions

Download Button: Blue "Download PDF" button with icon (right-aligned)
Important Instructions:

Full-width section below guest cards
Bullet points in organized list format
Categories: Arrival, Policy, Requirements, Updates, Contact
