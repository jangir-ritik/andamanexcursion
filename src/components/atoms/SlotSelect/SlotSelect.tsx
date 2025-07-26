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
  placeholder,
}: SlotSelectProps) => {
  // Find the current slot index by value, slug, or id
  const currentIndex = options.findIndex(
    (slot) => slot.value === value || slot.slug === value || slot.id === value
  );

  // Handle navigation between slots
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevSlot = options[currentIndex - 1];
      onChange(prevSlot.value || prevSlot.slug || prevSlot.id);
    }
  };

  const handleNext = () => {
    if (currentIndex < options.length - 1) {
      const nextSlot = options[currentIndex + 1];
      onChange(nextSlot.value || nextSlot.slug || nextSlot.id);
    }
  };

  const currentSlot = options.find(
    (slot) => slot.value === value || slot.slug === value || slot.id === value
  );

  const displayText = currentSlot
    ? currentSlot.label || currentSlot.time
    : placeholder;

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
        <span className={styles.selectValue}>{displayText}</span>
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
