"use client";
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  ChevronUp,
  Info,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import {
  useCheckoutStore,
  useCurrentStep,
  useCheckoutItems,
} from "@/store/CheckoutStore";
import { SectionTitle } from "@/components/atoms/SectionTitle/SectionTitle";
import { Input } from "@/components/atoms/Input/Input";
import { Select } from "@/components/atoms/Select/Select";
import { PhoneInput } from "@/components/atoms/PhoneInput/PhoneInput";
import { Button } from "@/components/atoms/Button/Button";
import {
  createStep1SchemaWithActivities,
  validateStep1WithActivities,
  getValidationErrors,
  COUNTRIES,
  GENDER_OPTIONS,
} from "../../schemas/checkoutSchemas";
import type { Step1Form } from "../../schemas/checkoutSchemas";
import { cn } from "@/utils/cn";
import styles from "./MemberDetailsStep.module.css";

interface MemberDetailsStepProps {
  // Removed onActivityComplete prop - flow handled internally
}

export const MemberDetailsStep: React.FC<MemberDetailsStepProps> = () => {
  const {
    members,
    updateMember,
    nextStep,
    termsAccepted,
    setTermsAccepted,
    getTotalActivities,
    isLastActivity,
    // New unified member management functions
    getMinimumMembersNeeded,
    addExtraMember,
    removeMember,
    canRemoveMember,
  } = useCheckoutStore();
  const checkoutItems = useCheckoutItems();
  const currentStep = useCurrentStep();
  const [expandedMembers, setExpandedMembers] = useState<Set<number>>(
    new Set([0])
  ); // First member expanded by default

  // Get all activities for selection
  const allActivities = checkoutItems
    .map((item, index) => {
      if (item.activityBooking) {
        return {
          index,
          id: item.activityBooking.id,
          title: item.activityBooking.activity.title,
          date: item.activityBooking.searchParams.date,
          location:
            item.activityBooking.activity.coreInfo.location[0]?.name || "N/A",
          adults: item.activityBooking.searchParams.adults,
          children: item.activityBooking.searchParams.children,
          infants: 0, // Added missing infants property required by schema
          totalRequired:
            item.activityBooking.searchParams.adults +
            item.activityBooking.searchParams.children,
        };
      }
      return null;
    })
    .filter(
      (activity): activity is NonNullable<typeof activity> => activity !== null
    );

  // Initialize form with current member data
  const form = useForm<Step1Form>({
    resolver: zodResolver(createStep1SchemaWithActivities(allActivities)),
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
        selectedActivities: member.selectedActivities || [],
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
            selectedActivities: memberData.selectedActivities || [],
          });
        }
      });
    }, 100); // Small debounce to prevent excessive updates

    return () => clearTimeout(timeoutId);
  }, [watchedMembers, members, updateMember]);

  // Update terms in store directly without triggering form reset
  useEffect(() => {
    setTermsAccepted(watchedTerms || false);
  }, [watchedTerms, setTermsAccepted]);

  // Re-initialize form ONLY when members array structure changes (not content)
  useEffect(() => {
    if (members.length > 0) {
      const currentFormValues = form.getValues();
      const memberCountChanged =
        currentFormValues.members.length !== members.length;
      const formIsEmpty =
        currentFormValues.members.length === 0 ||
        !currentFormValues.members[0]?.fullName;

      if (memberCountChanged || formIsEmpty) {
        // Preserve existing form data when adding new members
        const preservedFormValues = {
          members: members.map((member, index) => {
            // If we have existing form data for this member, preserve it
            const existingFormData = currentFormValues.members?.[index];
            if (existingFormData && existingFormData.fullName) {
              return {
                ...existingFormData,
                // Only update selectedActivities from store if form doesn't have them
                selectedActivities:
                  existingFormData.selectedActivities?.length > 0
                    ? existingFormData.selectedActivities
                    : member.selectedActivities || [],
              };
            }

            // For new members or empty form data, use store data
            return {
              fullName: member.fullName || "",
              age: member.age || (member.isPrimary ? 25 : 12),
              gender:
                (member.gender as "Male" | "Female" | "Other") || undefined,
              nationality: member.nationality || "Indian",
              passportNumber: member.passportNumber || "",
              whatsappNumber: member.whatsappNumber || "",
              email: member.email || "",
              selectedActivities: member.selectedActivities || [],
            };
          }),
          termsAccepted: currentFormValues.termsAccepted ?? termsAccepted,
        };

        form.reset(preservedFormValues);

        // When adding a new member, expand it by default
        if (
          memberCountChanged &&
          members.length > currentFormValues.members.length
        ) {
          setExpandedMembers((prev) => new Set([...prev, members.length - 1]));
        } else {
          // Expand first member by default when form resets completely
          setExpandedMembers(new Set([0]));
        }
      }
    }
  }, [members.length, form, termsAccepted]);

  // Initialize form terms from store on mount
  useEffect(() => {
    if (termsAccepted !== undefined) {
      form.setValue("termsAccepted", termsAccepted);
    }
  }, [termsAccepted, form]);

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

  // Get activity assignment summary for a member
  const getActivitySummary = (memberIndex: number) => {
    const selectedActivities =
      watchedMembers[memberIndex]?.selectedActivities || [];
    if (selectedActivities.length === 0) {
      return "No activities selected";
    }
    if (selectedActivities.length === allActivities.length) {
      return "All activities";
    }
    return `${selectedActivities.length} of ${allActivities.length} activities`;
  };

  // Check if form can proceed - uses enhanced validation
  const canProceed = () => {
    try {
      // Use the enhanced validation schema
      const formData = {
        members: watchedMembers,
        termsAccepted: watchedTerms || false,
      };

      const validation = validateStep1WithActivities(formData, allActivities);

      return validation.success;
    } catch (error) {
      console.error("Validation check error:", error);
      return false;
    }
  };

  // Copy member details from previous member (excluding activity selection)
  const copyMemberDetailsFromAbove = (memberIndex: number) => {
    if (memberIndex > 0) {
      const previousMember = watchedMembers[memberIndex - 1];
      if (previousMember) {
        // Copy basic details only (excluding activity selection and contact info)
        const detailsToCopy = {
          nationality: previousMember.nationality,
          // Don't copy name, age, gender, passport as these are personal
          // Don't copy contact details as only primary member needs them
          // Don't copy selectedActivities as this is handled in sidebar
        };

        // Use specific field names to avoid TypeScript issues
        if (detailsToCopy.nationality) {
          setValue(
            `members.${memberIndex}.nationality` as const,
            detailsToCopy.nationality
          );
        }

        // Trigger validation for the updated fields
        trigger(`members.${memberIndex}.nationality`);
      }
    }
  };

  // Handle form submission with enhanced validation
  const onSubmit = async (data: Step1Form) => {
    try {
      // Use the enhanced validation with activities
      const validation = validateStep1WithActivities(data, allActivities);

      if (!validation.success) {
        const errors = getValidationErrors(validation);
        console.error("Form validation failed:", errors);

        // Show user-friendly error messages
        errors.forEach((error) => {
          if (error.path.includes("selectedActivities")) {
            // Handle activity assignment errors specifically
            console.warn("Activity assignment error:", error.message);
          }
        });
        return;
      }

      // Update store with validated data
      data.members.forEach((memberData, index) => {
        if (members[index]) {
          updateMember(members[index].id, {
            ...memberData,
            age: Number(memberData.age) || 0,
            selectedActivities: memberData.selectedActivities || [],
          });
        }
      });

      setTermsAccepted(data.termsAccepted);

      // Handle multi-activity flow
      const totalActivities = getTotalActivities();
      if (totalActivities > 1 && !isLastActivity()) {
        // If there are multiple activities and it's not the last one,
        // we need to complete the current activity and then proceed to the next.
        // For now, we'll just proceed to the next step.
        // In a real scenario, you'd call onActivityComplete here.
        nextStep();
      } else {
        // If it's the last activity or only one, proceed directly to the next step.
        nextStep();
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Add error handler for form submission errors
  const onError = (errors: any) => {
    console.error("Form submission failed with errors:", errors);
  };

  // Add helper function to get member validation errors
  const getMemberValidationErrors = (memberIndex: number) => {
    const memberErrors = errors.members?.[memberIndex];
    if (!memberErrors) return [];

    return Object.keys(memberErrors).filter((field) => {
      const fieldKey = field as keyof typeof memberErrors;
      const fieldError = memberErrors[fieldKey];
      return (
        fieldError &&
        typeof fieldError === "object" &&
        "message" in fieldError &&
        fieldError.message
      );
    });
  };

  // Add helper function to count errors for a member
  const getMemberErrorCount = (memberIndex: number) => {
    return getMemberValidationErrors(memberIndex).length;
  };

  // Add helper function to check if member has errors
  const memberHasErrors = (memberIndex: number) => {
    return getMemberErrorCount(memberIndex) > 0;
  };

  // Render activity assignment validation summary
  const renderActivityAssignmentSummary = () => {
    if (allActivities.length === 0) return null;

    return (
      <div className={styles.assignmentSummary}>
        <h3 className={styles.summaryTitle}>Activity Assignment Status</h3>
        <p className={styles.summaryDescription}>
          Ensure all activities have the required number of passengers assigned.
        </p>

        {allActivities.map((activity, activityIndex) => {
          // Use watchedMembers instead of store members for real-time sync
          const assignedCount = watchedMembers.filter((member) =>
            member.selectedActivities?.includes(activityIndex)
          ).length;
          const isValid = assignedCount >= activity.totalRequired;

          return (
            <div
              key={activityIndex}
              className={cn(
                styles.assignmentItem,
                isValid ? styles.assignmentValid : styles.assignmentInvalid
              )}
            >
              <div className={styles.activityInfo}>
                <h4 className={styles.activityTitle}>{activity.title}</h4>
                <p className={styles.activityMeta}>
                  {activity.date} • {activity.location}
                </p>
              </div>
              <div className={styles.assignmentStatus}>
                <span
                  className={cn(
                    styles.assignmentCount,
                    isValid ? styles.countValid : styles.countInvalid
                  )}
                >
                  {assignedCount}/{activity.totalRequired}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Activity Assignment Sidebar
  const renderActivityAssignmentSidebar = () => {
    if (allActivities.length === 0) return null;

    const handleActivityAssignment = (
      memberIndex: number,
      activityIndex: number,
      isChecked: boolean
    ) => {
      const currentSelections =
        watchedMembers[memberIndex]?.selectedActivities || [];
      let newSelections;

      if (isChecked) {
        newSelections = [...currentSelections, activityIndex];
      } else {
        newSelections = currentSelections.filter(
          (idx: number) => idx !== activityIndex
        );
      }

      setValue(`members.${memberIndex}.selectedActivities`, newSelections);
      trigger(`members.${memberIndex}.selectedActivities`);
    };

    return (
      <div className={styles.activitySidebar}>
        <h3 className={styles.sidebarTitle}>
          <Users size={20} />
          Activity Assignments
        </h3>
        <p className={styles.sidebarDescription}>
          Assign each member to their activities. Each activity must have the
          required number of participants.
        </p>

        <div className={styles.activityAssignmentPanel}>
          {allActivities.map((activity, activityIndex) => {
            // Use watchedMembers instead of store members for real-time sync
            const assignedCount = watchedMembers.filter((member) =>
              member.selectedActivities?.includes(activityIndex)
            ).length;
            const isComplete = assignedCount >= activity.totalRequired;

            return (
              <div key={activityIndex} className={styles.activityItem}>
                <div className={styles.activityHeader}>
                  <h4 className={styles.activityName}>{activity.title}</h4>
                  <span
                    className={cn(
                      styles.activityProgress,
                      isComplete
                        ? styles.progressComplete
                        : styles.progressIncomplete
                    )}
                  >
                    {assignedCount}/{activity.totalRequired}
                  </span>
                </div>

                <div className={styles.memberAssignments}>
                  {members.map((member, memberIndex) => {
                    const isSelected =
                      watchedMembers[memberIndex]?.selectedActivities?.includes(
                        activityIndex
                      ) || false;
                    const memberName =
                      watchedMembers[memberIndex]?.fullName ||
                      `Member ${memberIndex + 1}`;

                    return (
                      <div key={member.id} className={styles.memberAssignment}>
                        <input
                          type="checkbox"
                          className={styles.memberCheckbox}
                          checked={isSelected}
                          onChange={(e) =>
                            handleActivityAssignment(
                              memberIndex,
                              activityIndex,
                              e.target.checked
                            )
                          }
                        />
                        <label className={styles.memberLabel}>
                          {memberName} {memberIndex === 0 && "(Primary)"}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
          Please fill in the details for all travelers. Use the sidebar to
          assign activities to each member.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className={styles.form}>
        {/* 2-Column Layout */}
        <div className={styles.memberDetailsLayout}>
          {/* Left Column - Member Forms */}
          <div className={styles.memberFormsColumn}>
            {/* Activity Assignment Summary - Moved to top */}
            {renderActivityAssignmentSummary()}

            {/* Member Forms */}
            <div className={styles.membersSection}>
              {fields.map((field, index) => {
                const member = members[index];
                const isExpanded = expandedMembers.has(index);
                const isPrimary = index === 0;
                const memberAge =
                  watchedMembers[index]?.age || member?.age || 25;
                const memberLabel = getMemberLabel(index, memberAge);
                const activitySummary = getActivitySummary(index);

                // Only render if we have a corresponding member in the store
                if (!member) {
                  return null;
                }

                return (
                  <div
                    key={field.id}
                    className={cn(
                      styles.memberCard,
                      memberHasErrors(index) && styles.hasErrors
                    )}
                  >
                    <div
                      className={cn(
                        styles.memberCardHeader,
                        memberHasErrors(index) && styles.hasErrors
                      )}
                      onClick={() => toggleMemberExpansion(index)}
                    >
                      <div className={styles.memberInfo} style={{ flex: 1 }}>
                        <h3 className={styles.memberTitle}>
                          {memberLabel}
                          {isPrimary && (
                            <span className={styles.primaryBadge}>Primary</span>
                          )}
                          {/* Show error indicator when collapsed and has errors */}
                          {!isExpanded && memberHasErrors(index) && (
                            <div className={styles.errorIndicator}>
                              <div className={styles.errorBadge}>
                                {getMemberErrorCount(index)}
                              </div>
                              <span>Incomplete details</span>
                            </div>
                          )}
                        </h3>
                        <p className={styles.memberName}>
                          {watchedMembers[index]?.fullName ||
                            `Member ${index + 1}`}
                        </p>
                        <p className={styles.activitySummary}>
                          Activities: {activitySummary}
                        </p>
                      </div>
                      <div
                        className={styles.memberCardActions}
                        onClick={(e) => e.stopPropagation()} // Prevent header click when clicking actions
                      >
                        {!isPrimary && canRemoveMember(member.id) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="small"
                            onClick={() => removeMember(member.id)}
                            className={styles.removeMemberButton}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleMemberExpansion(index)}
                          className={styles.expandButton}
                          aria-label={
                            isExpanded
                              ? "Collapse member details"
                              : "Expand member details"
                          }
                        >
                          {isExpanded ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className={styles.memberCardContent}>
                        {/* Basic Details Section - Moved to top */}
                        <div className={styles.formSection}>
                          <div className={styles.sectionTitleRow}>
                            <h4 className={styles.sectionTitle}>
                              Basic Information
                              <span className={styles.requiredNote}>
                                * Required
                              </span>
                            </h4>
                            {index > 0 && (
                              <div className={styles.quickActions}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyMemberDetailsFromAbove(index)
                                  }
                                  className={styles.quickActionBtn}
                                >
                                  Copy from Above
                                </button>
                              </div>
                            )}
                          </div>
                          <div className={styles.formGrid}>
                            {/* Full Name */}
                            <div className={styles.formField}>
                              <Input
                                name={`members.${index}.fullName`}
                                control={control}
                                label="Full Name"
                                placeholder="Enter full name"
                                required
                                hasError={!!errors.members?.[index]?.fullName}
                              />
                              <p className={styles.fieldNote}>
                                <Info size={12} />
                                Name must match passport/ID
                              </p>
                            </div>

                            {/* Age */}
                            <div className={styles.formField}>
                              <Input
                                name={`members.${index}.age`}
                                control={control}
                                label="Age"
                                type="number"
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
                            <div className={styles.formField}>
                              <Input
                                name={`members.${index}.passportNumber`}
                                control={control}
                                label="Passport Number"
                                placeholder="Enter passport number"
                                required
                                hasError={
                                  !!errors.members?.[index]?.passportNumber
                                }
                              />
                              <p className={styles.fieldNote}>
                                <Info size={12} />
                                Enter passport number (6-12 characters, letters
                                and numbers only)
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Contact Details Section - Only for Primary Member */}
                        {isPrimary && (
                          <div className={styles.formSection}>
                            <h4 className={styles.sectionTitle}>
                              Contact Details
                              <span className={styles.requiredNote}>
                                * Required for primary member
                              </span>
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

            {/* Member Management Section */}
            <div className={styles.memberManagement}>
              <div className={styles.memberStats}>
                <div className={styles.statsInfo}>
                  <span className={styles.statsLabel}>
                    Total Members: {members.length}
                  </span>
                  <span className={styles.statsLabel}>
                    Required: {getMinimumMembersNeeded()}
                  </span>
                </div>
                <div className={styles.memberActions}>
                  <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={addExtraMember}
                    className={styles.addMemberButton}
                  >
                    <Plus size={16} />
                    Add Member
                  </Button>
                </div>
              </div>
              <div className={styles.managementNote}>
                <Info size={16} />
                You can add extra members beyond the minimum required for your
                activities.
              </div>
            </div>
          </div>

          {/* Right Column - Activity Assignment Sidebar */}
          {renderActivityAssignmentSidebar()}
        </div>

        {/* Terms & Conditions - Outside 2-column layout */}
        <div className={styles.termsSection}>
          <div className={styles.termsCard}>
            <h3 className={styles.termsTitle}>Terms & Conditions</h3>
            <ul className={styles.termsList}>
              <li>
                All passenger details must match government-issued photo ID
              </li>
              <li>
                Children under 18 must be accompanied by an adult for all
                activities
              </li>
              <li>
                Activity participation is subject to health and safety
                guidelines
              </li>
              <li>Cancellation charges apply as per our cancellation policy</li>
              <li>Weather conditions may affect activity schedules</li>
              <li>
                We reserve the right to refuse participation based on safety
                concerns
              </li>
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
                      I accept the{" "}
                      <a href="/terms" className={styles.termsLink}>
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className={styles.termsLink}>
                        Privacy Policy
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

        {/* Submit Button */}
        <div className={styles.buttonSection}>
          <Button
            type="submit"
            disabled={!canProceed()}
            className={styles.continueButton}
          >
            Continue to Review
          </Button>
        </div>
      </form>
    </div>
  );
};
