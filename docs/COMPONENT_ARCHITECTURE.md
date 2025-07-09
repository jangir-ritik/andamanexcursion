# Booking System Component Architecture

## Overview

The Andaman Excursion booking system follows a well-structured architecture that leverages React Hook Form with Zod validation, context-based state management, and reusable atomic components. This document explains how these components work together and their relationships.

## Component Hierarchy

```
BookingForm (Organism)
├── FerryBookingForm
│   ├── LocationSelect (Atom)
│   ├── DateSelect (Atom)
│   ├── SlotSelect (Atom)
│   └── PassengerCounter (Atom)
├── BoatBookingForm
│   ├── LocationSelect (Atom)
│   ├── DateSelect (Atom)
│   ├── SlotSelect (Atom)
│   └── PassengerCounter (Atom)
└── ActivityBookingForm
    ├── ActivitySelect (Atom)
    ├── DateSelect (Atom)
    ├── SlotSelect (Atom)
    └── PassengerCounter (Atom)
```

## Data Flow

### Form Submission Flow

1. **User Input**: User enters data in form fields
2. **Form Validation**: React Hook Form + Zod validates the input
3. **State Update**: On successful validation, the BookingContext is updated
4. **Navigation**: User is redirected to the booking results page with query parameters
5. **Results Display**: Booking results page fetches and displays available options

```
User Input → Form Validation → Context Update → Navigation → Results Display
```

### State Management Flow

1. **BookingContext**: Stores shared booking state (date, passengers, etc.)
2. **Form Schemas**: Define validation rules for each form type
3. **useBookingForm Hook**: Connects forms to React Hook Form with Zod validation
4. **Controller Components**: Connect form state to UI components

```
BookingContext ↔ useBookingForm ↔ Controller ↔ UI Components
```

## Key Components and Their Roles

### 1. Atom Components

These are the basic building blocks of the booking forms:

- **LocationSelect**: Dropdown for selecting departure/destination locations

  - Used in: FerryBookingForm, BoatBookingForm
  - Props: `value`, `onChange`, `label`, `options`

- **ActivitySelect**: Dropdown for selecting activities

  - Used in: ActivityBookingForm
  - Props: `value`, `onChange`, `options`

- **DateSelect**: Calendar for selecting travel dates

  - Used in: All booking forms
  - Props: `selected`, `onChange`

- **SlotSelect**: Dropdown for selecting time slots

  - Used in: All booking forms
  - Props: `value`, `onChange`, `options`

- **PassengerCounter**: Counter for selecting passenger counts
  - Used in: All booking forms
  - Props: `value`, `onChange`

### 2. Form Components

These components compose the atom components into complete forms:

- **FerryBookingForm**: Form for booking ferry tickets

  - Uses: LocationSelect, DateSelect, SlotSelect, PassengerCounter
  - Validates with: ferryFormSchema

- **BoatBookingForm**: Form for booking boat trips

  - Uses: LocationSelect, DateSelect, SlotSelect, PassengerCounter
  - Validates with: boatFormSchema

- **ActivityBookingForm**: Form for booking activities
  - Uses: ActivitySelect, DateSelect, SlotSelect, PassengerCounter
  - Validates with: activityFormSchema

### 3. Context Providers

- **BookingProvider**: Provides shared booking state across the application

  - Exposes: bookingState, updateBookingState, resetBookingState
  - Used by: All booking forms and results pages

- **FerryBookingProvider**: Provides ferry-specific booking state

  - Extends: BookingProvider
  - Adds: ferryState, setTimeFilter, etc.
  - Used by: Ferry booking results page

- **ActivityBookingProvider**: Provides activity-specific booking state
  - Extends: BookingProvider
  - Adds: activityState, setTimeFilter, etc.
  - Used by: Activity booking results page

## Form Validation Architecture

The booking system uses a robust validation architecture:

1. **Zod Schemas**: Define validation rules and generate TypeScript types

   - Located in: `src/components/organisms/BookingForm/schemas/formSchemas.ts`
   - Include: ferryFormSchema, boatFormSchema, activityFormSchema

2. **Custom Hook**: `useBookingForm` simplifies form setup

   - Located in: `src/components/organisms/BookingForm/hooks/useBookingForm.ts`
   - Provides: Form control, validation, error handling

3. **Controller Pattern**: React Hook Form's Controller connects form state to UI
   - Example:
   ```tsx
   <Controller
     control={control}
     name="fieldName"
     render={({ field }) => (
       <Component value={field.value} onChange={field.onChange} />
     )}
   />
   ```

## Optimization Strategies

The booking system is optimized in several ways:

1. **Memoization**: Components use React.memo and useMemo to prevent unnecessary re-renders
2. **Context Splitting**: State is split across multiple contexts to minimize re-renders
3. **Form Mode**: Forms use "onSubmit" validation mode to minimize validation runs
4. **CSS Modules**: Styles are scoped to components to prevent conflicts
5. **Layout Optimization**: Form elements have fixed heights to prevent layout shifts

## Component Reusability

All form field components are designed for reusability:

1. **Consistent Props**: Components use consistent prop patterns (value, onChange)
2. **Separation of Concerns**: UI is separated from validation logic
3. **Flexible Styling**: Components accept className props for styling customization
4. **Typed Interfaces**: All components have TypeScript interfaces for prop types

## Future Improvements

1. **Field Components**: Create dedicated Field components that combine Controller with UI components
2. **Form Factory**: Create a form factory to generate forms based on configuration
3. **Internationalization**: Add support for translating error messages
4. **Accessibility**: Enhance keyboard navigation and screen reader support
5. **Performance Monitoring**: Add performance monitoring for form interactions

## Conclusion

The Andaman Excursion booking system follows a well-structured architecture that leverages React Hook Form with Zod validation, context-based state management, and reusable atomic components. This architecture provides a solid foundation for building complex booking flows while maintaining code quality and user experience.
