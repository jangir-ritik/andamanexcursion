"use client";

import React, { useMemo } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/atoms/Button/Button";
import { Input } from "@/components/atoms/Input/Input";
import { PhoneInput } from "@/components/atoms/PhoneInput/PhoneInput";
import { Select } from "@/components/atoms/Select/Select";
import { useCheckoutStore } from "@/store/CheckoutStore";
import type {
  UnifiedBookingData,
  PassengerRequirements,
} from "@/utils/CheckoutAdapter";
import type { CheckoutFormData } from "@/store/CheckoutStore";
import { COUNTRIES, GENDER_OPTIONS, DEFAULT_VALUES } from "@/constants";
import styles from "./MemberDetailsStep.module.css";
import { DateSelect, SectionTitle } from "@/components/atoms";
import { Ship, Target } from "lucide-react";

// Enhanced schema for member details with conditional foreign passenger fields
const memberSchema = z
  .object({
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
    passportNumber: z.string().optional(), // Made optional since only foreign passengers need it
    whatsappNumber: z.string().optional(),
    phoneCountryCode: z.string().optional(), // NEW: Store country code (+91, +1, etc.)
    phoneCountry: z.string().optional(), // NEW: Store country name (India, USA, etc.)
    email: z.string().email("Please enter a valid email").optional(),
    selectedBookings: z
      .array(z.number())
      .min(1, "Please assign to at least one booking"),
    // Foreign passenger fields for Makruzz (conditional based on nationality)
    fcountry: z.string().optional(),
    fpassport: z.string().optional(),
    fexpdate: z.string().optional(),
  })
  .refine(
    (data) => {
      // If nationality is not "Indian", foreign passenger fields are required
      const isForeigner = data.nationality !== "Indian";
      if (isForeigner) {
        return (
          data.fpassport &&
          data.fpassport.trim().length > 0 &&
          data.fexpdate &&
          data.fexpdate.trim().length > 0
        );
      }
      return true;
    },
    {
      message:
        "Passport number and expiry date are required for foreign passengers",
      path: ["fpassport"], // This will show the error on the fpassport field
    }
  );

