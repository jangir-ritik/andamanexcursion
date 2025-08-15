"use client";

import React from "react";
import styles from "./PassengerCounter.module.css";
import type {
  PassengerCounterProps,
  PassengerCount,
} from "./PassengerCounter.types";

export type { PassengerCount };

export const PassengerCounter = ({
  value,
  onChange,
  className,
  hasError,
}: PassengerCounterProps) => {
  return (
    <div
      className={`${styles.passengerCounter} ${className || ""} ${
        hasError ? styles.error : ""
      }`}
    >
      <div className={styles.counterWrapper}>
        <label>Adults (2+ yrs)</label>
        <div className={styles.counter}>
          <button
            type="button"
            aria-label="Decrease Adults"
            onClick={() => onChange("adults", value.adults - 1)}
            disabled={value.adults <= 1}
          >
            -
          </button>
          <span>{value.adults}</span>
          <button
            type="button"
            aria-label="Increase Adults"
            onClick={() => onChange("adults", value.adults + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.counterWrapper}>
        <label>Kids</label>
        <div className={styles.counter}>
          <button
            type="button"
            aria-label="Decrease Kids"
            onClick={() => onChange("children", (value.children || 0) - 1)}
            disabled={(value.children || 0) <= 0}
          >
            -
          </button>
          <span>{value.children || 0}</span>
          <button
            type="button"
            aria-label="Increase Kids"
            onClick={() => onChange("children", (value.children || 0) + 1)}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
