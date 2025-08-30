"use client";
import React, { useState } from "react";
import { Controller, FieldValues } from "react-hook-form";
import * as Label from "@radix-ui/react-label";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import styles from "./PhoneInput.module.css";
import type { PhoneInputProps } from "./PhoneInput.types";
import { cn } from "@/utils/cn";

const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
] as const;

// Add error message prop to the interface
interface PhoneInputPropsWithError<T extends FieldValues = FieldValues>
  extends PhoneInputProps<T> {
  errorMessage?: string;
}

export const PhoneInput = <T extends FieldValues = FieldValues>(
  props: PhoneInputPropsWithError<T>
) => {
  const {
    name,
    control,
    label,
    placeholder,
    required = false,
    disabled = false,
    className = "",
    hasError = false,
    errorMessage,
  } = props;
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={styles.fieldContainer}>
          <div
            className={cn(
              styles.phoneInputWrapper,
              {
                [styles.error]: error || hasError,
              },
              className
            )}
            onClick={() => {
              const inputElement = document.getElementById(name);
              if (inputElement) {
                inputElement.focus();
              }
            }}
          >
            {label && (
              <Label.Root htmlFor={name} className={styles.label}>
                {label}
                {required && <span className={styles.required}>*</span>}
              </Label.Root>
            )}
            <div className={styles.inputContainer}>
              <Select.Root
                value={selectedCountryCode}
                onValueChange={setSelectedCountryCode}
                disabled={disabled}
              >
                <Select.Trigger className={styles.countryCodeTrigger}>
                  <Select.Value />
                  <Select.Icon asChild>
                    <ChevronDown className={styles.chevronDown} />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className={styles.countryCodeContent}>
                    <Select.Viewport className={styles.countryCodeViewport}>
                      {COUNTRY_CODES.map((country) => (
                        <Select.Item
                          key={country.code}
                          value={country.code}
                          className={styles.countryCodeItem}
                        >
                          <Select.ItemText>
                            <span className={styles.countryCodeOption}>
                              <span className={styles.flag}>
                                {country.flag}
                              </span>
                              <span className={styles.code}>
                                {country.code}
                              </span>
                            </span>
                          </Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
              <input
                {...field}
                id={name}
                type="tel"
                placeholder={placeholder}
                disabled={disabled}
                className={styles.phoneInput}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? `${name}-error` : undefined}
              />
            </div>
            {/* Inline error message inside the border */}
            {(error || (hasError && errorMessage)) && (
              <p
                id={`${name}-error`}
                className={styles.errorMessage}
                role="alert"
              >
                {error?.message || errorMessage}
              </p>
            )}
          </div>
        </div>
      )}
    />
  );
};

PhoneInput.displayName = "PhoneInput";
