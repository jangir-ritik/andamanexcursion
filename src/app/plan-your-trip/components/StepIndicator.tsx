import React from "react";
import * as Separator from "@radix-ui/react-separator";
import { Check } from "lucide-react";
import styles from "./StepIndicator.module.css";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
  isStepAccessible: (step: number) => boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  isStepCompleted,
  isStepAccessible,
}) => {
  return (
    <div className={styles.stepIndicator}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={`${styles.step} ${
              currentStep === step.id ? styles.active : ""
            } ${isStepCompleted(step.id) ? styles.completed : ""} ${
              isStepAccessible(step.id) ? styles.accessible : ""
            }`}
            onClick={() => isStepAccessible(step.id) && onStepClick(step.id)}
          >
            <div className={styles.stepNumber}>
              {isStepCompleted(step.id) ? (
                <Check size={16} />
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            <div className={styles.stepContent}>
              <div className={styles.stepTitle}>{step.title}</div>
              <div className={styles.stepDescription}>{step.description}</div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <Separator.Root
              className={`${styles.separator} ${
                isStepCompleted(step.id) ? styles.completedSeparator : ""
              }`}
              orientation="horizontal"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
