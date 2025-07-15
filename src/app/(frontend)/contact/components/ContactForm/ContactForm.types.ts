import { z } from "zod";

export const contactFormSchema = z.object({
  booking: z.object({
    package: z.string().min(1, "Please select a package"),
    duration: z.string().min(1, "Please select duration"),
    checkIn: z.date(),
    checkOut: z.date(),
    adults: z.number().min(1, "At least 1 adult required"),
    children: z.number().min(0),
  }),
  personal: z.object({
    fullName: z.string().min(2, "Please enter your full name"),
    age: z
      .number()
      .min(1, "Please enter your age")
      .max(120, "Please enter a valid age"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    email: z.string().email("Please enter a valid email address"),
  }),
  additional: z.object({
    tags: z.array(z.string()).default([]),
    message: z.string().optional(),
  }),
  additionalMessage: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
