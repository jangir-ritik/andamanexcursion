"use client";

import React from "react";
import * as Select from "@radix-ui/react-select";
import styles from "./SlotSelect.module.css";

export type TimeSlot = {
  id: string;
  time: string;
};

export type SlotSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: TimeSlot[];
  className?: string;
};

export const SlotSelect = ({
  value,
  onChange,
  options,
  className,
}: SlotSelectProps) => (
  <div className={`${styles.slotPickerWrapper} ${className || ""}`}>
    <span className={styles.selectLabel}>Slot</span>
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className={styles.slotTrigger}>
        <Select.Value className={styles.slotValue}>
          {options.find((slot) => slot.id === value)?.time}
        </Select.Value>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.selectContent} position="popper">
          <Select.Viewport>
            {options.map((slot) => (
              <Select.Item
                key={slot.id}
                value={slot.id}
                className={styles.selectItem}
              >
                <Select.ItemText>{slot.time}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  </div>
);
