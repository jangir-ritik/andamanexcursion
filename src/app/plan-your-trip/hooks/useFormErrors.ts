import { useState, useEffect } from "react";
import { UseFormReturn, FieldError } from "react-hook-form";
import { TripFormData } from "../TripFormSchema";

export const useFormErrors = (form: UseFormReturn<TripFormData>) => {
  const { formState, trigger } = form;
  const { errors, isSubmitting } = formState;

  const [errorSummary, setErrorSummary] = useState<string[]>([]);
  const [hasTriggeredValidation, setHasTriggeredValidation] = useState(false);

  // Track which accordion items have errors (for Step 2)
  const [accordionErrorIndices, setAccordionErrorIndices] = useState<number[]>(
    []
  );

  // Update error summary whenever errors change
  useEffect(() => {
    if (!hasTriggeredValidation) return;

    const summary: string[] = [];
    const errorIndices: number[] = [];

    // Process all errors and create human-readable messages
    if (errors.personalDetails?.name) {
      summary.push("Please enter your name");
    }

    if (errors.personalDetails?.email) {
      summary.push("Please enter a valid email address");
    }

    if (errors.personalDetails?.phone) {
      summary.push("Please enter a valid phone number");
    }

    if (errors.tripDetails?.arrivalDate) {
      summary.push("Please select an arrival date");
    }

    if (errors.tripDetails?.departureDate) {
      summary.push("Please select a valid departure date");
    }

    if (errors.travelGoals && errors.travelGoals.message) {
      summary.push("Please select at least one travel goal");
    }

    // Check for itinerary errors
    if (errors.itinerary) {
      // Type assertion for itinerary errors
      const itineraryArray = Array.isArray(errors.itinerary)
        ? errors.itinerary
        : [];

      itineraryArray.forEach((dayError: any, index: number) => {
        if (dayError) {
          errorIndices.push(index);

          if (dayError.destination) {
            summary.push(`Day ${index + 1}: Please select a destination`);
          }

          if (dayError.activity) {
            summary.push(`Day ${index + 1}: Please select an activity`);
          }
        }
      });
    }

    // Hotel preferences errors
    if (errors.hotelPreferences?.hotelType) {
      summary.push("Please select a hotel type");
    }

    if (errors.hotelPreferences?.roomPreference) {
      summary.push("Please select a room preference");
    }

    // Ferry preferences errors
    if (errors.ferryPreferences?.ferryClass) {
      summary.push("Please select a ferry class");
    }

    if (errors.ferryPreferences?.travelTimeSlot) {
      summary.push("Please select a travel time slot");
    }

    // Add-ons errors
    if (errors.addOns?.mealPreference) {
      summary.push("Please select a meal preference");
    }

    if (errors.addOns?.transportation) {
      summary.push("Please select a transportation option");
    }

    setErrorSummary(summary);
    setAccordionErrorIndices(errorIndices);
  }, [errors, hasTriggeredValidation]);

  // Validate all fields in the current step
  const validateStep = async () => {
    setHasTriggeredValidation(true);
    return await trigger();
  };

  return {
    errorSummary,
    accordionErrorIndices,
    validateStep,
    hasErrors: Object.keys(errors).length > 0,
    isSubmitting,
  };
};
