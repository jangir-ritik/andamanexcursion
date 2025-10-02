"use client";
import React, { useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./DateSelect.module.css";
import type { DateSelectProps } from "./DateSelect.types";
import { cn } from "@/utils/cn";

// Add error message prop to the interface
interface DateSelectPropsWithError extends DateSelectProps {
  errorMessage?: string;
  required?: boolean;
}

export const DateSelect = ({
  selected,
  onChange,
  className,
  hasError,
  label = "Date",
  errorMessage,
  required = true,
}: DateSelectPropsWithError) => {
  // Create unique IDs for accessibility
  const labelId = React.useId();
  const inputId = React.useId();
  const errorId = React.useId();
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure selected is a valid Date object
  const selectedDate =
    selected instanceof Date ? selected : new Date(selected || new Date());

  // Prevent form submission when selecting a date
  const handleDateChange = (date: Date | null) => {
    if (date) {
      onChange(date);
    }
  };

  // Handle navigation to previous day
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onChange(newDate);
  };

  // Handle navigation to next day
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onChange(newDate);
  };

  return (
    <div className={styles.fieldContainer}>
      <div
        className={cn(
          styles.selectWrapper,
          className,
          hasError && styles.error
        )}
      >
        <label htmlFor={inputId} className={styles.selectLabel} id={labelId}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
        <div className={styles.datePickerInner} ref={containerRef}>
          <button
            type="button"
            aria-label="Previous Day"
            className={styles.dateNavButton}
            onClick={handlePreviousDay}
          >
            <ChevronLeft color="var(--color-primary)" size={20} />
          </button>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="EEE, dd MMM yyyy"
            minDate={new Date()}
            className={styles.datePicker}
            id={inputId}
            aria-labelledby={labelId}
            aria-describedby={hasError && errorMessage ? errorId : undefined}
            aria-invalid={hasError ? "true" : "false"}
            popperClassName="react-datepicker-popper"
            popperPlacement="bottom-start"
            popperProps={{
              strategy: "fixed",
            }}
            onKeyDown={(e) => {
              // Prevent Enter key from submitting the form
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          />
          <button
            type="button"
            aria-label="Next Day"
            className={styles.dateNavButton}
            onClick={handleNextDay}
          >
            <ChevronRight color="var(--color-primary)" size={20} />
          </button>
        </div>
        {/* Inline error message inside the border */}
        {hasError && errorMessage && (
          <p className={styles.errorMessage} role="alert" id={errorId}>
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};
