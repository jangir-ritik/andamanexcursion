"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./SlotSelect.module.css";
import type { SlotSelectProps } from "./SlotSelect.types";

export const SlotSelect = ({
  value,
  onChange,
  options,
  className,
  hasError,
}: SlotSelectProps) => {
  // Find the current slot index
  const currentIndex = options.findIndex((slot) => slot.id === value);

  // Handle navigation between slots
  const handlePrevious = () => {
    if (currentIndex > 0) {
      onChange(options[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < options.length - 1) {
      onChange(options[currentIndex + 1].id);
    }
  };

  const currentSlot = options.find((slot) => slot.id === value);

  return (
    <div
      className={`${styles.selectWrapper} ${className || ""} ${
        hasError ? styles.error : ""
      }`}
    >
      <span className={styles.selectLabel}>Slot</span>
      <div className={styles.slotPickerInner}>
        <button
          type="button"
          aria-label="Previous Slot"
          className={styles.slotNavButton}
          onClick={handlePrevious}
          disabled={currentIndex <= 0}
        >
          <ChevronLeft size={20} />
        </button>
        <span className={styles.selectValue}>{currentSlot?.time}</span>
        <button
          type="button"
          aria-label="Next Slot"
          className={styles.slotNavButton}
          onClick={handleNext}
          disabled={currentIndex >= options.length - 1}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
