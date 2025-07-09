"use client";
import React from "react";
import * as Select from "@radix-ui/react-select";
import styles from "./LocationSelect.module.css";
import type { LocationSelectProps } from "./LocationSelect.types";
import { ChevronDown } from "lucide-react";

export const LocationSelect = ({
  value,
  onChange,
  label,
  options,
  className,
  hasError,
}: LocationSelectProps) => {
  // Find the selected location name
  const selectedLocation = options.find((loc) => loc.id === value)?.name || "";

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className={`${styles.selectWrapper} ${className || ""} ${
          hasError ? styles.error : ""
        }`}
      >
        <span className={styles.selectLabel}>{label}</span>
        <Select.Value
          placeholder={selectedLocation}
          className={styles.selectValue}
        />
        {/* FIX 1: Move ChevronDown outside of Select.Value for proper positioning */}
        <ChevronDown size={20} className={styles.selectIcon} />
      </Select.Trigger>

      {/* FIX 2: Use proper portal positioning */}
      <Select.Portal>
        <Select.Content
          className={styles.selectContent}
          position="popper"
          sideOffset={8}
          avoidCollisions={true}
          collisionPadding={16}
        >
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
