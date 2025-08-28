"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// Simplified CheckoutStore - Only handles form state and navigation
// Business logic is handled by CheckoutAdapter

export interface MemberDetails {
  id: string;
  fullName: string;
  age: number;
  gender: "Male" | "Female" | "Other" | "";
  nationality: string;
  passportNumber: string;
  whatsappNumber?: string;
  email?: string;
  isPrimary: boolean;
  selectedBookings: number[]; // Which bookings this member is assigned to
}

export interface CheckoutFormData {
  members: MemberDetails[];
  termsAccepted: boolean;
}

export interface BookingConfirmation {
  bookingId: string;
  confirmationNumber: string;
  bookingDate: string;
  status: "confirmed" | "pending" | "failed";
  paymentStatus: "paid" | "pending" | "failed";
}

// Simplified state - only form management
interface SimpleCheckoutState {
  // Navigation
  currentStep: number; // 1=Details, 2=Review, 3=Payment

  // Form state (persisted)
  formData: CheckoutFormData | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Confirmation
  bookingConfirmation: BookingConfirmation | null;
}

// Simple actions - no complex business logic
interface SimpleCheckoutActions {
  // Navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Form management
  updateFormData: (formData: CheckoutFormData) => void;
  getFormData: () => CheckoutFormData | null;

  // UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Confirmation
  setBookingConfirmation: (confirmation: BookingConfirmation) => void;

  // Utility
  reset: () => void;
  resetAfterBooking: () => void;
}

type SimpleCheckoutStore = SimpleCheckoutState & SimpleCheckoutActions;

// Initial state
const initialState: SimpleCheckoutState = {
  currentStep: 1,
  formData: null,
  isLoading: false,
  error: null,
  bookingConfirmation: null,
};

// Generate unique member ID
// TODO: use nanoid to generate member id
const generateMemberId = (): string => {
  return `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create default form data based on passenger requirements
export const createDefaultFormData = (
  totalPassengers: number
): CheckoutFormData => {
  const members: MemberDetails[] = [];

  for (let i = 0; i < totalPassengers; i++) {
    members.push({
      id: generateMemberId(),
      fullName: "",
      age: i === 0 ? 25 : 12, // First member adult, others children by default
      gender: "",
      nationality: "Indian",
      passportNumber: "",
      whatsappNumber: i === 0 ? "" : undefined, // Only primary gets contact fields
      email: i === 0 ? "" : undefined,
      isPrimary: i === 0,
      selectedBookings: [0], // Assign to first booking by default
    });
  }

  return {
    members,
    termsAccepted: false,
  };
};

// Simple Zustand store - no complex business logic
export const useSimpleCheckoutStore = create<SimpleCheckoutStore>()(
  immer((set, get) => ({
    ...initialState,

    // === NAVIGATION ===
    setCurrentStep: (step: number) => {
      set((state) => {
        state.currentStep = step;
      });
    },

    nextStep: () => {
      set((state) => {
        if (state.currentStep < 3) {
          state.currentStep += 1;
        }
      });
    },

    prevStep: () => {
      set((state) => {
        if (state.currentStep > 1) {
          state.currentStep -= 1;
        }
      });
    },

    // === FORM MANAGEMENT ===
    updateFormData: (formData: CheckoutFormData) => {
      set((state) => {
        state.formData = formData;
      });
    },

    getFormData: () => {
      return get().formData;
    },

    // === UI STATE ===
    setLoading: (loading: boolean) => {
      set((state) => {
        state.isLoading = loading;
      });
    },

    setError: (error: string | null) => {
      set((state) => {
        state.error = error;
      });
    },

    // === CONFIRMATION ===
    setBookingConfirmation: (confirmation: BookingConfirmation) => {
      set((state) => {
        state.bookingConfirmation = confirmation;
        state.currentStep = 3; // Move to confirmation step
      });
    },

    // === UTILITY ===
    reset: () => {
      set(initialState);
    },

    resetAfterBooking: () => {
      set(initialState);

      // Also clear the underlying booking data stores
      if (typeof window !== "undefined") {
        // Reset ferry store
        if ((window as any).__FERRY_STORE__) {
          const ferryStore = (window as any).__FERRY_STORE__;
          if (ferryStore.getState) {
            const state = ferryStore.getState();
            if (state.resetBookingSession) {
              state.resetBookingSession();
            }
          }
        }

        // Reset activity store
        if ((window as any).__ACTIVITY_STORE__) {
          const activityStore = (window as any).__ACTIVITY_STORE__;
          if (activityStore.getState) {
            const state = activityStore.getState();
            if (state.clearCart) {
              state.clearCart();
            }
          }
        }

        // Force URL change to clear any cached checkout state
        setTimeout(() => {
          const currentUrl = window.location.pathname;
          if (currentUrl.includes("/checkout")) {
            window.history.replaceState({}, "", currentUrl.split("?")[0]);
          }
        }, 100);
      }
    },
  }))
);

// Selectors for performance
export const useCurrentStep = () =>
  useSimpleCheckoutStore((state) => state.currentStep);
export const useFormData = () =>
  useSimpleCheckoutStore((state) => state.formData);
export const useCheckoutLoading = () =>
  useSimpleCheckoutStore((state) => state.isLoading);
export const useCheckoutError = () =>
  useSimpleCheckoutStore((state) => state.error);
export const useBookingConfirmation = () =>
  useSimpleCheckoutStore((state) => state.bookingConfirmation);
