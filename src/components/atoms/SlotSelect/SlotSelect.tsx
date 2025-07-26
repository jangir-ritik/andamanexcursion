"use client";

import React, { useCallback, memo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./SlotSelect.module.css";
import type { SlotSelectProps } from "./SlotSelect.types";

const SlotSelect = memo(
  ({
    value,
    onChange,
    options,
    className,
    hasError,
    placeholder,
  }: SlotSelectProps) => {
    // Select first slot if value is empty and options exist
    useEffect(() => {
      if (!value && options.length > 0) {
        const firstSlot = options[0];
        onChange(firstSlot.value || firstSlot.slug || firstSlot.id);
      }
    }, [value, options, onChange]);

    // Find the current slot index by value, slug, or id
    const currentIndex = options.findIndex(
      (slot) => slot.value === value || slot.slug === value || slot.id === value
    );

    // Handle navigation between slots - memoized
    const handlePrevious = useCallback(() => {
      if (currentIndex > 0) {
        const prevSlot = options[currentIndex - 1];
        onChange(prevSlot.value || prevSlot.slug || prevSlot.id);
      }
    }, [currentIndex, options, onChange]);

    const handleNext = useCallback(() => {
      if (currentIndex < options.length - 1) {
        const nextSlot = options[currentIndex + 1];
        onChange(nextSlot.value || nextSlot.slug || nextSlot.id);
      }
    }, [currentIndex, options, onChange]);

    const currentSlot = options.find(
      (slot) => slot.value === value || slot.slug === value || slot.id === value
    );

    const displayText = currentSlot
      ? currentSlot.label || currentSlot.time
      : placeholder || "Select a time slot";

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
  }
);

SlotSelect.displayName = "SlotSelect";

export { SlotSelect };
