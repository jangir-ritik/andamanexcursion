# Layout Fixes Implementation

## Overview

This document outlines the changes made to fix layout shift issues in the booking forms. The main problems addressed were:

1. Form elements shifting when error messages appeared/disappeared
2. Layout shifting when dropdown menus opened
3. Inconsistent heights of form elements

## Changes Made

### 1. Form Field Container

Added a new `formFieldContainer` class to provide consistent height for form fields and reserve space for error messages:

```css
.formFieldContainer {
  position: relative;
  min-height: calc(
    var(--size-form-field-height) + 1.5rem
  ); /* Reserve space for error message */
}
```

This container was applied to all form fields in:

- FerryBookingForm
- BoatBookingForm
- ActivityBookingForm

### 2. Error Message Positioning

Updated error message styling to use absolute positioning to prevent layout shifts:

```css
.errorMessage {
  position: absolute;
  bottom: 0;
  left: 0;
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  text-align: left;
  height: 1.25rem; /* Fixed height for error message */
}
```

### 3. Dropdown Menu Positioning

Updated all dropdown components to use proper positioning:

```css
.selectWrapper {
  /* existing styles */
  position: relative; /* Added position relative */
}

.selectContent {
  /* existing styles */
  position: absolute; /* Ensure dropdown is absolutely positioned */
  width: var(--radix-select-trigger-width); /* Match width of trigger */
  z-index: 20000;
}
```

These changes were applied to:

- LocationSelect
- ActivitySelect
- SlotSelect
- DateSelect

### 4. Form Alignment

Changed form element alignment from `center` to `flex-start` for better consistency:

```css
.formGrid {
  align-items: flex-start; /* Changed from center to flex-start */
}

.passengerButtonSection {
  align-items: flex-start; /* Changed from center to flex-start */
}
```

### 5. Button Alignment

Added top margin to the submit button to align with form fields:

```css
.viewDetailsButton {
  margin-top: 1rem; /* Add top margin to align with form fields */
}
```

## Files Modified

1. `src/components/organisms/BookingForm/BookingForm.module.css`
2. `src/components/organisms/BookingForm/components/FerryBookingForm.tsx`
3. `src/components/organisms/BookingForm/components/BoatBookingForm.tsx`
4. `src/components/organisms/BookingForm/components/ActivityBookingForm.tsx`
5. `src/components/atoms/LocationSelect/LocationSelect.module.css`
6. `src/components/atoms/ActivitySelect/ActivitySelect.module.css`
7. `src/components/atoms/SlotSelect/SlotSelect.module.css`
8. `src/components/atoms/DateSelect/DateSelect.module.css`
9. `src/components/atoms/PassengerCounter/PassengerCounter.module.css`
10. `src/components/atoms/PassengerCounter/PassengerCounter.tsx`

## React Hook Form Integration

The project is transitioning to using React Hook Form with Zod validation. The key components of this integration are:

1. **Form Schemas** (`src/components/organisms/BookingForm/schemas/formSchemas.ts`):

   - Define validation rules using Zod
   - Create separate schemas for ferry, boat, and activity bookings
   - Export TypeScript types inferred from schemas

2. **Custom Hook** (`src/components/organisms/BookingForm/hooks/useBookingForm.ts`):

   - Wraps React Hook Form's `useForm` hook
   - Integrates Zod validation using `zodResolver`
   - Provides type safety with generic types

3. **Form Field Components**:
   - New field components with the suffix "Field" (e.g., `ActivitySelectField.tsx`)
   - These components are designed to work with React Hook Form's Controller

## Files to Keep vs. Remove

### Keep

- All modified CSS files
- All original component files
- Form schemas and hooks for React Hook Form integration

### Safe to Remove

The following files can be removed as they are likely replaced by the React Hook Form implementation:

```
src/components/atoms/ActivitySelect/ActivitySelectField.tsx
src/components/atoms/DateSelect/DateSelectField.tsx
src/components/atoms/LocationSelect/LocationSelectField.tsx
src/components/atoms/PassengerCounter/PassengerCounterField.tsx
src/components/atoms/SlotSelect/SlotSelectField.tsx
src/components/atoms/form-fields/index.ts
```

**Note:** Before removing these files, ensure that the new implementation is fully functional and tested.
