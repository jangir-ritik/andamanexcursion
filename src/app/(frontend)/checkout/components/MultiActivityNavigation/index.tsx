"use client";
import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCheckoutStore } from "@/store/CheckoutStore";
import { Button } from "@/components/atoms/Button/Button";
import styles from "./MultiActivityNavigation.module.css";

interface MultiActivityNavigationProps {
  currentIndex: number;
  totalActivities: number;
  onNext: () => void;
  onPrevious: () => void;
  isLastActivity: boolean;
}

export const MultiActivityNavigation: React.FC<
  MultiActivityNavigationProps
> = ({ currentIndex, totalActivities, onNext, onPrevious, isLastActivity }) => {
  const { getCurrentActivity } = useCheckoutStore();
  const currentActivity = getCurrentActivity();

  const activityTitle =
    currentActivity?.activityBooking?.activity.title || "Activity";

  return (
    <div className={styles.multiActivityNav}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Activity {currentIndex + 1} of {totalActivities}
        </h2>
        <p className={styles.activityName}>{activityTitle}</p>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{
              width: `${((currentIndex + 1) / totalActivities) * 100}%`,
            }}
          />
        </div>
        <span className={styles.progressText}>
          {currentIndex + 1}/{totalActivities} activities
        </span>
      </div>

      <div className={styles.navigation}>
        <Button
          variant="secondary"
          size="medium"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          icon={<ArrowLeft size={16} />}
          className={styles.navButton}
        >
          Previous Activity
        </Button>

        <Button
          variant="primary"
          size="medium"
          onClick={onNext}
          icon={<ArrowRight size={16} />}
          className={styles.navButton}
        >
          {isLastActivity ? "Continue to Review" : "Next Activity"}
        </Button>
      </div>
    </div>
  );
};
