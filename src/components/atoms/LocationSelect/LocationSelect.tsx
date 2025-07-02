"use client";

import React from "react";
import * as Select from "@radix-ui/react-select";
import styles from "./LocationSelect.module.css";
import { LocationSelectProps } from "./LocationSelect.types";

export const LocationSelect = ({
  value,
  onChange,
  label,
  options,
  className,
}: LocationSelectProps) => (
  <Select.Root value={value} onValueChange={onChange}>
    <Select.Trigger className={`${styles.selectWrapper} ${className || ""}`}>
      <span className={styles.selectLabel}>{label}</span>
      <Select.Value className={styles.selectValue}>
        {options.find((loc) => loc.id === value)?.name}
      </Select.Value>
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
