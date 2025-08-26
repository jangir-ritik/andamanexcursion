# Activity Time Slot UX Fix - Implementation Guide

## Problem Statement

**Current Issue:** In the activity search form, when users select a category (e.g., "Scuba Diving"), the time slot dropdown shows ALL available time slots from the entire system, including irrelevant ones like "19:00-21:30" (dinner cruise times) for morning activities.

**Root Cause:** Time slot dropdown pulls from the global `activity-time-slots` collection without filtering by category and location context.

**User Impact:** Confusing UX where users see time slots that don't apply to their selected activity type and location.

## Proposed Solution

**Approach:** Dynamic time slot loading based on actual activities matching the selected category and location.

**Flow:**

1. User selects category + location
2. System queries activities matching that combination
3. Extract unique time slots from those specific activities
4. Populate dropdown with only relevant time slots

**Key Principle:** Single source of truth - time slots come from actual activities, not separate collections.

## Implementation Plan

### New API Endpoint

**Create:** `src/app/api/activities/available-times/route.ts`

**Endpoint:** `GET /api/activities/available-times?category={slug}&location={slug}`

**Logic:**

- Query activities where `category.slug = categorySlug AND location.slug = locationSlug`
- Extract time slots from `scheduling.defaultTimeSlots` or `scheduling.availableTimeSlots`
- Return unique, sorted time slots for dropdown population

### New React Query Hook

**Create:** `src/hooks/queries/useActivityTimesByCategory.ts`

**Purpose:**

- Fetch available time slots for category + location combination
- Cache results with React Query
- Handle loading states and errors

**Usage:**

```typescript
const { data: timeSlots, isLoading } = useActivityTimesByCategory(
  selectedCategory,
  selectedLocation
);
```

### Service Layer Addition

**Create:** `src/services/api/activities.ts` (add method)

**New Method:** `getAvailableTimesByCategory(categorySlug, locationSlug)`

**Purpose:** HTTP client for the available times endpoint

### Frontend Component Updates

**Update:** `src/components/organisms/BookingForm/components/ActivitySearchFormRQ.tsx`

**Changes:**

- Add `useActivityTimesByCategory` hook
- Watch category + location changes
- Dynamically populate time slot dropdown
- Clear time slot selection when category/location changes
- Add loading state for time slot dropdown

**UX Flow:**

1. Category dropdown: enabled by default
2. Location dropdown: enabled by default
3. Time slot dropdown: disabled until both category + location selected
4. When both selected: fetch and populate available times
5. Show loading spinner while fetching
6. Enable time slot selection once loaded

## Files to Create

```
src/app/api/activities/available-times/route.ts
src/hooks/queries/useActivityTimesByCategory.ts
src/services/api/activities.ts (add method)
```

## Files to Update

```
src/components/organisms/BookingForm/components/ActivitySearchFormRQ.tsx
src/hooks/queries/index.ts (add export)
```

## Data Flow

```
User Action: Select "Scuba Diving" + "North Bay"
↓
Hook Trigger: useActivityTimesByCategory("scuba-diving", "north-bay")
↓
API Call: GET /api/activities/available-times?category=scuba-diving&location=north-bay
↓
Database Query:
  activities.find({
    where: {
      "coreInfo.category.slug": "scuba-diving",
      "coreInfo.location.slug": "north-bay",
      "status.isActive": true
    }
  })
↓
Extract Time Slots: Get unique time slots from matching activities
↓
Return: [
  { value: "10-00", label: "10:00 AM - 12:00 PM" },
  { value: "12-00", label: "12:00 PM - 2:00 PM" }
]
↓
UI Update: Populate time slot dropdown with relevant options only
```

## Benefits

- **Improved UX:** Users see only relevant time slots for their selection
- **Data Consistency:** Time slots always match actual activity availability
- **No Schema Changes:** Works with existing database structure
- **Performance:** React Query caching prevents repeated API calls
- **Maintainability:** Single source of truth eliminates sync issues

## Success Criteria

- [ ] Time slot dropdown shows only relevant options for selected category + location
- [ ] Dropdown is disabled until both category and location are selected
- [ ] Loading state displays while fetching time slots
- [ ] Cache prevents redundant API calls for same category + location
- [ ] Search results match the time slots shown in dropdown
- [ ] Existing functionality (search, cart, checkout) remains unaffected

## Testing Checklist

- [ ] Select "Scuba Diving" + "North Bay" → Shows only scuba diving time slots for North Bay
- [ ] Select "Dinner Cruise" + "Swaraaj Dweep" → Shows only evening time slot
- [ ] Change category while location selected → Time slots update appropriately
- [ ] Change location while category selected → Time slots update appropriately
- [ ] Network error handling → Graceful fallback behavior
- [ ] Cache behavior → No duplicate API calls for same selection
