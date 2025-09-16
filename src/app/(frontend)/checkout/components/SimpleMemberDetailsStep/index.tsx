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
import { useSimpleCheckoutStore } from "@/store/SimpleCheckoutStore";
import type {
  UnifiedBookingData,
  PassengerRequirements,
} from "@/utils/CheckoutAdapter";
import type { CheckoutFormData } from "@/store/SimpleCheckoutStore";
import { COUNTRIES, GENDER_OPTIONS } from "../../schemas/checkoutSchemas";
import styles from "./SimpleMemberDetailsStep.module.css";
import { SectionTitle } from "@/components/atoms";
import { Ship, Target } from "lucide-react";

// Simplified schema for member details
const memberSchema = z.object({
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
    .transform((val) => val.toUpperCase()),
  whatsappNumber: z.string().optional(),
  phoneCountryCode: z.string().optional(), // NEW: Store country code (+91, +1, etc.)
  phoneCountry: z.string().optional(), // NEW: Store country name (India, USA, etc.)
  email: z.string().email("Please enter a valid email").optional(),
  selectedBookings: z
    .array(z.number())
    .min(1, "Please assign to at least one booking"),
});

const formSchema = z.object({
  members: z.array(memberSchema).min(1, "At least one passenger is required"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface SimpleMemberDetailsStepProps {
  bookingData: UnifiedBookingData;
  requirements: PassengerRequirements;
}

export const SimpleMemberDetailsStep: React.FC<
  SimpleMemberDetailsStepProps
> = ({ bookingData, requirements }) => {
  const { formData, updateFormData, nextStep, setError } =
    useSimpleCheckoutStore();

  // Create form defaults
  const defaultValues = useMemo((): FormData => {
    if (formData) {
      return {
        members: formData.members.map((member) => ({
          fullName: member.fullName || "",
          age: member.age || 25,
          gender: (member.gender as "Male" | "Female" | "Other") || "Male",
          nationality: member.nationality || "Indian",
          passportNumber: member.passportNumber || "",
          whatsappNumber: member.whatsappNumber || "",
          phoneCountryCode: member.phoneCountryCode || "+91", // NEW
          phoneCountry: member.phoneCountry || "India", // NEW
          email: member.email || "",
          selectedBookings: member.selectedBookings || [0],
        })),
        termsAccepted: formData.termsAccepted,
      };
    }

    // Create defaults based on requirements
    const members = Array.from(
      { length: requirements.totalRequired },
      (_, i) => ({
        fullName: "",
        age: i === 0 ? 25 : 12,
        gender: "Male" as const,
        nationality: "Indian",
        passportNumber: "",
        whatsappNumber: i === 0 ? "" : undefined,
        phoneCountryCode: i === 0 ? "+91" : undefined, // NEW
        phoneCountry: i === 0 ? "India" : undefined, // NEW
        email: i === 0 ? "" : undefined,
        selectedBookings: [0],
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
      age: 12,
      gender: "Male",
      nationality: "Indian",
      passportNumber: "",
      phoneCountryCode: "+91", // NEW: Default country code
      phoneCountry: "India", // NEW: Default country name
      selectedBookings: [0],
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

                  <Input
                    name={`members.${index}.passportNumber`}
                    control={control}
                    label="Passport Number"
                    placeholder="Enter passport number"
                    hasError={!!memberErrors?.passportNumber}
                    required
                  />

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
                          // console.log(
                          //   `Country changed for passenger ${index + 1}:`,
                          //   {
                          //     code: countryCode,
                          //     name: countryName,
                          //   }
                          // );
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
