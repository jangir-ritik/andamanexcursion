# Data Management Guidelines

This document outlines the centralized data management approach for the Andaman Excursion application.

## Activity Data Management

### Overview

To maintain consistency and reduce duplication, we've implemented a centralized data management approach for activities in the Andaman Excursion application. This document outlines how activity data should be managed and extended.

### Single Source of Truth

All activity data is defined in a single location:

- **File**: `src/data/activities.ts`
- **Exports**:
  - `ACTIVITIES_DATA`: Complete activity data with all properties
  - `ACTIVITIES`: Simplified list with just ID and name for form components

### Adding a New Activity

When adding a new activity to the system, follow these steps:

1. **Add to the central data file**:

   ```typescript
   // In src/data/activities.ts
   export const ACTIVITIES_DATA: ActivityData[] = [
     // ... existing activities
     {
       id: "new-activity-id",
       name: "New Activity Name",
       image: imageImport,
       imageAlt: "Description of activity image",
       description: "Detailed description of the activity",
       rating: 4.8, // Rating out of 5
     },
   ];
   ```

2. **That's it!** The activity will automatically be available in:
   - The activities page listing
   - The booking form activity selector

### Consuming Activity Data

The activity data is consumed in two main places:

1. **Activities Page** (`src/app/activities/page.content.ts`):

   - Uses `ACTIVITIES_DATA` and adds `href` property for navigation

2. **Booking Form** (`src/components/organisms/BookingForm/BookingForm.types.ts`):
   - Uses simplified `ACTIVITIES` list for the activity selector

### Benefits of This Approach

- **Consistency**: All activity data is defined in one place
- **Maintainability**: Adding or modifying an activity requires changes to only one file
- **Type Safety**: Activity data structure is enforced through TypeScript interfaces
- **Scalability**: Easy to extend with additional properties as needed

## Ferry Data Management

### Overview

Ferry data is centralized in a similar way to activity data, providing a single source of truth for ferry-related information.

### Single Source of Truth

All ferry data is defined in a single location:

- **File**: `src/data/ferries.ts`
- **Exports**:
  - `FERRY_LOCATIONS`: List of available ferry locations
  - `FERRY_OPERATORS`: Details about ferry service providers
  - `FERRY_ROUTES`: Available ferry routes between locations
  - Helper functions for data access

### Adding New Ferry Data

When adding new ferry-related data:

1. **Add to the central data file**:

   ```typescript
   // In src/data/ferries.ts

   // For a new location
   export const FERRY_LOCATIONS: Location[] = [
     // ... existing locations
     { id: "new-location-id", name: "New Location Name" },
   ];

   // For a new operator
   export const FERRY_OPERATORS: FerryOperator[] = [
     // ... existing operators
     {
       id: "new-operator-id",
       name: "New Operator Name",
       logo: logoImport,
       logoAlt: "New Operator Logo",
       description: "Description of the operator",
       rating: 4.5,
       amenities: ["Amenity 1", "Amenity 2"],
     },
   ];

   // For a new route
   export const FERRY_ROUTES: FerryRoute[] = [
     // ... existing routes
     {
       id: "new-route-id",
       from: "location-id-1",
       to: "location-id-2",
       operatorId: "operator-id",
       durationMinutes: 120,
       price: {
         economy: 1000,
         business: 1500,
       },
       availableDays: [0, 1, 2, 3, 4, 5, 6],
     },
   ];
   ```

## Boat Data Management

### Overview

Boat data is also centralized, providing a single source of truth for boat tours and local boat services.

### Single Source of Truth

All boat data is defined in a single location:

- **File**: `src/data/boats.ts`
- **Exports**:
  - `BOAT_LOCATIONS`: List of available boat locations (includes ferry locations plus boat-specific ones)
  - `BOAT_TYPES`: Types of boats available for tours
  - `BOAT_ROUTES`: Available boat tours and routes
  - Helper functions for data access

### Adding New Boat Data

When adding new boat-related data:

1. **Add to the central data file**:

   ```typescript
   // In src/data/boats.ts

   // For a new boat location
   export const BOAT_LOCATIONS: Location[] = [
     // ... existing locations
     { id: "new-location-id", name: "New Location Name" },
   ];

   // For a new boat type
   export const BOAT_TYPES: BoatType[] = [
     // ... existing boat types
     {
       id: "new-boat-type-id",
       name: "New Boat Type",
       capacity: 10,
       description: "Description of the boat type",
       pricePerHour: 2000,
       amenities: ["Amenity 1", "Amenity 2"],
     },
   ];

   // For a new boat route/tour
   export const BOAT_ROUTES: BoatRoute[] = [
     // ... existing routes
     {
       id: "new-route-id",
       name: "New Tour Name",
       from: "location-id-1",
       to: "location-id-2",
       durationMinutes: 120,
       description: "Description of the tour",
       price: 2500,
       boatTypeId: "boat-type-id",
       availableDays: [0, 1, 2, 3, 4, 5, 6],
       highlights: ["Highlight 1", "Highlight 2"],
     },
   ];
   ```

## Future Considerations

As the application grows, consider:

1. Adding API endpoints to fetch all data dynamically
2. Implementing a CMS for non-technical users to manage activities, ferries, and boats
3. Adding versioning to data to support seasonal changes
4. Implementing a caching strategy for frequently accessed data
