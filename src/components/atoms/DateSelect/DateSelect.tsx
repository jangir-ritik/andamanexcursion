"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./DateSelect.module.css";
import type { DateSelectProps  } from "./DateSelect.types";

export const DateSelect = ({
  selected,
  onChange,
  className,
}: DateSelectProps) => {
  return (
    <div
      aria-label="Date Select"
      className={`${styles.datePickerWrapper} ${className || ""}`}
    >
      <span aria-label="Departure" className={styles.selectLabel}>
        Departure
      </span>
      <div aria-label="Date Picker" className={styles.datePickerInner}>
        <button
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
          onChange={onChange}
          dateFormat="EEE, dd MMM yyyy"
          minDate={new Date()}
          className={styles.datePicker}
        />
        <button
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
