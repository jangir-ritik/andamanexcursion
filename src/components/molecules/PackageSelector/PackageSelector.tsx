"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./PackageSelector.module.css";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { PackageOption,
  PeriodOption,
  PackageSelectorProps,
 } from "./PackageSelector.types";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Update local state when props change
  useEffect(() => {
    if (defaultPackage && defaultPackage !== selectedPackage) {
      setSelectedPackage(defaultPackage);
    }
  }, [defaultPackage, selectedPackage]);

  useEffect(() => {
    if (defaultPeriod && defaultPeriod !== selectedPeriod) {
      setSelectedPeriod(defaultPeriod);
    }
  }, [defaultPeriod, selectedPeriod]);

  const handlePackageChange = (packageId: string) => {
    setSelectedPackage(packageId);
    setIsDropdownOpen(false);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Find the selected package and period labels
  const selectedPackageLabel =
    packageOptions.find((p) => p.id === selectedPackage)?.label || "";
  const selectedPeriodLabel =
    periodOptions.find((p) => p.id === selectedPeriod)?.label || "";

  return (
    <div className={`${styles.packageSelector} ${className}`}>
      <div className={styles.selectorContainer}>
        <div className={styles.selectorGroup} style={{ position: "relative" }}>
          <span className={styles.selectorLabel}>Package</span>
          <div
            className={styles.selectWrapper}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            ref={triggerRef}
          >
            <div className={styles.packageSelect}>{selectedPackageLabel}</div>
            <div className={styles.selectArrow}>
              <ChevronDown size={18} />
            </div>
          </div>

          {isDropdownOpen && (
            <div
              className={styles.selectContent}
              ref={dropdownRef}
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                zIndex: 20000,
                marginTop: "4px",
              }}
            >
              {packageOptions.map((option) => (
                <div
                  key={option.id}
                  className={`${styles.selectItem} ${
                    option.id === selectedPackage ? styles.selected : ""
                  }`}
                  onClick={() => handlePackageChange(option.id)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

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

            <span className={styles.periodDisplay}>{selectedPeriodLabel}</span>

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
