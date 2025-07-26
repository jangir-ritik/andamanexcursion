"use client";

import { z } from "zod";

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

// // Create schema factories that accept allowed IDs
// export const createFerryFormSchema = (
//   validFromIds: string[],
//   validToIds: string[]
// ) =>
//   z
//     .object({
//       fromLocation: z
//         .string()
//         .min(1, "Please select a departure location")
//         .refine(
//           (val) => validFromIds.includes(val),
//           "Please select a valid departure location"
//         ),
//       toLocation: z
//         .string()
//         .min(1, "Please select a destination")
//         .refine(
//           (val) => validToIds.includes(val),
//           "Please select a valid destination"
//         ),
//       selectedDate: z
//         .date({
//           required_error: "Please select a date",
//           invalid_type_error: "Invalid date format",
//         })
//         .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
//           message: "Date cannot be in the past",
//         }),
//       selectedSlot: z.string().min(1, "Please select a time slot"),
//       passengers: passengerSchema,
//     })
//     .refine((data) => data.fromLocation !== data.toLocation, {
//       message: "Departure and destination locations cannot be the same",
//       path: ["toLocation"],
//     });

// // Boat booking form schema factory
// export const createBoatFormSchema = (
//   validFromIds: string[],
//   validToIds: string[]
// ) =>
//   z
//     .object({
//       fromLocation: z
//         .string()
//         .min(1, "Please select a departure location")
//         .refine(
//           (val) => validFromIds.includes(val),
//           "Please select a valid departure location"
//         ),
//       toLocation: z
//         .string()
//         .min(1, "Please select a destination")
//         .refine(
//           (val) => validToIds.includes(val),
//           "Please select a valid destination"
//         ),
//       selectedDate: z
//         .date({
//           required_error: "Please select a date",
//           invalid_type_error: "Invalid date format",
//         })
//         .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
//           message: "Date cannot be in the past",
//         }),
//       selectedSlot: z.string().min(1, "Please select a time slot"),
//       passengers: passengerSchema,
//     })
//     .refine((data) => data.fromLocation !== data.toLocation, {
//       message: "Departure and destination locations cannot be the same",
//       path: ["toLocation"],
//     });

// Activity booking form schema factory
export const createActivityFormSchema = (
  validActivityIds: string[],
  validLocationIds: string[]
) =>
  z.object({
    selectedActivity: z
      .string()
      .min(1, "Please select an activity")
      .refine(
        (val) =>
          validActivityIds.length === 0 || validActivityIds.includes(val),
        "Please select a valid activity"
      ),
    activityLocation: z
      .string()
      .min(1, "Please select a location")
      .refine(
        (val) =>
          validLocationIds.length === 0 || validLocationIds.includes(val),
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

// For backward compatibility and simple cases
// export const ferryFormSchema = createFerryFormSchema([], []);
// export const boatFormSchema = createBoatFormSchema([], []);
export const activityFormSchema = createActivityFormSchema([], []);

// Export TypeScript types inferred from schemas
// export type FerryFormValues = z.infer<typeof ferryFormSchema>;
// export type BoatFormValues = z.infer<typeof boatFormSchema>;
export type ActivityFormValues = z.infer<typeof activityFormSchema>;

// Helper function to get activity name from ID (used with dynamic data)
export const getActivityNameById = (id: string) => {
  // This function is now expected to be used with the correct context
  // where the activity data is available
  return id;
};
