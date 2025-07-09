import { z } from "zod";
import { FERRY_LOCATIONS } from "@/data/ferries";
import { BOAT_LOCATIONS } from "@/data/boats";
import { ACTIVITIES } from "@/data/activities";

// Base passenger schema used by all form types
const passengerSchema = z
  .object({
    adults: z
      .number()
      .min(1, "At least 1 adult is required")
      .max(10, "Maximum 10 adults allowed"),
    children: z
      .number()
      .min(0, "Children count must be 0 or more")
      .max(10, "Maximum 10 children allowed"),
    infants: z
      .number()
      .min(0, "Infant count must be 0 or more")
      .max(5, "Maximum 5 infants allowed"),
  })
  .refine(
    (data) => {
      const totalPassengers = data.adults + data.children + data.infants;
      return totalPassengers <= 15;
    },
    {
      message: "Total passengers cannot exceed 15",
      path: ["adults"], // Show error on adults field
    }
  );

// Get valid location IDs
const ferryLocationIds = FERRY_LOCATIONS.map((loc) => loc.id);
const boatLocationIds = BOAT_LOCATIONS.map((loc) => loc.id);
const activityIds = ACTIVITIES.map((act) => act.id);

// Activity locations - using ferry locations for now as a base
const activityLocationIds = ferryLocationIds;

// Ferry booking form schema
export const ferryFormSchema = z
  .object({
    fromLocation: z
      .string()
      .min(1, "Please select a departure location")
      .refine(
        (val) => ferryLocationIds.includes(val),
        "Please select a valid departure location"
      ),
    toLocation: z
      .string()
      .min(1, "Please select a destination")
      .refine(
        (val) => ferryLocationIds.includes(val),
        "Please select a valid destination"
      ),
    selectedDate: z
      .date({
        required_error: "Please select a date",
        invalid_type_error: "Invalid date format",
      })
      .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "Date cannot be in the past",
      }),
    selectedSlot: z.string().min(1, "Please select a time slot"),
    passengers: passengerSchema,
  })
  .refine((data) => data.fromLocation !== data.toLocation, {
    message: "Departure and destination locations cannot be the same",
    path: ["toLocation"],
  });

// Boat booking form schema
export const boatFormSchema = z
  .object({
    fromLocation: z
      .string()
      .min(1, "Please select a departure location")
      .refine(
        (val) => boatLocationIds.includes(val),
        "Please select a valid departure location"
      ),
    toLocation: z
      .string()
      .min(1, "Please select a destination")
      .refine(
        (val) => boatLocationIds.includes(val),
        "Please select a valid destination"
      ),
    selectedDate: z
      .date({
        required_error: "Please select a date",
        invalid_type_error: "Invalid date format",
      })
      .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "Date cannot be in the past",
      }),
    selectedSlot: z.string().min(1, "Please select a time slot"),
    passengers: passengerSchema,
  })
  .refine((data) => data.fromLocation !== data.toLocation, {
    message: "Departure and destination locations cannot be the same",
    path: ["toLocation"],
  });

// Activity booking form schema
export const activityFormSchema = z.object({
  selectedActivity: z
    .string()
    .min(1, "Please select an activity")
    .refine(
      (val) => activityIds.includes(val),
      "Please select a valid activity"
    ),
  activityLocation: z
    .string()
    .min(1, "Please select a location")
    .refine(
      (val) => activityLocationIds.includes(val),
      "Please select a valid location"
    ),
  selectedDate: z
    .date({
      required_error: "Please select a date",
      invalid_type_error: "Invalid date format",
    })
    .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: "Date cannot be in the past",
    }),
  selectedSlot: z.string().min(1, "Please select a time slot"),
  passengers: passengerSchema,
});

// Export TypeScript types inferred from schemas
export type FerryFormValues = z.infer<typeof ferryFormSchema>;
export type BoatFormValues = z.infer<typeof boatFormSchema>;
export type ActivityFormValues = z.infer<typeof activityFormSchema>;

// Helper function to get location name from ID
export const getLocationNameById = (
  id: string,
  locationType: "ferry" | "boat" | "activity"
) => {
  const locations =
    locationType === "ferry"
      ? FERRY_LOCATIONS
      : locationType === "boat"
      ? BOAT_LOCATIONS
      : FERRY_LOCATIONS; // Use ferry locations for activities for now
  return locations.find((loc) => loc.id === id)?.name || "";
};

// Helper function to get activity name from ID
export const getActivityNameById = (id: string) => {
  return ACTIVITIES.find((act) => act.id === id)?.name || "";
};
