"use client";

import React from "react";
import * as Select from "@radix-ui/react-select";
import styles from "./ActivitySelect.module.css";
import type { ActivitySelectProps } from "./ActivitySelect.types";

export const ActivitySelect = ({
  value,
  onChange,
  options,
  className,
  label = "Select Activity",
}: ActivitySelectProps) => {
  // Find the selected activity name
  const selectedActivity =
    options.find((activity) => activity.id === value)?.name || "";

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className={`${styles.selectWrapper} ${className || ""}`}>
        <span className={styles.selectLabel}>{label}</span>
        <Select.Value
          placeholder={selectedActivity}
          className={styles.selectValue}
        />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.selectContent} position="popper">
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
