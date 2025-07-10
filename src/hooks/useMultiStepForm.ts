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

  const validateCurrentStep = useCallback(async () => {
    const schema = stepsSchemas[currentStep - 1];
    if (!schema) return;

    try {
      await form.trigger();
      const formData = form.getValues();
      await schema.parseAsync(formData);
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      return true;
    } catch (error) {
      return false;
    }
  }, [currentStep, form, stepsSchemas]);

  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
    return isValid;
  }, [currentStep, totalSteps, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    async (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        // Only allow going to completed steps or the next step
        if (completedSteps.has(step) || step === currentStep + 1) {
          if (step > currentStep) {
            const isValid = await validateCurrentStep();
            if (isValid) {
              setCurrentStep(step);
            }
          } else {
            setCurrentStep(step);
          }
        }
      }
    },
    [currentStep, totalSteps, completedSteps, validateCurrentStep]
  );

  const isStepCompleted = useCallback(
    (step: number) => {
      return completedSteps.has(step);
    },
    [completedSteps]
  );

  const isStepAccessible = useCallback(
    (step: number) => {
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
  };
};
