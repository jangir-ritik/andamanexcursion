"use client";

import React from "react";
import * as Select from "@radix-ui/react-select";
import styles from "./LocationSelect.module.css";
import type { LocationSelectProps } from "./LocationSelect.types";

export const LocationSelect = ({
  value,
  onChange,
  label,
  options,
  className,
}: LocationSelectProps) => {
  // Find the selected location name
  const selectedLocation = options.find((loc) => loc.id === value)?.name || "";

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className={`${styles.selectWrapper} ${className || ""}`}>
        <span className={styles.selectLabel}>{label}</span>
        <Select.Value
          placeholder={selectedLocation}
          className={styles.selectValue}
        />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.selectContent} position="popper">
          <Select.Viewport>
            {options.map((location) => (
              <Select.Item
                key={location.id}
                value={location.id}
                className={styles.selectItem}
              >
                <Select.ItemText>{location.name}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
