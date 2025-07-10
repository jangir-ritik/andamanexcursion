import { z } from "zod";

export const personalDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
});

export const tripDetailsSchema = z.object({
  arrivalDate: z.string().min(1, "Arrival date is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  adults: z.number().min(1, "At least 1 adult is required"),
  children: z.number().min(0, "Children count cannot be negative"),
});

export const step1Schema = z.object({
  personalDetails: personalDetailsSchema,
  tripDetails: tripDetailsSchema,
  travelGoals: z.array(z.string()).min(1, "Select at least one travel goal"),
  specialOccasion: z.array(z.string()).optional(),
});

export const step2Schema = z.object({
  itinerary: z
    .array(
      z.object({
        day: z.number().min(1, "Day must be at least 1"),
        date: z.string().min(1, "Date is required"),
        destination: z.string().min(1, "Destination is required"),
        activity: z.string().min(1, "Activity is required"),
        notes: z.string().optional(),
      })
    )
    .min(1, "At least one day must be planned"),
});

export const step3Schema = z.object({
  hotelPreferences: z.object({
    hotelType: z.string().min(1, "Hotel type is required"),
    roomPreference: z.string().min(1, "Room preference is required"),
    specificHotel: z.string().optional(),
  }),
  ferryPreferences: z.object({
    ferryClass: z.string().min(1, "Ferry class is required"),
    travelTimeSlot: z.string().min(1, "Travel time slot is required"),
    preferredFerry: z.string().optional(),
  }),
  addOns: z.object({
    airportPickup: z.boolean(),
    privateGuide: z.boolean(),
    mealPreference: z.string().min(1, "Meal preference is required"),
    transportation: z.string().min(1, "Transportation is required"),
  }),
});

export const tripFormSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
});

export type TripFormData = z.infer<typeof tripFormSchema>;
