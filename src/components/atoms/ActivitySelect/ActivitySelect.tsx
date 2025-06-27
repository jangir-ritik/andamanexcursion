"use client";

import React from "react";
import * as Select from "@radix-ui/react-select";
import styles from "./ActivitySelect.module.css";
import { ActivitySelectProps } from "@/types/components/atoms/activitySelect";

export const ActivitySelect = ({
  value,
  onChange,
  options,
  className,
  label = "Select Activity",
}: ActivitySelectProps) => (
  <Select.Root value={value} onValueChange={onChange}>
    <Select.Trigger className={`${styles.selectWrapper} ${className || ""}`}>
      <span className={styles.selectLabel}>{label}</span>
      <Select.Value className={styles.selectValue}>
        {options.find((activity) => activity.id === value)?.name}
      </Select.Value>
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
