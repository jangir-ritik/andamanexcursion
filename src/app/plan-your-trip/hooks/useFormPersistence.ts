// hooks/useFormPersistence.ts
import { useEffect, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { debounce } from "lodash";
import { TripFormData } from "../TripFormSchema";

const FORM_KEY = "andaman_trip_planning_form";

const saveFormData = (data: TripFormData) => {
  try {
    sessionStorage.setItem(
      FORM_KEY,
      JSON.stringify({
        ...data,
        timestamp: Date.now(),
        expiresAt: Date.now() + 60 * 60 * 1000, // 60 minutes
      })
    );
    return true;
  } catch (error) {
    console.warn("Failed to save form data:", error);
    return false;
  }
};

const loadFormData = (): Partial<TripFormData> | null => {
  try {
    const stored = sessionStorage.getItem(FORM_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Check if expired
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(FORM_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Failed to load form data:", error);
    return null;
  }
};

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export const useFormPersistence = (form: UseFormReturn<TripFormData>) => {
  const { watch, setValue, getValues } = form;
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Load on mount
  useEffect(() => {
    const savedData = loadFormData();
    if (savedData) {
      Object.entries(savedData).forEach(([key, value]) => {
        if (key !== "timestamp" && key !== "expiresAt") {
          try {
            // Handle nested objects
            if (typeof value === "object" && value !== null) {
              Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                setValue(`${key}.${nestedKey}` as any, nestedValue);
              });
            } else {
              setValue(key as keyof TripFormData, value as any);
            }
          } catch (error) {
            console.warn(`Failed to set field ${key}:`, error);
          }
        }
      });
    }
  }, [setValue]);

  // Save on changes (debounced)
  const formData = watch();
  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        setSaveStatus("saving");
        const success = saveFormData(formData);
        setTimeout(() => {
          setSaveStatus(success ? "saved" : "error");
          // Reset to idle after 2 seconds
          setTimeout(() => {
            setSaveStatus("idle");
          }, 2000);
        }, 500);
      }, 500),
    [formData]
  );

  useEffect(() => {
    debouncedSave();
  }, [formData, debouncedSave]);

  // Clear on successful submission
  const clearSavedData = () => {
    sessionStorage.removeItem(FORM_KEY);
    setSaveStatus("idle");
  };

  return { clearSavedData, saveStatus };
};
