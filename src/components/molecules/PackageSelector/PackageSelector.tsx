"use client";

import React, { useState } from "react";
import styles from "./PackageSelector.module.css";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import * as Select from "@radix-ui/react-select";
import {
  PackageOption,
  PeriodOption,
  PackageSelectorProps,
} from "@/types/components/molecules";

export const PackageSelector = ({
  packageOptions,
  periodOptions,
  onPackageChange,
  onPeriodChange,
  className = "",
  defaultPackage = "",
  defaultPeriod = "",
}: PackageSelectorProps) => {
  const [selectedPackage, setSelectedPackage] = useState(
    defaultPackage || (packageOptions.length > 0 ? packageOptions[0].id : "")
  );
  const [selectedPeriod, setSelectedPeriod] = useState(
    defaultPeriod || (periodOptions.length > 0 ? periodOptions[0].id : "")
  );

  const handlePackageChange = (packageId: string) => {
    setSelectedPackage(packageId);
    if (onPackageChange) {
      onPackageChange(packageId);
    }
  };

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriod(periodId);
    if (onPeriodChange) {
      onPeriodChange(periodId);
    }
  };

  const navigatePeriod = (direction: "prev" | "next") => {
    const currentIndex = periodOptions.findIndex(
      (p) => p.id === selectedPeriod
    );
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === "prev") {
      newIndex =
        (currentIndex - 1 + periodOptions.length) % periodOptions.length;
    } else {
      newIndex = (currentIndex + 1) % periodOptions.length;
    }

    handlePeriodChange(periodOptions[newIndex].id);
  };

  return (
    <div className={`${styles.packageSelector} ${className}`}>
      <div className={styles.selectorContainer}>
        <Select.Root
          value={selectedPackage}
          onValueChange={handlePackageChange}
        >
          <Select.Trigger className={styles.selectorGroup}>
            <span className={styles.selectorLabel}>Package</span>
            <div className={styles.selectWrapper}>
              <Select.Value className={styles.packageSelect}>
                {packageOptions.find((p) => p.id === selectedPackage)?.label}
              </Select.Value>
              <div className={styles.selectArrow}>
                <ChevronDown size={18} />
              </div>
            </div>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className={styles.selectContent} position="popper">
              <Select.Viewport>
                {packageOptions.map((option) => (
                  <Select.Item
                    key={option.id}
                    value={option.id}
                    className={styles.selectItem}
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        <div className={styles.selectorGroup}>
          <label className={styles.selectorLabel}>Period</label>
          <div className={styles.periodSelector}>
            <button
              className={styles.arrowButton}
              onClick={() => navigatePeriod("prev")}
              aria-label="Previous period"
              type="button"
            >
              <ChevronLeft size={18} />
            </button>

            <span className={styles.periodDisplay}>
              {periodOptions.find((p) => p.id === selectedPeriod)?.label}
            </span>

            <button
              className={styles.arrowButton}
              onClick={() => navigatePeriod("next")}
              aria-label="Next period"
              type="button"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
