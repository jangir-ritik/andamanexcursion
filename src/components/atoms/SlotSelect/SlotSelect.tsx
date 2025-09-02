"use client";
import React, { useCallback, memo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./SlotSelect.module.css";
import type { SlotSelectProps } from "./SlotSelect.types";

// Add error message prop to the interface
interface SlotSelectPropsWithError extends SlotSelectProps {
  errorMessage?: string;
}

const SlotSelect = memo(
  ({
    value,
    onChange,
    options,
    className,
    hasError,
    placeholder,
    disabled = false,
    isLoading = false,
    errorMessage,
  }: SlotSelectPropsWithError) => {
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

    const displayText = isLoading
      ? "Loading time slots..."
      : currentSlot
      ? currentSlot.label || currentSlot.time
      : placeholder || "Select a time slot";

    const isDisabled = disabled || isLoading;

    return (
      <div className={styles.fieldContainer}>
        <div
          className={`${styles.selectWrapper} ${className || ""} ${
            hasError ? styles.error : ""
          } ${isDisabled ? styles.disabled : ""}`}
        >
          <span className={styles.selectLabel}>
            Slot
            <span className={styles.required}>*</span>
          </span>
          <div className={styles.slotPickerInner}>
            <button
              type="button"
              aria-label="Previous Slot"
              className={styles.slotNavButton}
              onClick={handlePrevious}
              disabled={isDisabled || currentIndex <= 0}
            >
              <ChevronLeft color="var(--color-primary)" size={20} />
            </button>
            <span className={styles.selectValue}>{displayText}</span>
            <button
              type="button"
              aria-label="Next Slot"
              className={styles.slotNavButton}
              onClick={handleNext}
              disabled={isDisabled || currentIndex >= options.length - 1}
            >
              <ChevronRight color="var(--color-primary)" size={20} />
            </button>
          </div>

          {/* Inline error message */}
          {hasError && errorMessage && (
            <p className={styles.errorMessage} role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    );
  }
);

SlotSelect.displayName = "SlotSelect";
export { SlotSelect };
