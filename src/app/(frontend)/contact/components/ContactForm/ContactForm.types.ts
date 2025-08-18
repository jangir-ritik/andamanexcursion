// import { z } from "zod";

// export const contactFormSchema = z.object({
//   booking: z.object({
//     package: z.string().min(1, "Please select a package"),
//     duration: z.string().min(1, "Please select duration"),
//     checkIn: z.date(),
//     checkOut: z.date(),
//     adults: z.number().min(1, "At least 1 adult required"),
//     children: z.number().min(0),
//   }),
//   personal: z.object({
//     fullName: z.string().min(2, "Please enter your full name"),
//     age: z
//       .number()
//       .min(1, "Please enter your age")
//       .max(120, "Please enter a valid age"),
//     phone: z.string().min(10, "Please enter a valid phone number"),
//     email: z.string().email("Please enter a valid email address"),
//   }),
//   additional: z.object({
//     tags: z.array(z.string()).default([]),
//     message: z.string().optional(),
//   }),
//   additionalMessage: z.string().optional(),
// });

// export type ContactFormData = z.infer<typeof contactFormSchema>;
import { z } from "zod";

export const contactFormSchema = z
  .object({
    booking: z.object({
      package: z
        .string()
        .min(1, "Please select a package")
        .refine(
          (val) => val.trim().length > 0,
          "Package selection is required"
        ),

      duration: z
        .string()
        .min(1, "Please select duration")
        .refine(
          (val) => val.trim().length > 0,
          "Duration selection is required"
        ),

      checkIn: z.date().refine(
        (date) => date >= new Date(Date.now() - 24 * 60 * 60 * 1000), // Allow same day
        "Check-in date cannot be in the past"
      ),

      checkOut: z.date(),

      adults: z
        .number()
        .min(1, "At least 1 adult is required")
        .max(20, "Maximum 20 adults allowed"),

      children: z
        .number()
        .min(0, "Children count cannot be negative")
        .max(20, "Maximum 20 children allowed"),
    }),

    personal: z.object({
      fullName: z
        .string()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name must be less than 100 characters")
        .regex(
          /^[a-zA-Z\s]+$/,
          "Full name should only contain letters and spaces"
        ),

      age: z
        .union([z.string(), z.number()])
        .transform((val) => {
          if (typeof val === "string") {
            const parsed = parseInt(val, 10);
            return isNaN(parsed) ? 0 : parsed;
          }
          return val;
        })
        .refine((val) => val >= 1, "Please enter a valid age")
        .refine((val) => val <= 120, "Please enter a realistic age"),

      phone: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be less than 15 digits")
        .regex(/^\+?[\d\s-()]+$/, "Please enter a valid phone number"),

      email: z
        .string()
        .email("Please enter a valid email address")
        .max(255, "Email address is too long"),
    }),

    additional: z.object({
      tags: z
        .array(z.string())
        .default([])
        .refine((tags) => tags.length <= 10, "Maximum 10 tags allowed"),

      message: z
        .string()
        .max(1000, "Message must be less than 1000 characters")
        .optional(),
    }),

    additionalMessage: z
      .string()
      .max(2000, "Additional message must be less than 2000 characters")
      .optional(),
  })
  .refine((data) => data.booking.checkOut > data.booking.checkIn, {
    message: "Check-out date must be after check-in date",
    path: ["booking", "checkOut"],
  })
  .refine(
    (data) => {
      // Ensure at least 1 day difference
      const diffTime =
        data.booking.checkOut.getTime() - data.booking.checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 1;
    },
    {
      message: "Stay must be at least 1 day",
      path: ["booking", "checkOut"],
    }
  );

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Form field configuration for better type safety
export interface FormFieldConfig {
  name: keyof ContactFormData | string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "number" | "date" | "textarea" | "select";
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
}

// Enhanced form state interface
export interface ContactFormState {
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError: string | null;
  isDirty: boolean;
  isValid: boolean;
  touchedFields: Set<string>;
}

// Form submission result
export interface FormSubmissionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
  data?: {
    enquiryId?: string;
    estimatedResponseTime?: string;
  };
}
