# React Hook Form with Zod Implementation

This document outlines the implementation of React Hook Form with Zod validation in the Andaman Excursion booking forms.

## Overview

We've migrated the booking forms from using manual state management to React Hook Form with Zod validation. This provides:

- Type-safe form validation
- Reduced boilerplate code
- Centralized validation logic
- Improved error handling
- Better developer experience

## Implementation Details

### 1. Form Schemas

All form validation schemas are defined in `src/components/organisms/BookingForm/schemas/formSchemas.ts`. We have three main schemas:

- `ferryFormSchema`: For ferry booking forms
- `boatFormSchema`: For boat booking forms
- `activityFormSchema`: For activity booking forms

Each schema defines the validation rules for the form fields and generates TypeScript types using Zod's `z.infer<>`.

#### Advanced Validation Rules

Our schemas include advanced validation rules:

- Cross-field validation (e.g., ensuring departure and destination are different)
- Date validation (e.g., ensuring dates are not in the past)
- Passenger count validation (e.g., ensuring total passengers don't exceed limits)
- Location validation (e.g., ensuring locations are valid)

### 2. Custom Hook

We've created a custom hook `useBookingForm` in `src/components/organisms/BookingForm/hooks/useBookingForm.ts` to simplify form setup. This hook:

- Accepts a Zod schema and default values
- Sets up React Hook Form with the Zod resolver
- Provides type safety for form values
- Simplifies the form initialization process

Usage:

```tsx
const {
  control,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useBookingForm<typeof mySchema>(mySchema, defaultValues);
```

### 3. Form Components

The form components have been refactored to use React Hook Form:

- `FerryBookingForm`: Uses `ferryFormSchema` for validation
- `BoatBookingForm`: Uses `boatFormSchema` for validation
- `ActivityBookingForm`: Uses `activityFormSchema` for validation

Each component uses our custom `useBookingForm` hook to connect the Zod schema to the form.

### 4. Controller Components

We use React Hook Form's `Controller` component to connect the form to our existing UI components:

```tsx
<Controller
  control={control}
  name="fieldName"
  render={({ field }) => (
    <YourComponent value={field.value} onChange={field.onChange} />
  )}
/>
```

### 5. Error Handling

Error messages are displayed below each form field:

```tsx
{
  errors.fieldName && (
    <div className={styles.errorMessage}>{errors.fieldName.message}</div>
  );
}
```

CSS styles for error messages have been added to each component's CSS module.

## Usage Example

```tsx
// Import the necessary dependencies
import { Controller } from "react-hook-form";
import { myFormSchema, MyFormValues } from "../schemas/formSchemas";
import { useBookingForm } from "../hooks/useBookingForm";

// Initialize the form with our custom hook
const {
  control,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useBookingForm<typeof myFormSchema>(myFormSchema, {
  // Your default values here
});

// Define the submit handler
const onSubmit = (data: MyFormValues) => {
  // Handle form submission
};

// Render the form
return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <div>
      <Controller
        control={control}
        name="fieldName"
        render={({ field }) => (
          <Input value={field.value} onChange={field.onChange} />
        )}
      />
      {errors.fieldName && (
        <div className={styles.errorMessage}>{errors.fieldName.message}</div>
      )}
    </div>

    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Loading..." : "Submit"}
    </button>
  </form>
);
```

## Demo

A demo of the implementation can be found at `/demo/booking-form`. This page demonstrates the React Hook Form with Zod validation in action.

## Testing

Tests for the forms can be found in `src/components/organisms/BookingForm/tests/`. These tests verify that:

1. Forms render correctly
2. Validation errors are displayed when the form is submitted with invalid data
3. Forms submit correctly with valid data

## Benefits of This Approach

1. **Type Safety**: TypeScript types are generated from Zod schemas, ensuring type consistency
2. **Reduced Boilerplate**: No need for manual state management and validation
3. **Centralized Validation**: All validation rules are defined in one place
4. **Better Error Handling**: Clear error messages for each field
5. **Improved Performance**: React Hook Form minimizes re-renders
6. **Enhanced User Experience**: Loading states, validation feedback, and error messages
7. **Code Reusability**: Custom hooks and shared validation logic

## Future Improvements

1. Add more specific validation rules to the schemas
2. Create reusable form field components
3. Add more comprehensive tests
4. Implement form-level validation for more complex cross-field validation
5. Add internationalization for error messages
