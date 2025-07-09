"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./DateSelect.module.css";
import type { DateSelectProps } from "./DateSelect.types";

export const DateSelect = ({
  selected,
  onChange,
  className,
  hasError,
}: DateSelectProps) => {
  // Prevent form submission when selecting a date
  const handleDateChange = (date: Date | null) => {
    if (date) {
      onChange(date);
    }
  };

  return (
    <div
      aria-label="Date Select"
      className={`${styles.datePickerWrapper} ${className || ""} ${
        hasError ? styles.error : ""
      }`}
    >
      <span aria-label="Date Select" className={styles.selectLabel}>
        Date
      </span>
      <div aria-label="Date Picker" className={styles.datePickerInner}>
        <button
          type="button"
          aria-label="Previous Day"
          className={styles.dateNavButton}
          onClick={() => {
            const newDate = new Date(selected);
            newDate.setDate(selected.getDate() - 1);
            onChange(newDate);
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <DatePicker
          selected={selected}
          onChange={handleDateChange}
          dateFormat="EEE, dd MMM yyyy"
          minDate={new Date()}
          className={styles.datePicker}
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
          onClick={() => {
            const newDate = new Date(selected);
            newDate.setDate(selected.getDate() + 1);
            onChange(newDate);
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
