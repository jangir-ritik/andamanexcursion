# Andaman Excursion Booking System

This document provides an overview of the booking system architecture, component connections, and data flow in the Andaman Excursion application.

## Table of Contents

1. [System Overview](#system-overview)
2. [Component Structure](#component-structure)
3. [Data Flow](#data-flow)
4. [Context Structure](#context-structure)
5. [URL Structure](#url-structure)
6. [Type System](#type-system)

## System Overview

The booking system allows users to book ferries and activities in the Andaman Islands. It consists of:

- A unified booking form for both ferry and activity bookings
- Separate booking flows for ferries and activities
- Context-based state management
- Reusable components for displaying search results
- Next.js routing for navigation

## Component Structure

### Core Components

1. **BookingForm**: The main entry point for all bookings

   - Located in `src/components/organisms/BookingForm`
   - Handles form input for both ferry and activity bookings
   - Routes to appropriate booking pages

2. **BookingResults Components**: Reusable components for displaying search results

   - Located in `src/components/molecules/BookingResults`
   - Includes:
     - `SearchSummary`: Displays search parameters and result count
     - `TimeFilters`: Provides time filtering functionality
     - `ActivityResults`: Displays activity cards with filtering

3. **Booking Pages**:
   - `src/app/ferry/booking/page.tsx`: Ferry booking page
   - `src/app/activities/booking/page.tsx`: Activities booking page

### Component Hierarchy

```
BookingForm
└── Routes to booking pages
    ├── FerryBookingPage
    │   ├── SearchSummary
    │   ├── TimeFilters
    │   └── FerryResults
    │       └── FerryCard
    └── ActivitiesBookingPage
        ├── SearchSummary
        ├── TimeFilters
        └── ActivityResults
            └── SmallCard
```

## Data Flow

1. **User Input**:

   - User selects booking type (ferry/activity), locations/activity, date, time, and passengers
   - BookingForm captures this data

2. **Form Submission**:

   - BookingForm updates the global BookingContext
   - Router navigates to the appropriate booking page with query parameters

3. **Booking Page**:

   - Booking page reads query parameters
   - Loads data using the appropriate hook (useFerryBooking/useActivityBooking)
   - Displays results using the BookingResults components

4. **Filtering**:

   - TimeFilters component allows filtering by time range
   - Results are filtered and grouped by time

5. **Selection**:
   - User selects a ferry/activity
   - Navigation to detail page using Next.js router

## Context Structure

The application uses a hierarchical context structure:

1. **BookingContext**: Base context for all booking data

   - Stores common booking parameters (date, time, passengers)
   - Located in `src/context/BookingContext.tsx`

2. **FerryBookingContext**: Ferry-specific booking data

   - Stores ferry search results, filters, and selections
   - Located in `src/context/FerryBookingContext.tsx`

3. **ActivityBookingContext**: Activity-specific booking data
   - Stores activity search results, filters, and selections
   - Located in `src/context/ActivityBookingContext.tsx`

These contexts are provided through the `BookingProviders` component:

```
BookingProvider
└── FerryBookingProvider
    └── ActivityBookingProvider
```

## URL Structure

The application uses a consistent URL structure for bookings:

1. **Ferry Booking**:

   - Search: `/ferry/booking?from=X&to=Y&date=Z&time=T&passengers=P`
   - Detail: `/ferry/booking/[id]`

2. **Activity Booking**:
   - Search: `/activities/booking?activity=X&date=Z&time=T&passengers=P`
   - Detail: `/activities/booking?id=Y`

## Type System

The application uses TypeScript throughout with a well-defined type system:

1. **Common Types**:

   - `Location`, `Activity`, `TimeSlot`, `PassengerCount`: Basic data types
   - Located in respective component type files

2. **Context Types**:

   - `BookingContextType`, `FerryBookingContextType`, `ActivityBookingContextType`: Context state and actions
   - Located in respective context type files

3. **Component Props**:

   - Each component has a well-defined props interface
   - Located in component type files

4. **Data Models**:
   - `FerryCardProps`, `ActivityCardProps`: Data models for ferry and activity cards
   - Located in respective card type files

## Best Practices

1. **Next.js Routing**:

   - Use Next.js Link component for navigation
   - Use router.push() for programmatic navigation
   - Avoid direct window.location manipulation

2. **State Management**:

   - Use React Context for global state
   - Use React hooks for component state
   - Use memoization to prevent unnecessary re-renders

3. **Component Structure**:

   - Follow atomic design principles
   - Use composition for complex components
   - Separate concerns with container and presentational components

4. **TypeScript**:
   - Define interfaces for all props and state
   - Use generics for reusable components
   - Use union types for variant components
