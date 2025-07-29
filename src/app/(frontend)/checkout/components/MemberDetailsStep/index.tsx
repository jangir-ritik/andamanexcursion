"use client";
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { useCheckoutStore, useCurrentStep } from "@/store/CheckoutStore";
import { SectionTitle } from "@/components/atoms/SectionTitle/SectionTitle";
import { Input } from "@/components/atoms/Input/Input";
import { Select } from "@/components/atoms/Select/Select";
import { PhoneInput } from "@/components/atoms/PhoneInput/PhoneInput";
import { Button } from "@/components/atoms/Button/Button";
import {
  step1Schema,
  COUNTRIES,
  GENDER_OPTIONS,
} from "../../schemas/checkoutSchemas";
import type { Step1Form } from "../../schemas/checkoutSchemas";
import { cn } from "@/utils/cn";
import styles from "./MemberDetailsStep.module.css";

export const MemberDetailsStep: React.FC = () => {
  const { members, updateMember, nextStep, termsAccepted, setTermsAccepted } =
    useCheckoutStore();
  const currentStep = useCurrentStep();
  const [expandedMembers, setExpandedMembers] = useState<Set<number>>(
    new Set([0])
  ); // First member expanded by default

  // Debug current step changes
  useEffect(() => {
    console.log("🔄 Current step in MemberDetailsStep:", currentStep);
  }, [currentStep]);

  // Initialize form with current member data
  const form = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    mode: "onChange",
    defaultValues: {
      members: members.map((member) => ({
        fullName: member.fullName || "",
        age: member.age || 25,
        gender: (member.gender as "Male" | "Female" | "Other") || undefined,
        nationality: member.nationality || "Indian",
        passportNumber: member.passportNumber || "",
        whatsappNumber: member.whatsappNumber || "",
        email: member.email || "",
      })),
      termsAccepted: termsAccepted,
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid, dirtyFields },
  } = form;

  const { fields } = useFieldArray({
    control,
    name: "members",
  });

  // Watch form changes to update store
  const watchedMembers = watch("members");
  const watchedTerms = watch("termsAccepted");

  // Update store when form values change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      watchedMembers.forEach((memberData, index) => {
        if (members[index]) {
          updateMember(members[index].id, {
            ...memberData,
            age: Number(memberData.age) || 0,
          });
        }
      });
    }, 100); // Small debounce to prevent excessive updates

    return () => clearTimeout(timeoutId);
  }, [watchedMembers, members, updateMember]);

  useEffect(() => {
    setTermsAccepted(watchedTerms || false);
  }, [watchedTerms, setTermsAccepted]);

  // Re-initialize form when members change from store
  useEffect(() => {
    if (members.length > 0) {
      const newFormValues = {
        members: members.map((member) => ({
          fullName: member.fullName || "",
          age: member.age || 25,
          gender: (member.gender as "Male" | "Female" | "Other") || undefined,
          nationality: member.nationality || "Indian",
          passportNumber: member.passportNumber || "",
          whatsappNumber: member.whatsappNumber || "",
          email: member.email || "",
        })),
        termsAccepted: termsAccepted,
      };

      // Only reset form if member data has actually changed, not just terms
      const currentFormValues = form.getValues();
      const membersChanged =
        JSON.stringify(currentFormValues.members) !==
        JSON.stringify(newFormValues.members);

      if (membersChanged) {
        console.log("🔄 Re-initializing form with store data");
        form.reset(newFormValues);
      }
    }
  }, [members, termsAccepted, form]);

  // Toggle member form expansion
  const toggleMemberExpansion = (index: number) => {
    setExpandedMembers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Get member label
  const getMemberLabel = (index: number, age: number) => {
    const isAdult = age >= 18;
    const memberType = isAdult ? "Adult" : "Kid";
    const memberNumber = index + 1;
    return `${memberType} ${memberNumber}`;
  };

  // Check if form can proceed - more lenient than strict validation
  const canProceed = () => {
    // Basic checks - at least primary member has required fields
    const primaryMember = watchedMembers[0];
    console.log("primaryMember", primaryMember);
    console.log("watchedTerms", watchedTerms);
    console.log("Form errors:", errors);
    console.log("Form isValid:", isValid);
    if (!primaryMember) return false;

    const hasBasicInfo =
      primaryMember.fullName &&
      primaryMember.age &&
      primaryMember.gender &&
      primaryMember.nationality &&
      primaryMember.passportNumber &&
      primaryMember.whatsappNumber &&
      primaryMember.email;

    console.log("hasBasicInfo", hasBasicInfo);
    console.log("Final canProceed result:", hasBasicInfo && watchedTerms);
    return hasBasicInfo && watchedTerms;
  };

  // Handle form submission
  const onSubmit = async (data: Step1Form) => {
    console.log("🎯 Form submitted successfully:", data);
    console.log("Current members in store:", members);

    // Validate the form data
    const validation = step1Schema.safeParse(data);
    if (!validation.success) {
      console.error("Validation errors:", validation.error);
      console.error("Validation error details:", validation.error.flatten());

      // Show specific validation errors in console for debugging
      validation.error.issues.forEach((issue, index) => {
        console.error(`Validation Issue ${index + 1}:`, {
          path: issue.path,
          message: issue.message,
          code: issue.code,
        });
      });
      return;
    }

    console.log("✅ Validation passed successfully");

    // Update store with final values
    data.members.forEach((memberData, index) => {
      if (members[index]) {
        console.log(`Updating member ${index}:`, memberData);
        updateMember(members[index].id, {
          ...memberData,
          age: Number(memberData.age) || 0,
        });
      }
    });

    setTermsAccepted(data.termsAccepted);

    console.log("🚀 About to call nextStep()");
    // Move to next step
    nextStep();
    console.log("✅ nextStep() called");
  };

  // Add error handler for form submission errors
  const onError = (errors: any) => {
    console.error("❌ Form submission failed with errors:", errors);
    console.error("All form errors:", form.formState.errors);
  };

  // Debug button click
  const handleButtonClick = () => {
    console.log("🔘 Continue button clicked!");
    const formValues = form.getValues();
    console.log("Current form values:", formValues);
    console.log("Primary member age type:", typeof formValues.members[0]?.age);
    console.log("Primary member age value:", formValues.members[0]?.age);
    console.log("Can proceed:", canProceed());

    // Test manual validation
    const testValidation = step1Schema.safeParse(formValues);
    console.log("Manual validation result:", testValidation);
    if (!testValidation.success) {
      console.error(
        "Manual validation errors:",
        testValidation.error.flatten()
      );
    }
  };

  return (
    <div className={styles.memberDetailsStep}>
      <div className={styles.header}>
        <SectionTitle
          text="Add Member Details"
          specialWord="Member Details"
          className={styles.title}
        />
        <p className={styles.description}>
          Please fill in the details for all travelers. Contact information is
          required for the primary member only.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className={styles.form}>
        {/* Member Forms */}
        <div className={styles.membersSection}>
          {fields.map((field, index) => {
            const member = members[index];
            const isExpanded = expandedMembers.has(index);
            const isPrimary = index === 0;
            const memberAge = watchedMembers[index]?.age || member?.age || 25;
            const memberLabel = getMemberLabel(index, memberAge);

            // Only render if we have a corresponding member in the store
            if (!member) {
              console.log(
                `⚠️ No member found for index ${index}, skipping render`
              );
              return null;
            }

            return (
              <div key={field.id} className={styles.memberCard}>
                {/* Member Card Header */}
                <div
                  className={styles.memberCardHeader}
                  onClick={() => toggleMemberExpansion(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleMemberExpansion(index);
                    }
                  }}
                >
                  <div className={styles.memberInfo}>
                    <h3 className={styles.memberTitle}>
                      {memberLabel}
                      {isPrimary && (
                        <span className={styles.primaryBadge}>Primary</span>
                      )}
                    </h3>
                    {watchedMembers[index]?.fullName && (
                      <p className={styles.memberName}>
                        {watchedMembers[index].fullName}
                      </p>
                    )}
                  </div>
                  <div className={styles.expandIcon}>
                    {isExpanded ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </div>

                {/* Member Form Content */}
                {isExpanded && (
                  <div className={styles.memberCardContent}>
                    {/* Basic Details Section */}
                    <div className={styles.formSection}>
                      <h4 className={styles.sectionTitle}>Basic Details</h4>
                      <div className={styles.formGrid}>
                        {/* Full Name */}
                        <div className={styles.formField}>
                          <Input
                            name={`members.${index}.fullName`}
                            control={control}
                            label="Full Name"
                            placeholder="Enter full name as per ID"
                            required
                            hasError={!!errors.members?.[index]?.fullName}
                          />
                        </div>

                        {/* Age */}
                        <div className={styles.formField}>
                          <Input
                            name={`members.${index}.age`}
                            control={control}
                            label="Age"
                            type="number"
                            min={1}
                            max={120}
                            placeholder="Enter age"
                            required
                            hasError={!!errors.members?.[index]?.age}
                          />
                        </div>

                        {/* Gender */}
                        <div className={styles.formField}>
                          <Controller
                            name={`members.${index}.gender`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                value={field.value || ""}
                                onChange={field.onChange}
                                label="Gender"
                                placeholder="Select gender"
                                options={GENDER_OPTIONS}
                                hasError={!!errors.members?.[index]?.gender}
                              />
                            )}
                          />
                        </div>

                        {/* Nationality */}
                        <div className={styles.formField}>
                          <Controller
                            name={`members.${index}.nationality`}
                            control={control}
                            render={({ field }) => (
                              <Select
                                value={field.value || ""}
                                onChange={field.onChange}
                                label="Nationality"
                                placeholder="Select nationality"
                                options={COUNTRIES}
                                hasError={
                                  !!errors.members?.[index]?.nationality
                                }
                              />
                            )}
                          />
                        </div>

                        {/* Passport Number */}
                        <div className={cn(styles.formField, styles.fullWidth)}>
                          <Input
                            name={`members.${index}.passportNumber`}
                            control={control}
                            label="Passport Number"
                            placeholder="Enter passport number"
                            required
                            hasError={!!errors.members?.[index]?.passportNumber}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Details Section (only for primary member or if filled) */}
                    {(isPrimary ||
                      watchedMembers[index]?.whatsappNumber ||
                      watchedMembers[index]?.email) && (
                      <div className={styles.formSection}>
                        <h4 className={styles.sectionTitle}>
                          Contact Details
                          {isPrimary && (
                            <span className={styles.requiredNote}>
                              (Required)
                            </span>
                          )}
                        </h4>
                        <div className={styles.formGrid}>
                          {/* WhatsApp Number */}
                          <div className={styles.formField}>
                            <PhoneInput
                              name={`members.${index}.whatsappNumber`}
                              control={control}
                              label="WhatsApp Number"
                              placeholder="Enter WhatsApp number"
                              required={isPrimary}
                              hasError={
                                !!errors.members?.[index]?.whatsappNumber
                              }
                            />
                            {isPrimary && (
                              <p className={styles.fieldNote}>
                                <Info size={16} /> Ticket will be sent via
                                WhatsApp
                              </p>
                            )}
                          </div>

                          {/* Email */}
                          <div className={styles.formField}>
                            <Input
                              name={`members.${index}.email`}
                              control={control}
                              label="Email ID"
                              type="email"
                              placeholder="Enter email address"
                              required={isPrimary}
                              hasError={!!errors.members?.[index]?.email}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Terms & Conditions */}
        <div className={styles.termsSection}>
          <div className={styles.termsCard}>
            <h3 className={styles.termsTitle}>Terms & Conditions</h3>
            <ul className={styles.termsList}>
              <li>48+ hours before departure: ₹250 per ticket</li>
              <li>24-48 hours before: 50% of ticket price</li>
              <li>&lt;24 hours: 100% of ticket price (no refund)</li>
            </ul>

            <div className={styles.termsCheckbox}>
              <Controller
                name="termsAccepted"
                control={control}
                render={({ field }) => (
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={field.value || false}
                      onChange={field.onChange}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>
                      I agree with the{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        className={styles.termsLink}
                      >
                        Terms & Conditions
                      </a>
                    </span>
                  </label>
                )}
              />
              {errors.termsAccepted && (
                <p className={styles.errorMessage}>
                  {errors.termsAccepted.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className={styles.buttonSection}>
          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={!canProceed()}
            className={styles.continueButton}
            onClick={handleButtonClick}
          >
            Continue to Review
          </Button>
        </div>
      </form>
    </div>
  );
};
