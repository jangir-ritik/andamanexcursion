# Andaman Excursion Type System

This document provides an overview of the type system used in the Andaman Excursion application and recommendations for improvement.

## Current Type Structure

The application uses TypeScript throughout with a well-defined type system. Here's the current structure:

### Component Types

1. **Atom Component Types**

   - `Location` (`src/components/atoms/LocationSelect/LocationSelect.types.ts`)
   - `Activity` (`src/components/atoms/ActivitySelect/ActivitySelect.types.ts`)
   - `TimeSlot` (`src/components/atoms/SlotSelect/SlotSelect.types.ts`)
   - `PassengerCount` (`src/components/atoms/PassengerCounter/PassengerCounter.types.ts`)

2. **Molecule Component Types**

   - `FerryCardProps` (`src/components/molecules/Cards/FerryCard/FerryCard.types.ts`)
   - `ActivityCardProps` (`src/components/molecules/BookingResults/ActivityResults.tsx`)

3. **Organism Component Types**
   - `BookingFormProps` (`src/components/organisms/BookingForm/BookingForm.types.ts`)
   - `FormState` (`src/components/organisms/BookingForm/BookingForm.types.ts`)

### Context Types

1. **Booking Context Types**

   - `BookingContextType` (`src/context/BookingContext.types.ts`)
   - `BookingFormState` (`src/context/BookingContext.types.ts`)
   - `BookingActionTypes` (`src/context/BookingContext.types.ts`)

2. **Ferry Booking Context Types**

   - `FerryBookingContextType` (`src/context/FerryBookingContext.types.ts`)
   - `FerryBookingState` (`src/context/FerryBookingContext.types.ts`)
   - `FerryBookingActionTypes` (`src/context/FerryBookingContext.types.ts`)

3. **Activity Booking Context Types**
   - `ActivityBookingContextType` (`src/context/ActivityBookingContext.types.ts`)
   - `ActivityBookingState` (`src/context/ActivityBookingContext.types.ts`)
   - `ActivityBookingActionTypes` (`src/context/ActivityBookingContext.types.ts`)

### Hook Types

1. **Ferry Booking Hook Types**

   - `FerryBookingHookState` (`src/hooks/useFerryBooking.ts`)
   - `FerryBookingHookActions` (`src/hooks/useFerryBooking.ts`)

2. **Activity Booking Hook Types**
   - `ActivityBookingHookState` (`src/hooks/useActivityBooking.ts`)
   - `ActivityBookingHookActions` (`src/hooks/useActivityBooking.ts`)

## Recommendations for Improvement

While the current type system is well-structured, there are some areas for improvement:

### 1. Centralize Common Types

Create a central types directory for shared types:

```
src/
└── types/
    ├── booking.ts       # Common booking types
    ├── ferry.ts         # Ferry-specific types
    ├── activity.ts      # Activity-specific types
    └── common.ts        # General utility types
```

### 2. Extract Inline Types

Move inline types to their own files:

- Move `ActivityCardProps` from `ActivityResults.tsx` to a dedicated type file

### 3. Standardize Type Naming

Adopt a consistent naming convention:

- Props: `ComponentNameProps`
- State: `ComponentNameState`
- Actions: `ComponentNameActions`
- Context: `ComponentNameContextType`

### 4. Use Type Inheritance

Leverage TypeScript's type system for inheritance:

```typescript
// Base booking state
interface BaseBookingState {
  date: string;
  time: string;
  passengers: number;
}

// Ferry booking state extends base state
interface FerryBookingState extends BaseBookingState {
  from: string;
  to: string;
  // Ferry-specific properties
}

// Activity booking state extends base state
interface ActivityBookingState extends BaseBookingState {
  activity: string;
  // Activity-specific properties
}
```

### 5. Create Utility Types

Add utility types for common patterns:

```typescript
// Pagination type
interface Pagination {
  page: number;
  limit: number;
  total: number;
}

// Filter type
interface Filter<T> {
  field: keyof T;
  value: any;
  operator: "eq" | "gt" | "lt" | "contains";
}

// Response wrapper
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
```

### 6. Document Types

Add JSDoc comments to types for better documentation:

```typescript
/**
 * Represents a booking form state
 * @property fromLocation - The departure location ID
 * @property toLocation - The arrival location ID
 * @property selectedActivity - The selected activity ID
 * @property selectedDate - The selected date
 * @property selectedSlot - The selected time slot ID
 * @property passengers - The passenger count information
 */
export interface FormState {
  fromLocation: string;
  toLocation: string;
  selectedActivity: string;
  selectedDate: Date;
  selectedSlot: string;
  passengers: PassengerCount;
}
```

## Implementation Plan

1. Create a central types directory
2. Move inline types to dedicated files
3. Standardize naming conventions
4. Implement type inheritance where appropriate
5. Add utility types
6. Document types with JSDoc comments

This will improve code organization, maintainability, and developer experience.
