"use client";

import React from "react";
import * as Select from "@radix-ui/react-select";
import styles from "./ActivitySelect.module.css";
import type { ActivitySelectProps } from "./ActivitySelect.types";
import { cn } from "@/utils/cn";
import { ChevronDown } from "lucide-react";

export const ActivitySelect = ({
  value,
  onChange,
  options,
  className,
  hasError,
  placeholder,
}: ActivitySelectProps) => {
  // Find the selected activity name
  const selectedActivity =
    options.find((activity) => activity.id === value)?.name || "";
  const displayText = selectedActivity || placeholder || "Select activity";

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        className={cn(
          styles.selectWrapper,
          className,
          hasError && styles.error
        )}
      >
        <span className={styles.selectLabel}>Activity</span>
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
            {options.map((activity) => (
              <Select.Item
                key={activity.id}
                value={activity.id}
                className={styles.selectItem}
              >
                <Select.ItemText>{activity.name}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
