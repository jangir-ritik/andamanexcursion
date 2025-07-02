"use client";

import React from "react";
import styles from "./PassengerCounter.module.css";
import {
  PassengerCounterProps,
  PassengerCount,
} from "./PassengerCounter.types";

export type { PassengerCount };

export const PassengerCounter = ({
  value,
  onChange,
  className,
}: PassengerCounterProps) => {
  return (
    <div className={`${styles.passengerCounter} ${className || ""}`}>
      <div className={styles.counterGroup}>
        <label>Adults (2+ yrs)</label>
        <div className={styles.counter}>
          <button
            aria-label="Decrease Adults"
            onClick={() => onChange("adults", value.adults - 1)}
            disabled={value.adults <= 1}
          >
            -
          </button>
          <span>{value.adults}</span>
          <button
            aria-label="Increase Adults"
            onClick={() => onChange("adults", value.adults + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.counterGroup}>
        <label>Infants/Kids</label>
        <div className={styles.counter}>
          <button
            aria-label="Decrease Infants"
            onClick={() => onChange("infants", value.infants - 1)}
            disabled={value.infants <= 0}
          >
            -
          </button>
          <span>{value.infants}</span>
          <button
            aria-label="Increase Infants"
            onClick={() => onChange("infants", value.infants + 1)}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
