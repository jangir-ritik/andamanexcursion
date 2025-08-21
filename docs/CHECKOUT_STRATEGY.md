# Checkout System Strategy - Simplified Architecture

## Current Problems

1. **Over-complex CheckoutStore** - handling activities, ferries, forms, metadata, validation
2. **Initialization race conditions** - computing metadata before store is ready
3. **Mixed responsibilities** - business logic + form state + UI state
4. **Tight coupling** - ferry and activity systems tangled together

## Proposed Solution: "Source of Truth" Pattern

### Core Principle

Each booking type has its **own source of truth** and the checkout is just a **thin adapter layer**.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ActivityCart  │    │   FerrySession  │    │  UnifiedCheckout│
│   (Source #1)   │────│   (Source #2)   │────│   (Thin Layer)  │
│                 │    │                 │    │                 │
│ • Cart Items    │    │ • Ferry Booking │    │ • Route Traffic │
│ • Passengers    │    │ • Seat Selection│    │ • Combine Data  │
│ • Pricing       │    │ • Class Choice  │    │ • Handle Forms  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Implementation Strategy

### 1. Keep Existing Stores Intact

- `ActivityStore` + `CartStore` → Activities
- `FerryStore` → Ferry bookings
- Don't touch what's working!

### 2. Create Minimal CheckoutAdapter

```typescript
interface CheckoutAdapter {
  // Routing only
  bookingType: "activity" | "ferry" | "mixed";

  // Data access (no storage)
  getBookingData(): UnifiedBookingData;
  getPassengerRequirements(): PassengerRequirements;

  // Form integration
  submitToPayment(formData: FormData): Promise<PaymentData>;
}
```

### 3. Unified Booking Interface

```typescript
interface UnifiedBookingData {
  type: "activity" | "ferry" | "mixed";
  items: (ActivityBooking | FerryBooking)[];
  totalPassengers: number;
  totalPrice: number;
  requirements: PassengerRequirements;
}
```

### 4. Simple Checkout Flow

```
1. Detect Booking Type (URL params)
   ├── ?type=activity → ActivityCart.getCheckoutData()
   ├── ?type=ferry → FerryStore.getCheckoutData()
   └── ?type=mixed → Combine both

2. Render Universal Form
   ├── Use unified booking data for form setup
   └── Let React Hook Form handle all validation

3. Submit to Payment
   ├── Convert form data to payment format
   └── Route to appropriate payment handler
```

## Benefits of This Approach

✅ **Simple**: Each system owns its data
✅ **Reliable**: No complex state synchronization  
✅ **Maintainable**: Clear separation of concerns
✅ **Extensible**: Easy to add new booking types
✅ **Debuggable**: Clear data flow

## Migration Plan

### Phase 1: Create Adapter (1-2 hours)

1. Create `CheckoutAdapter` utility class
2. Add `getCheckoutData()` methods to existing stores
3. Route checkout based on URL params

### Phase 2: Simplify CheckoutStore (1 hour)

1. Remove complex metadata computation
2. Keep only form state and step navigation
3. Remove initialization race conditions

### Phase 3: Update Components (30 mins)

1. Update checkout page to use adapter
2. Simplify MemberDetailsStep to use unified data
3. Remove defensive programming - no longer needed

### Phase 4: Test & Polish (30 mins)

1. Test activity-only checkout
2. Test ferry-only checkout
3. Verify no Zustand errors

## Implementation Details

### CheckoutAdapter Class

```typescript
export class CheckoutAdapter {
  static detectBookingType(searchParams: URLSearchParams): BookingType {
    return (searchParams.get("type") as BookingType) || "activity";
  }

  static getUnifiedBookingData(type: BookingType): UnifiedBookingData {
    switch (type) {
      case "activity":
        return ActivityCart.getCheckoutData();
      case "ferry":
        return FerryStore.getCheckoutData();
      case "mixed":
        return this.combinedCheckoutData();
    }
  }

  static getPassengerRequirements(
    data: UnifiedBookingData
  ): PassengerRequirements {
    return {
      totalRequired: data.totalPassengers,
      bookings: data.items.map((item) => ({
        title: item.title,
        passengers: item.passengers,
      })),
    };
  }
}
```

This approach eliminates the complexity and makes checkout bulletproof!

Would you like me to implement this strategy?
