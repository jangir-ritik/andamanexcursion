// hooks/useFormPersistence.ts
import { useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { debounce } from "lodash";
import { ContactFormData } from "../components/ContactForm/ContactForm.types";

const FORM_KEY = "andaman_excursion_form";

const saveFormData = (data: ContactFormData) => {
  try {
    sessionStorage.setItem(
      FORM_KEY,
      JSON.stringify({
        ...data,
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
      })
    );
  } catch (error) {
    console.warn("Failed to save form data:", error);
  }
};

const loadFormData = (): Partial<ContactFormData> | null => {
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

export const useFormPersistence = (form: UseFormReturn<ContactFormData>) => {
  const { watch, setValue, getValues } = form;

  // Load on mount
  useEffect(() => {
    const savedData = loadFormData();
    if (savedData) {
      Object.entries(savedData).forEach(([key, value]) => {
        if (key !== "timestamp" && key !== "expiresAt") {
          setValue(key as keyof ContactFormData, value);
        }
      });
    }
  }, [setValue]);

  // Save on changes (debounced)
  const formData = watch();
  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        saveFormData(formData);
      }, 500),
    [formData]
  );

  useEffect(() => {
    debouncedSave();
  }, [formData, debouncedSave]);

  // Clear on successful submission
  const clearSavedData = () => {
    sessionStorage.removeItem(FORM_KEY);
  };

  return { clearSavedData };
};
