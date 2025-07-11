"use client";

import { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";

interface UseMultiStepFormProps {
  totalSteps: number;
  form: UseFormReturn<any>;
  stepsSchemas: any[];
}

export const useMultiStepForm = ({
  totalSteps,
  form,
  stepsSchemas,
}: UseMultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isValidating, setIsValidating] = useState(false);

  const validateCurrentStep = useCallback(async () => {
    if (isValidating) return false;

    const schema = stepsSchemas[currentStep - 1];
    if (!schema) return true;

    try {
      setIsValidating(true);
      // Use a more targeted validation approach
      const formData = form.getValues();

      // For step 1, only validate the specific fields needed
      if (currentStep === 1) {
        const { personalDetails, tripDetails, travelGoals } = formData;
        await schema.parseAsync({
          personalDetails,
          tripDetails,
          travelGoals,
          specialOccasion: formData.specialOccasion || [],
        });
      } else {
        await form.trigger();
        await schema.parseAsync(formData);
      }

      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [currentStep, form, stepsSchemas, isValidating]);

  const nextStep = useCallback(async () => {
    if (isValidating) return false;

    const isValid = await validateCurrentStep();
    if (isValid && currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
    return isValid;
  }, [currentStep, totalSteps, validateCurrentStep, isValidating]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    async (step: number) => {
      if (isValidating) return;

      if (step >= 1 && step <= totalSteps) {
        // Always allow going to previous steps without validation
        if (step < currentStep) {
          setCurrentStep(step);
        }
        // For next steps, require validation
        else if (step > currentStep) {
          const isValid = await validateCurrentStep();
          if (isValid) {
            setCurrentStep(step);
          }
        }
      }
    },
    [currentStep, totalSteps, validateCurrentStep, isValidating]
  );

  const isStepCompleted = useCallback(
    (step: number) => {
      return completedSteps.has(step);
    },
    [completedSteps]
  );

  const isStepAccessible = useCallback(
    (step: number) => {
      // Allow access to current step, completed steps, and previous steps
      return step <= currentStep || completedSteps.has(step);
    },
    [currentStep, completedSteps]
  );

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    isStepCompleted,
    isStepAccessible,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    isValidating,
  };
};
