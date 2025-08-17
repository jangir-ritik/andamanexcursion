// // hooks/useFormPersistence.ts
// import { useEffect, useMemo } from "react";
// import { UseFormReturn } from "react-hook-form";
// import { debounce } from "lodash";
// import { ContactFormData } from "../components/ContactForm/ContactForm.types";

// const FORM_KEY = "andaman_excursion_form";

// const saveFormData = (data: ContactFormData) => {
//   try {
//     sessionStorage.setItem(
//       FORM_KEY,
//       JSON.stringify({
//         ...data,
//         timestamp: Date.now(),
//         expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
//       })
//     );
//   } catch (error) {
//     console.warn("Failed to save form data:", error);
//   }
// };

// const loadFormData = (): Partial<ContactFormData> | null => {
//   try {
//     const stored = sessionStorage.getItem(FORM_KEY);
//     if (!stored) return null;

//     const parsed = JSON.parse(stored);

//     // Check if expired
//     if (Date.now() > parsed.expiresAt) {
//       sessionStorage.removeItem(FORM_KEY);
//       return null;
//     }

//     return parsed;
//   } catch (error) {
//     console.warn("Failed to load form data:", error);
//     return null;
//   }
// };

// export const useFormPersistence = (form: UseFormReturn<ContactFormData>) => {
//   const { watch, setValue, getValues } = form;

//   // Load on mount
//   useEffect(() => {
//     const savedData = loadFormData();
//     if (savedData) {
//       Object.entries(savedData).forEach(([key, value]) => {
//         if (key !== "timestamp" && key !== "expiresAt") {
//           setValue(key as keyof ContactFormData, value);
//         }
//       });
//     }
//   }, [setValue]);

//   // Save on changes (debounced)
//   const formData = watch();
//   const debouncedSave = useMemo(
//     () =>
//       debounce(() => {
//         saveFormData(formData);
//       }, 500),
//     [formData]
//   );

//   useEffect(() => {
//     debouncedSave();
//   }, [formData, debouncedSave]);

//   // Clear on successful submission
//   const clearSavedData = () => {
//     sessionStorage.removeItem(FORM_KEY);
//   };

//   return { clearSavedData };
// };
// hooks/useFormPersistence.ts
import { useEffect, useMemo, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { debounce } from "lodash";
import { ContactFormData } from "../components/ContactForm/ContactForm.types";

const FORM_KEY = "andaman_excursion_form";
const EXPIRY_MINUTES = 30;

interface StoredFormData extends ContactFormData {
  timestamp: number;
  expiresAt: number;
  version?: string; // For future compatibility
}

const saveFormData = (data: ContactFormData) => {
  try {
    const storedData: StoredFormData = {
      ...data,
      timestamp: Date.now(),
      expiresAt: Date.now() + EXPIRY_MINUTES * 60 * 1000,
      version: "1.0",
    };
    
    sessionStorage.setItem(FORM_KEY, JSON.stringify(storedData));
  } catch (error) {
    console.warn("Failed to save form data:", error);
  }
};

const loadFormData = (): Partial<ContactFormData> | null => {
  try {
    const stored = sessionStorage.getItem(FORM_KEY);
    if (!stored) return null;

    const parsed: StoredFormData = JSON.parse(stored);
    
    // Check if expired
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(FORM_KEY);
      return null;
    }

    // Remove metadata before returning
    const { timestamp, expiresAt, version, ...formData } = parsed;
    return formData;
  } catch (error) {
    console.warn("Failed to load form data:", error);
    sessionStorage.removeItem(FORM_KEY); // Clean up corrupted data
    return null;
  }
};

export const useFormPersistence = (form: UseFormReturn<ContactFormData>) => {
  const { watch, setValue, getValues, formState } = form;

  // Load saved data on mount
  useEffect(() => {
    const savedData = loadFormData();
    if (savedData) {
      console.log("📂 Loading saved form data");
      
      // Set values individually to maintain form state
      Object.entries(savedData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          try {
            setValue(key as keyof ContactFormData, value, { 
              shouldDirty: true,
              shouldValidate: false // Don't validate on load
            });
          } catch (error) {
            console.warn(`Failed to set form field ${key}:`, error);
          }
        }
      });
    }
  }, [setValue]);

  // Watch form data for changes
  const formData = watch();

  // Create debounced save function
  const debouncedSave = useMemo(
    () => debounce((data: ContactFormData) => {
      // Only save if form has been modified
      if (formState.isDirty) {
        saveFormData(data);
      }
    }, 1000), // Increased debounce time to reduce saves
    [formState.isDirty]
  );

  // Save form data when it changes
  useEffect(() => {
    if (formState.isDirty) {
      debouncedSave(formData);
    }
    
    // Cleanup debounce on unmount
    return () => {
      debouncedSave.cancel();
    };
  }, [formData, formState.isDirty, debouncedSave]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      sessionStorage.removeItem(FORM_KEY);
      console.log("🗑️ Cleared saved form data");
    } catch (error) {
      console.warn("Failed to clear saved form data:", error);
    }
  }, []);

  // Check if there's saved data available
  const hasSavedData = useCallback(() => {
    return loadFormData() !== null;
  }, []);

  return { 
    clearSavedData, 
    hasSavedData,
    // Expose save function for manual saves if needed
    saveNow: () => saveFormData(getValues())
  };
};