"use client";
import React, { useMemo } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Minus,
  Plus,
  Copy,
  X,
  Users,
  AlertCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/atoms/Button/Button";
import { Input } from "@/components/atoms/Input/Input";
import { PhoneInput } from "@/components/atoms/PhoneInput/PhoneInput";
import { Select } from "@/components/atoms/Select/Select";
import {
  useCheckoutStore,
  useActivityMetadata,
  useFerryMetadata,
  useAllMetadata,
  type CheckoutFormData,
  type MemberDetails,
} from "@/store/CheckoutStore";
import {
  createStep1SchemaWithActivities,
  step1Schema,
  COUNTRIES,
  GENDER_OPTIONS,
  type Step1Form,
} from "../../schemas/checkoutSchemas";
import { cn } from "@/utils/cn";
import styles from "./MemberDetailsStep.module.css";
import { DescriptionText, SectionTitle } from "@/components/atoms";

// Generate unique member ID
const generateMemberId = (): string => {
  return `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const MemberDetailsStep: React.FC = () => {
  // Get store methods and data
  const {
    getFormDefaults,
    updateFormData,
    nextStep,
    isLoading,
    isInitialized,
    getMinimumMembersNeeded,
  } = useCheckoutStore();

  const activityMetadata = useActivityMetadata();
  const ferryMetadata = useFerryMetadata();
  const allMetadata = useAllMetadata();

  // Debug logging to identify the issue
  console.log("MemberDetailsStep - Store state:", {
    activityMetadata,
    ferryMetadata,
    allMetadata,
    isInitialized,
  });

  // Get form defaults from store (single source of truth)
  const formDefaults = useMemo(() => {
    try {
      const defaults = getFormDefaults();
      // Convert MemberDetails to Step1Form format
      return {
        members: (defaults.members || []).map((member) => ({
          fullName: member.fullName || "",
          age: member.age || 25,
          gender: (member.gender as "Male" | "Female" | "Other") || "Male",
          nationality: member.nationality || "Indian",
          passportNumber: member.passportNumber || "",
          whatsappNumber: member.whatsappNumber || "",
          email: member.email || "",
          selectedActivities: member.selectedActivities || [],
        })),
        termsAccepted: defaults.termsAccepted || false,
      };
    } catch (error) {
      console.error("Error getting form defaults:", error);
      return {
        members: [],
        termsAccepted: false,
      };
    }
  }, [getFormDefaults]);

  // Setup form with Zod validation
  const form = useForm<Step1Form>({
    resolver: zodResolver(
      allMetadata && allMetadata.length > 0
        ? createStep1SchemaWithActivities(allMetadata)
        : step1Schema
    ),
    defaultValues: formDefaults,
    mode: "onTouched",
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "members",
  });

  // Watch for UI updates
  const watchedMembers = watch("members");
  const minimumMembersNeeded = (() => {
    try {
      return getMinimumMembersNeeded();
    } catch (error) {
      console.error("Error getting minimum members needed:", error);
      return 0;
    }
  })();

  // Handle form submission (Form → Store)
  const onSubmit: SubmitHandler<Step1Form> = async (data) => {
    try {
      // Convert Step1Form to CheckoutFormData format
      const checkoutFormData: CheckoutFormData = {
        members: data.members.map((member, index) => ({
          id: fields[index]?.id || generateMemberId(),
          fullName: member.fullName,
          age: member.age,
          gender: member.gender || "",
          nationality: member.nationality,
          passportNumber: member.passportNumber,
          whatsappNumber: member.whatsappNumber,
          email: member.email,
          isPrimary: index === 0,
          selectedActivities: member.selectedActivities,
        })),
        termsAccepted: data.termsAccepted,
      };

      updateFormData(checkoutFormData);

      // Navigate to next step
      nextStep();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Add member helper
  const handleAddMember = () => {
    const newMember = {
      fullName: "",
      age: 12,
      gender: "Male" as const,
      nationality: "Indian",
      passportNumber: "",
      whatsappNumber: "",
      email: "",
      selectedActivities: [] as number[],
    };

    append(newMember);
  };

  // Remove member helper
  const handleRemoveMember = (index: number) => {
    if (fields.length > minimumMembersNeeded && index > 0) {
      remove(index);
    }
  };

  // Copy member details helper
  const handleCopyMemberDetails = (
    sourceIndex: number,
    targetIndex: number
  ) => {
    const sourceMember = watchedMembers[sourceIndex];
    if (!sourceMember) return;

    // Copy relevant fields (not contact info or primary status)
    setValue(`members.${targetIndex}.fullName`, sourceMember.fullName);
    setValue(`members.${targetIndex}.age`, sourceMember.age);
    setValue(`members.${targetIndex}.gender`, sourceMember.gender);
    setValue(`members.${targetIndex}.nationality`, sourceMember.nationality);
    setValue(
      `members.${targetIndex}.passportNumber`,
      sourceMember.passportNumber
    );
  };

  // Toggle activity assignment
  const toggleActivityAssignment = (
    memberIndex: number,
    activityIndex: number
  ) => {
    const currentActivities =
      watchedMembers[memberIndex]?.selectedActivities || [];
    const isAssigned = currentActivities.includes(activityIndex);

    let newActivities: number[];
    if (isAssigned) {
      newActivities = currentActivities.filter((id) => id !== activityIndex);
    } else {
      newActivities = [...currentActivities, activityIndex];
    }

    setValue(`members.${memberIndex}.selectedActivities`, newActivities);
  };

  // Loading state
  if (!isInitialized || isLoading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Initializing checkout...</p>
      </div>
    );
  }

  // No bookings state
  if (allMetadata.length === 0) {
    return (
      <div className={styles.errorState}>
        <AlertCircle className={styles.errorIcon} />
        <h3>No Bookings Found</h3>
        <p>
          Please add activities or ferry bookings to your cart before proceeding
          to checkout.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.memberDetailsStep}>
      <div className={styles.header}>
        <SectionTitle text="Add Member Details" specialWord="Member Details" />
        <DescriptionText text="Enter details for all passengers. The first passenger will be the primary contact." />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Booking Requirements Info */}
        <div className={styles.activityInfo}>
          <div className={styles.infoHeader}>
            <Info size={20} className={styles.infoIcon} />
            <h3>Booking Requirements</h3>
          </div>
          <div className={styles.activitiesList}>
            {activityMetadata.map((activity, index) => (
              <div key={`activity-${index}`} className={styles.activityItem}>
                <div className={styles.activityDetails}>
                  <h4>🎯 {activity.title}</h4>
                  <span className={styles.activityMeta}>
                    {activity.adults} adults, {activity.children} children ·{" "}
                    {activity.date} · {activity.location}
                  </span>
                </div>
                <div className={styles.passengerCount}>
                  {activity.totalRequired} passengers needed
                </div>
              </div>
            ))}
            {ferryMetadata.map((ferry, index) => (
              <div key={`ferry-${index}`} className={styles.activityItem}>
                <div className={styles.activityDetails}>
                  <h4>🚢 {ferry.title}</h4>
                  <span className={styles.activityMeta}>
                    {ferry.adults} adults, {ferry.children} children
                    {ferry.infants > 0 && `, ${ferry.infants} infants`} ·{" "}
                    {ferry.date} · {ferry.fromLocation} → {ferry.toLocation}
                  </span>
                </div>
                <div className={styles.passengerCount}>
                  {ferry.totalRequired} passengers needed
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member Forms */}
        <div className={styles.membersContainer}>
          {fields.map((field, memberIndex) => {
            const member = watchedMembers[memberIndex];
            const isPrimary = memberIndex === 0;
            const memberErrors = errors.members?.[memberIndex];

            return (
              <div
                key={field.id}
                className={cn(
                  styles.memberCard,
                  isPrimary && styles.primaryMember
                )}
              >
                {/* Member Header */}
                <div className={styles.memberHeader}>
                  <div className={styles.memberTitle}>
                    <Users size={20} />
                    <h3>
                      Passenger {memberIndex + 1}
                      {isPrimary && (
                        <span className={styles.primaryBadge}>
                          Primary Contact
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* Copy/Remove Actions */}
                  <div className={styles.memberActions}>
                    {memberIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => handleCopyMemberDetails(0, memberIndex)}
                        className={styles.copyButton}
                        title="Copy from primary passenger"
                      >
                        <Copy size={16} />
                      </button>
                    )}

                    {memberIndex > 0 &&
                      fields.length > minimumMembersNeeded && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(memberIndex)}
                          className={styles.removeButton}
                          title="Remove passenger"
                        >
                          <X size={16} />
                        </button>
                      )}
                  </div>
                </div>

                {/* Member Form Fields */}
                <div className={styles.memberForm}>
                  <div className={styles.formGrid}>
                    {/* Full Name */}
                    <div className={styles.formField}>
                      <Input
                        name={`members.${memberIndex}.fullName`}
                        control={control}
                        label="Full Name (as per ID)"
                        placeholder="Enter full name"
                        hasError={!!memberErrors?.fullName}
                        required
                      />
                    </div>

                    {/* Age */}
                    <div className={styles.formField}>
                      <Input
                        name={`members.${memberIndex}.age`}
                        control={control}
                        type="number"
                        label="Age"
                        placeholder="Age"
                        min={1}
                        max={120}
                        hasError={!!memberErrors?.age}
                        required
                      />
                    </div>

                    {/* Gender */}
                    <div className={styles.formField}>
                      <Controller
                        name={`members.${memberIndex}.gender`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onChange={field.onChange}
                            label="Gender"
                            placeholder="Select gender"
                            options={GENDER_OPTIONS}
                            hasError={!!memberErrors?.gender}
                          />
                        )}
                      />
                    </div>

                    {/* Nationality */}
                    <div className={styles.formField}>
                      <Controller
                        name={`members.${memberIndex}.nationality`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onChange={field.onChange}
                            label="Nationality"
                            placeholder="Select nationality"
                            options={COUNTRIES}
                            hasError={!!memberErrors?.nationality}
                          />
                        )}
                      />
                    </div>

                    {/* Passport Number */}
                    <div className={styles.formField}>
                      <Input
                        name={`members.${memberIndex}.passportNumber`}
                        control={control}
                        label="Passport Number"
                        placeholder="Enter passport number"
                        hasError={!!memberErrors?.passportNumber}
                        required
                      />
                    </div>

                    {/* Contact fields for primary member */}
                    {isPrimary && (
                      <>
                        <div className={styles.formField}>
                          <PhoneInput
                            name={`members.${memberIndex}.whatsappNumber`}
                            control={control}
                            label="WhatsApp Number"
                            placeholder="Enter WhatsApp number"
                            hasError={!!memberErrors?.whatsappNumber}
                            required
                          />
                        </div>

                        <div className={styles.formField}>
                          <Input
                            name={`members.${memberIndex}.email`}
                            control={control}
                            type="email"
                            label="Email Address"
                            placeholder="Enter email address"
                            hasError={!!memberErrors?.email}
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Booking Assignment */}
                  <div className={styles.activityAssignment}>
                    <h4 className={styles.assignmentTitle}>
                      Booking Assignment
                    </h4>
                    <p className={styles.assignmentDescription}>
                      Select which bookings this passenger will be included in:
                    </p>

                    <div className={styles.activityCheckboxes}>
                      {activityMetadata.map((activity, activityIndex) => {
                        const isAssigned =
                          member?.selectedActivities?.includes(activityIndex) ||
                          false;

                        return (
                          <div
                            key={`activity-${activityIndex}`}
                            className={cn(
                              styles.activityCheckbox,
                              isAssigned && styles.assigned
                            )}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                toggleActivityAssignment(
                                  memberIndex,
                                  activityIndex
                                )
                              }
                              className={styles.checkboxButton}
                            >
                              <div className={styles.checkbox}>
                                {isAssigned && <Check size={16} />}
                              </div>
                              <div className={styles.activityLabel}>
                                <span className={styles.activityName}>
                                  🎯 {activity.title}
                                </span>
                                <span className={styles.activityMeta}>
                                  {activity.date} · {activity.location}
                                </span>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                      {ferryMetadata.map((ferry, ferryIndex) => {
                        const totalIndex = activityMetadata.length + ferryIndex;
                        const isAssigned =
                          member?.selectedActivities?.includes(totalIndex) ||
                          false;

                        return (
                          <div
                            key={`ferry-${ferryIndex}`}
                            className={cn(
                              styles.activityCheckbox,
                              isAssigned && styles.assigned
                            )}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                toggleActivityAssignment(
                                  memberIndex,
                                  totalIndex
                                )
                              }
                              className={styles.checkboxButton}
                            >
                              <div className={styles.checkbox}>
                                {isAssigned && <Check size={16} />}
                              </div>
                              <div className={styles.activityLabel}>
                                <span className={styles.activityName}>
                                  🚢 {ferry.title}
                                </span>
                                <span className={styles.activityMeta}>
                                  {ferry.date} · {ferry.fromLocation} →{" "}
                                  {ferry.toLocation}
                                </span>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {memberErrors?.selectedActivities && (
                      <div className={styles.fieldError}>
                        {memberErrors.selectedActivities.message}
                      </div>
                    )}
                  </div>
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
            onClick={handleAddMember}
            className={styles.addMemberButton}
          >
            <Plus size={20} />
            Add Another Passenger
          </Button>
          <p className={styles.addMemberNote}>
            Minimum {minimumMembersNeeded} passengers required for selected
            activities
          </p>
        </div>

        {/* Terms and Conditions */}
        <div className={styles.termsSection}>
          <Controller
            name="termsAccepted"
            control={control}
            render={({ field }) => (
              <div className={styles.termsCheckbox}>
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={cn(
                    styles.termsButton,
                    field.value && styles.checked
                  )}
                >
                  <div className={styles.checkbox}>
                    {field.value && <Check size={16} />}
                  </div>
                  <span className={styles.termsText}>
                    I accept the{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      className={styles.termsLink}
                    >
                      terms and conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      className={styles.termsLink}
                    >
                      privacy policy
                    </a>
                  </span>
                </button>
                {errors.termsAccepted && (
                  <div className={styles.fieldError}>
                    {errors.termsAccepted.message}
                  </div>
                )}
              </div>
            )}
          />
        </div>

        {/* Form Errors */}
        {errors.members && typeof errors.members.message === "string" && (
          <div className={styles.formError}>
            <AlertCircle size={20} />
            {errors.members.message}
          </div>
        )}

        {/* Submit Button */}
        <div className={styles.submitSection}>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "Processing..." : "Continue to Review"}
          </Button>
        </div>
      </form>
    </div>
  );
};