const formSchema = z.object({
  members: z.array(memberSchema).min(1, "At least one passenger is required"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface MemberDetailsStepProps {
  bookingData: UnifiedBookingData;
  requirements: PassengerRequirements;
}

export const MemberDetailsStep: React.FC<MemberDetailsStepProps> = ({
  bookingData,
  requirements,
}) => {
  const { formData, updateFormData, nextStep, setError } = useCheckoutStore();

  // Create form defaults
  const defaultValues = useMemo((): FormData => {
    if (formData) {
      return {
        members: formData.members.map((member) => ({
          fullName: member.fullName || "",
          age: member.age || 25,
          gender: (member.gender as "Male" | "Female" | "Other") || "Male",
          nationality: member.nationality || "Indian",
          passportNumber: member.passportNumber || undefined,
          whatsappNumber: member.whatsappNumber || "",
          phoneCountryCode: member.phoneCountryCode || "+91", // NEW
          phoneCountry: member.phoneCountry || "India", // NEW
          email: member.email || "",
          selectedBookings: member.selectedBookings || [0],
          // Foreign passenger fields for Makruzz
          fcountry: member.fcountry || "",
          fpassport: member.fpassport || "",
          fexpdate: member.fexpdate || "",
        })),
        termsAccepted: formData.termsAccepted,
      };
    }

    // Create defaults based on requirements
    const members = Array.from(
      { length: requirements.totalRequired },
      (_, i) => ({
        fullName: "",
        age:
          i === 0
            ? DEFAULT_VALUES.PRIMARY_MEMBER_AGE
            : DEFAULT_VALUES.CHILD_AGE,
        gender: DEFAULT_VALUES.GENDER,
        nationality: DEFAULT_VALUES.NATIONALITY,
        passportNumber: undefined,
        whatsappNumber: i === 0 ? "" : undefined,
        phoneCountryCode:
          i === 0 ? DEFAULT_VALUES.PHONE_COUNTRY_CODE : undefined,
        phoneCountry: i === 0 ? DEFAULT_VALUES.PHONE_COUNTRY : undefined,
        email: i === 0 ? "" : undefined,
        selectedBookings: [0],
        // Initialize foreign passenger fields
        fcountry: "",
        fpassport: "",
        fexpdate: "",
      })
    );

    return {
      members,
      termsAccepted: false,
    };
  }, [formData, requirements.totalRequired]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onTouched",
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "members",
  });
  const watchedMembers = watch("members");

  // Handle form submission
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      // Convert form data to store format
      const checkoutFormData: CheckoutFormData = {
        members: data.members.map((member, index) => ({
          id: `member-${Date.now()}-${index}`,
          fullName: member.fullName,
          age: member.age,
          gender: member.gender,
          nationality: member.nationality,
          passportNumber: member.passportNumber,
          whatsappNumber: member.whatsappNumber,
          phoneCountryCode: member.phoneCountryCode, // NEW
          phoneCountry: member.phoneCountry, // NEW
          email: member.email,
          isPrimary: index === 0,
          selectedBookings: member.selectedBookings,
          // Foreign passenger fields for Makruzz
          fcountry: member.fcountry || "",
          fpassport: member.fpassport || "",
          fexpdate: member.fexpdate || "",
        })),
        termsAccepted: data.termsAccepted,
      };

      // Update store
      updateFormData(checkoutFormData);
      console.log("Enhanced checkout form data with country codes:", {
        members: checkoutFormData.members.map((m) => ({
          name: m.fullName,
          phone: m.whatsappNumber,
          phoneCountryCode: m.phoneCountryCode,
          phoneCountry: m.phoneCountry,
          nationality: m.nationality,
        })),
        termsAccepted: checkoutFormData.termsAccepted,
      });

      // Proceed to next step
      nextStep();
    } catch (error) {
      console.error("Form submission error:", error);
      setError(
        error instanceof Error ? error.message : "Form submission failed"
      );
    }
  };

  const addMember = () => {
    append({
      fullName: "",
      age: DEFAULT_VALUES.CHILD_AGE,
      gender: DEFAULT_VALUES.GENDER,
      nationality: DEFAULT_VALUES.NATIONALITY,
      passportNumber: undefined,
      phoneCountryCode: DEFAULT_VALUES.PHONE_COUNTRY_CODE,
      phoneCountry: DEFAULT_VALUES.PHONE_COUNTRY,
      selectedBookings: [0],
      // Initialize foreign passenger fields
      fcountry: "",
      fpassport: "",
      fexpdate: "",
    });
  };

  const removeMember = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className={styles.memberDetailsStep}>
      <div className={styles.header}>
        <SectionTitle
          text="Passenger Details"
          headingLevel="h1"
          specialWord="Passenger"
        />
        <p>
          Enter details for all passengers. The first passenger will be the
          primary contact.
        </p>
      </div>

      {/* Booking Requirements */}
      <div className={styles.bookingInfo}>
        <h3>Your Bookings</h3>
        <div className={styles.bookingsList}>
          {bookingData.items.map((item, index) => (
            <div key={item.id} className={styles.bookingItem}>
              <div className={styles.bookingIcon}>
                {item.type === "ferry" ? (
                  <Ship color="var(--color-primary)" size={24} />
                ) : (
                  <Target size={24} />
                )}
              </div>
              <div className={styles.bookingDetails}>
                <h4>{item.title}</h4>
                <p>
                  {item.passengers.adults} adults, {item.passengers.children}{" "}
                  children
                  {item.passengers.infants > 0 &&
                    `, ${item.passengers.infants} infants`}{" "}
                  • {item.date}
                </p>
              </div>
              <div className={styles.bookingPrice}>₹{item.price}</div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Member Forms */}
        <div className={styles.membersContainer}>
          {fields.map((field, index) => {
            const member = watchedMembers[index];
            const memberErrors = errors.members?.[index];
            const isPrimary = index === 0;

            return (
              <div key={field.id} className={styles.memberCard}>
                <div className={styles.memberHeader}>
                  <h4>
                    {isPrimary ? "Primary Contact" : `Passenger ${index + 1}`}
                  </h4>
                  {!isPrimary && fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className={styles.memberFields}>
                  {/* Basic Information */}
                  <div className={styles.fieldRow}>
                    <Input
                      name={`members.${index}.fullName`}
                      control={control}
                      label="Full Name"
                      placeholder="Enter full name"
                      hasError={!!memberErrors?.fullName}
                      required
                    />

                    <Input
                      name={`members.${index}.age`}
                      control={control}
                      type="number"
                      label="Age"
                      placeholder="Enter age"
                      min={1}
                      max={120}
                      hasError={!!memberErrors?.age}
                      required
                    />
                  </div>

                  <div className={styles.fieldRow}>
                    <Controller
                      name={`members.${index}.gender`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Gender"
                          options={GENDER_OPTIONS}
                          hasError={!!memberErrors?.gender}
                          required
                          // errorMessage={memberErrors?.gender?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`members.${index}.nationality`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Nationality"
                          options={COUNTRIES}
                          hasError={!!memberErrors?.nationality}
                          required
                          // errorMessage={memberErrors?.nationality?.message}
                        />
                      )}
                    />
                  </div>

                  {/* Passport number field (only for foreign passengers) */}
                  {member?.nationality && member.nationality !== "Indian" && (
                    <div className={styles.fieldRow}>
                      {/* <h5 className={styles.foreignFieldsTitle}>
                        Foreign Passenger Details
                      </h5> */}
                      <Input
                        name={`members.${index}.fpassport`}
                        control={control}
                        label="Passport Number"
                        placeholder="Enter passport number"
                        hasError={!!memberErrors?.fpassport}
                        required
                      />

                      <Controller
                        name={`members.${index}.fexpdate`}
                        control={control}
                        render={({ field }) => (
                          // <div className={styles.inputGroup}>
                          //   <label className={styles.inputLabel}>
                          //     Passport Expiry Date
                          //   </label>
                          //   <DateSelect
                          //     selected={field.value}
                          //     onChange={field.onChange}
                          //     hasError={!!errors.selectedDate}
                          //   />
                          //   <input
                          //     {...field}
                          //     type="date"
                          //     className={`${styles.dateInput} ${
                          //       memberErrors?.fexpdate ? styles.inputError : ""
                          //     }`}
                          //     min={new Date().toISOString().split('T')[0]}
                          //     required
                          //   />
                          //   {memberErrors?.fexpdate && (
                          //     <span className={styles.errorMessage}>
                          //       {memberErrors.fexpdate.message}
                          //     </span>
                          //   )}
                          // </div>
                          <DateSelect
                            selected={
                              field.value ? new Date(field.value) : new Date()
                            }
                            onChange={(date) => {
                              // Convert Date to ISO string for form storage
                              field.onChange(date.toISOString().split("T")[0]);
                            }}
                            label="Passport Expiry Date"
                            hasError={!!memberErrors?.fexpdate}
                            errorMessage={memberErrors?.fexpdate?.message}
                            required
                            className={styles.dateSelectField}
                          />
                        )}
                      />
                    </div>
                  )}

                  {/* Contact fields for primary member */}
                  {isPrimary && (
                    <>
                      <PhoneInput
                        name={`members.${index}.whatsappNumber`}
                        control={control}
                        label="WhatsApp Number"
                        placeholder="Enter WhatsApp number"
                        hasError={!!memberErrors?.whatsappNumber}
                        required
                        defaultCountryCode={
                          watchedMembers[index]?.phoneCountryCode || "+91"
                        }
                        onCountryChange={(countryCode, countryName) => {
                          // Update the form values when country changes
                          form.setValue(
                            `members.${index}.phoneCountryCode`,
                            countryCode
                          );
                          form.setValue(
                            `members.${index}.phoneCountry`,
                            countryName
                          );
                        }}
                      />

                      <Input
                        name={`members.${index}.email`}
                        control={control}
                        type="email"
                        label="Email Address"
                        placeholder="Enter email address"
                        hasError={!!memberErrors?.email}
                        required
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Member Button */}
        <div className={styles.addMemberSection}>
          <Button
            type="button"
            variant="outline"
            onClick={addMember}
            className={styles.addMemberButton}
          >
            Add Another Passenger
          </Button>
        </div>

        {/* Terms and Conditions */}
        <div className={styles.termsSection}>
          <Controller
            name="termsAccepted"
            control={control}
            render={({ field: { value, onChange } }) => (
              <label className={styles.termsLabel}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  className={styles.termsCheckbox}
                />
                <span className={styles.termsText}>
                  I accept the{" "}
                  <a href="/terms" target="_blank" className={styles.termsLink}>
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    className={styles.termsLink}
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
            )}
          />
          {errors.termsAccepted && (
            <div className={styles.termsError}>
              {errors.termsAccepted.message}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className={styles.submitSection}>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={!isValid}
            className={styles.submitButton}
          >
            Review Booking
          </Button>
        </div>
      </form>
    </div>
  );
};
