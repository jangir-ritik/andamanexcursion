import { z } from "zod";

// Member details schema based on requirements
export const memberDetailsSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  age: z.coerce
    .number()
    .int("Age must be a whole number")
    .min(1, "Age must be at least 1")
    .max(120, "Age must not exceed 120"),

  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),

  nationality: z.string().min(1, "Please select nationality"),

  passportNumber: z
    .string()
    .min(6, "Passport number must be at least 6 characters")
    .max(12, "Passport number must not exceed 12 characters")
    // Made more lenient for development - accepting more characters
    .regex(
      /^[A-Za-z0-9]{6,12}$/,
      "Invalid passport format. Use only letters and numbers"
    )
    .transform((val) => val.toUpperCase()), // Auto-transform to uppercase

  // Optional fields for non-primary members
  whatsappNumber: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true; // Allow empty
      return /^\+?[0-9\s\-\(\)]{8,20}$/.test(val); // More lenient phone validation
    }, "Invalid WhatsApp number format"),

  email: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true; // Allow empty
      return z.string().email().safeParse(val).success;
    }, "Invalid email format"),
});

// Primary member schema (with required contact fields)
export const primaryMemberDetailsSchema = memberDetailsSchema.extend({
  whatsappNumber: z
    .string()
    .min(1, "WhatsApp number is required for the primary member")
    .regex(/^\+?[0-9\s\-\(\)]{8,20}$/, "Invalid WhatsApp number format"), // More lenient

  email: z
    .string()
    .min(1, "Email is required for the primary member")
    .email("Invalid email format"),
});

// Step 1 schema - Member details form with proper primary/secondary member validation
export const step1Schema = z.object({
  members: z
    .array(memberDetailsSchema)
    .min(1, "At least one member is required")
    .refine((members) => {
      // Always require the primary member (first member) to be complete
      if (members.length === 0) return false;

      const primaryMember = members[0];

      // Check if primary member has all required fields
      const hasRequiredFields =
        primaryMember.fullName &&
        primaryMember.age &&
        primaryMember.gender &&
        primaryMember.nationality &&
        primaryMember.passportNumber &&
        primaryMember.whatsappNumber &&
        primaryMember.email;

      if (!hasRequiredFields) {
        return false;
      }

      // Validate primary member with proper schema
      const primaryValidation =
        primaryMemberDetailsSchema.safeParse(primaryMember);
      if (!primaryValidation.success) {
        console.error(
          "Primary member validation failed:",
          primaryValidation.error
        );
        return false;
      }

      // For other members, only validate if they have any data filled in
      for (let i = 1; i < members.length; i++) {
        const member = members[i];
        const hasAnyData =
          member.fullName ||
          member.passportNumber ||
          member.whatsappNumber ||
          member.email ||
          member.gender;

        // If member has any data, they must have complete basic info
        if (hasAnyData) {
          const memberValidation = memberDetailsSchema.safeParse(member);
          if (!memberValidation.success) {
            console.error(
              `Member ${i + 1} validation failed:`,
              memberValidation.error
            );
            return false;
          }
        }
      }

      return true;
    }, "Member details validation failed"),

  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions to proceed",
  }),
});

// Step 2 schema - Review (no additional validation needed, just ensure step 1 is valid)
export const step2Schema = step1Schema;

// Step 3 schema - Confirmation (no validation needed, read-only)
export const step3Schema = z.object({
  bookingConfirmed: z.boolean().optional(),
});

// Complete checkout form schema
export const checkoutFormSchema = z.object({
  step1: step1Schema,
  currentStep: z.number().min(1).max(3),
});

// Type inference
export type MemberDetailsForm = z.infer<typeof memberDetailsSchema>;
export type PrimaryMemberDetailsForm = z.infer<
  typeof primaryMemberDetailsSchema
>;
export type Step1Form = z.infer<typeof step1Schema>;
export type CheckoutForm = z.infer<typeof checkoutFormSchema>;

// Validation helpers
export const validateMemberDetails = (
  memberData: any,
  isPrimary: boolean = false
) => {
  const schema = isPrimary ? primaryMemberDetailsSchema : memberDetailsSchema;
  return schema.safeParse(memberData);
};

export const validateStep1 = (formData: any) => {
  return step1Schema.safeParse(formData);
};

// Country list for nationality dropdown
export const COUNTRIES = [
  { value: "Indian", label: "Indian" },
  { value: "American", label: "American" },
  { value: "British", label: "British" },
  { value: "Canadian", label: "Canadian" },
  { value: "Australian", label: "Australian" },
  { value: "German", label: "German" },
  { value: "French", label: "French" },
  { value: "Italian", label: "Italian" },
  { value: "Spanish", label: "Spanish" },
  { value: "Japanese", label: "Japanese" },
  { value: "Chinese", label: "Chinese" },
  { value: "South Korean", label: "South Korean" },
  { value: "Singapore", label: "Singapore" },
  { value: "Malaysian", label: "Malaysian" },
  { value: "Thai", label: "Thai" },
  { value: "Indonesian", label: "Indonesian" },
  { value: "Filipino", label: "Filipino" },
  { value: "Vietnamese", label: "Vietnamese" },
  { value: "Dutch", label: "Dutch" },
  { value: "Belgian", label: "Belgian" },
  { value: "Swiss", label: "Swiss" },
  { value: "Austrian", label: "Austrian" },
  { value: "Swedish", label: "Swedish" },
  { value: "Norwegian", label: "Norwegian" },
  { value: "Danish", label: "Danish" },
  { value: "Finnish", label: "Finnish" },
  { value: "Russian", label: "Russian" },
  { value: "Brazilian", label: "Brazilian" },
  { value: "Argentine", label: "Argentine" },
  { value: "Chilean", label: "Chilean" },
  { value: "Mexican", label: "Mexican" },
  { value: "South African", label: "South African" },
  { value: "Egyptian", label: "Egyptian" },
  { value: "Emirati", label: "Emirati" },
  { value: "Saudi", label: "Saudi" },
  { value: "Israeli", label: "Israeli" },
  { value: "Turkish", label: "Turkish" },
  { value: "Greek", label: "Greek" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Irish", label: "Irish" },
  { value: "New Zealand", label: "New Zealand" },
  // Add more countries as needed
];

// Gender options for dropdown
export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];
