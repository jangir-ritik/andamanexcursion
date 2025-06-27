"use client";

import React from "react";
import styles from "./PassengerCounter.module.css";

export type PassengerCount = {
  adults: number;
  infants: number;
};

export type PassengerCounterProps = {
  value: PassengerCount;
  onChange: (type: keyof PassengerCount, value: number) => void;
  className?: string;
};

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
            onClick={() => onChange("adults", value.adults - 1)}
            disabled={value.adults <= 1}
          >
            -
          </button>
          <span>{value.adults}</span>
          <button onClick={() => onChange("adults", value.adults + 1)}>
            +
          </button>
        </div>
      </div>

      <div className={styles.counterGroup}>
        <label>Infants/Kids</label>
        <div className={styles.counter}>
          <button
            onClick={() => onChange("infants", value.infants - 1)}
            disabled={value.infants <= 0}
          >
            -
          </button>
          <span>{value.infants}</span>
          <button onClick={() => onChange("infants", value.infants + 1)}>
            +
          </button>
        </div>
      </div>
    </div>
  );
};
