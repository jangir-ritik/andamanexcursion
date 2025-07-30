import { z } from "zod";

// Base member details schema for common fields
const baseMemberDetailsSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name must contain only letters, spaces, apostrophes, and hyphens"
    ),

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
    .regex(
      /^[A-Za-z0-9]{6,12}$/,
      "Invalid passport format. Use only letters and numbers"
    )
    .transform((val) => val.toUpperCase()),

  // Activity assignment - required for all members
  selectedActivities: z
    .array(z.number().int().min(0))
    .min(1, "Please select at least one activity for this passenger")
    .refine(
      (activities) => activities.length > 0,
      "Each passenger must be assigned to at least one activity"
    ),

  // Optional contact fields for non-primary members
  whatsappNumber: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      return /^\+?[0-9\s\-\(\)]{8,20}$/.test(val);
    }, "Invalid WhatsApp number format"),

  email: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      return z.string().email().safeParse(val).success;
    }, "Invalid email format"),
});

// Regular member schema
export const memberDetailsSchema = baseMemberDetailsSchema;

// Primary member schema with required contact fields
export const primaryMemberDetailsSchema = baseMemberDetailsSchema.extend({
  whatsappNumber: z
    .string()
    .min(1, "WhatsApp number is required for the primary member")
    .regex(/^\+?[0-9\s\-\(\)]{8,20}$/, "Invalid WhatsApp number format"),

  email: z
    .string()
    .min(1, "Email is required for the primary member")
    .email("Invalid email format"),
});

// Step 1 schema with enhanced validation
export const step1Schema = z.object({
  members: z
    .array(z.union([memberDetailsSchema, primaryMemberDetailsSchema]))
    .min(1, "At least one passenger is required")
    .refine((members) => {
      // Validate that first member is primary with required fields
      if (members.length === 0) return false;

      const primaryMember = members[0];
      const primaryValidation =
        primaryMemberDetailsSchema.safeParse(primaryMember);

      if (!primaryValidation.success) {
        console.error(
          "Primary member validation failed:",
          primaryValidation.error
        );
        return false;
      }

      // Validate other members
      for (let i = 1; i < members.length; i++) {
        const member = members[i];
        const memberValidation = memberDetailsSchema.safeParse(member);

        if (!memberValidation.success) {
          console.error(
            `Member ${i + 1} validation failed:`,
            memberValidation.error
          );
          return false;
        }
      }

      return true;
    }, "All passenger details must be complete and valid")
    .superRefine((members, ctx) => {
      // Check that each member has at least one activity selected
      members.forEach((member, index) => {
        if (
          !member.selectedActivities ||
          member.selectedActivities.length === 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Passenger ${
              index + 1
            } must be assigned to at least one activity`,
            path: ["members", index, "selectedActivities"],
          });
        }
      });
    }),

  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions to proceed",
  }),
});

// Enhanced validation with activity-specific checks
export const createStep1SchemaWithActivities = (
  activities: Array<{
    title: string;
    totalRequired: number;
    adults: number;
    children: number;
    infants: number;
  }>
) => {
  return step1Schema.extend({
    members: z
      .array(z.union([memberDetailsSchema, primaryMemberDetailsSchema]))
      .min(1, "At least one passenger is required")
      .superRefine((members, ctx) => {
        // Check activity assignment counts
        const assignmentCounts = activities.map(() => 0);

        members.forEach((member, memberIndex) => {
          if (
            !member.selectedActivities ||
            member.selectedActivities.length === 0
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Must select at least one activity",
              path: ["members", memberIndex, "selectedActivities"],
            });
            return;
          }

          member.selectedActivities.forEach((activityIndex: number) => {
            if (activityIndex >= 0 && activityIndex < assignmentCounts.length) {
              assignmentCounts[activityIndex]++;
            }
          });
        });

        // Validate each activity has enough passengers
        activities.forEach((activity, activityIndex) => {
          const required = activity.totalRequired || 0;
          const assigned = assignmentCounts[activityIndex];

          if (assigned < required) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${activity.title} needs ${
                required - assigned
              } more passengers`,
              path: ["members"],
            });
          }
        });
      }),
  });
};

// Step 2 schema - Review
export const step2Schema = step1Schema;

// Step 3 schema - Confirmation
export const step3Schema = z.object({
  bookingConfirmed: z.boolean().optional(),
});

// Complete checkout form schema
export const checkoutFormSchema = z.object({
  step1: step1Schema,
  currentStep: z.number().min(1).max(3),
});

// Type inference with better typing
export type MemberDetailsForm = z.infer<typeof memberDetailsSchema>;
export type PrimaryMemberDetailsForm = z.infer<
  typeof primaryMemberDetailsSchema
>;
export type Step1Form = z.infer<typeof step1Schema>;
export type CheckoutForm = z.infer<typeof checkoutFormSchema>;

// Enhanced validation helpers
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

export const validateStep1WithActivities = (
  formData: any,
  activities: any[]
) => {
  const schema = createStep1SchemaWithActivities(activities);
  return schema.safeParse(formData);
};

// Utility function to get validation errors in a readable format
export const getValidationErrors = (
  result: z.SafeParseReturnType<any, any>
) => {
  if (result.success) return [];

  return result.error.errors.map((error) => ({
    path: error.path.join("."),
    message: error.message,
    code: error.code,
  }));
};

// Country list for nationality dropdown (unchanged)
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
];

// Gender options for dropdown (unchanged)
export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];
