"use client";
import React from "react";
import * as Select from "@radix-ui/react-select";
import styles from "./LocationSelect.module.css";
import type { LocationSelectProps } from "./LocationSelect.types";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

export const LocationSelect = ({
  value,
  onChange,
  label,
  options,
  className,
  hasError,
  placeholder,
}: LocationSelectProps) => {
  // Find the selected location name
  const selectedLocation = options.find((loc) => loc.id === value)?.name || "";
  const displayText = selectedLocation || placeholder || "Select location";

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className={cn(
          styles.selectWrapper,
          className,
          hasError && styles.error
        )}
      >
        <span className={styles.selectLabel}>{label}</span>
        <Select.Value
          placeholder={displayText}
          className={styles.selectValue}
        />
        <ChevronDown
          size={20}
          className={cn(styles.selectIcon, styles.textPrimary)}
        />
      </Select.Trigger>

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
