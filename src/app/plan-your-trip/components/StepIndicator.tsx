import React from "react";
import { Check } from "lucide-react";
import styles from "./StepIndicator.module.css";
import { cn } from "@/utils/cn";

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
      {/* Top row: circles and separators */}
      <div className={styles.circleRow}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Circle */}
            <div
              className={cn(styles.stepCircle, {
                [styles.active]: currentStep === step.id,
                [styles.completed]: isStepCompleted(step.id),
                [styles.accessible]: isStepAccessible(step.id),
              })}
              onClick={() => {
                if (isStepAccessible(step.id)) {
                  onStepClick(step.id);
                }
              }}
            >
              {isStepCompleted(step.id) ? (
                <Check size={16} />
              ) : (
                <span>{step.id}</span>
              )}
            </div>

            {/* Separator - only if not the last step */}
            {
              // index < steps.length - 1 &&
              <div
                className={cn(styles.separator, {
                  [styles.completedSeparator]: isStepCompleted(
                    steps[index + 1]?.id
                  ),
                  [styles.lastSeparator]: index === steps.length - 1,
                })}
              />
            }
          </React.Fragment>
        ))}
      </div>

      {/* Bottom row: content */}
      <div className={styles.contentRow}>
        {steps.map((step) => (
          <div
            key={`content-${step.id}`}
            className={cn(styles.stepContent, {
              [styles.activeContent]: currentStep === step.id,
              [styles.completedContent]: isStepCompleted(step.id),
              [styles.accessibleContent]: isStepAccessible(step.id),
            })}
            onClick={() => {
              if (isStepAccessible(step.id)) {
                onStepClick(step.id);
              }
            }}
          >
            <div className={styles.stepTitle}>Step {step.id}</div>
            <div className={styles.stepDescription}>{step.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
