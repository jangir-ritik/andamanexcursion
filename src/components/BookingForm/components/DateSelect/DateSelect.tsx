"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./DateSelect.module.css";

export type DateSelectProps = {
  selected: Date;
  onChange: (date: Date | null) => void;
  className?: string;
};

export const DateSelect = ({
  selected,
  onChange,
  className,
}: DateSelectProps) => {
  return (
    <div className={`${styles.datePickerWrapper} ${className || ""}`}>
      <span className={styles.selectLabel}>Departure</span>
      <div className={styles.datePickerInner}>
        <button
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
