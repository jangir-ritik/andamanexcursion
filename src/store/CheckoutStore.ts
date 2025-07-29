"use client";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";
import type { Activity, ActivitySearchParams } from "./ActivityStore";

// Member details interface
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
}

// Booking types
export type BookingType = "activity" | "ferry";

// Ferry booking interface (for future ferry implementation)
export interface FerryBooking {
  id: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  operator: string;
  class: string;
  adults: number;
  children: number;
  infants: number;
  totalPrice: number;
}

// Activity booking interface (from cart)
export interface ActivityBooking {
  id: string;
  activity: Activity;
  searchParams: ActivitySearchParams;
  quantity: number;
  totalPrice: number;
  activityOptionId?: string;
}

// Checkout item (union type for activity or ferry)
export interface CheckoutItem {
  type: BookingType;
  activityBooking?: ActivityBooking;
  ferryBooking?: FerryBooking;
}

// Booking confirmation details
export interface BookingConfirmation {
  bookingId: string;
  confirmationNumber: string;
  bookingDate: string;
  status: "confirmed" | "pending" | "failed";
  paymentStatus: "paid" | "pending" | "failed";
}

// Checkout state
interface CheckoutState {
  // Flow state
  currentStep: number;
  bookingType: BookingType;

  // Checkout items
  checkoutItems: CheckoutItem[];

  // Member details
  members: MemberDetails[];

  // Terms & conditions
  termsAccepted: boolean;

  // Booking confirmation
  bookingConfirmation: BookingConfirmation | null;

  // Loading states
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
}

// Checkout actions
interface CheckoutActions {
  // Flow navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Initialize checkout from activity cart
  initializeFromActivityCart: (cartItems: any[]) => void;

  // Initialize checkout from ferry booking (future)
  initializeFromFerryBooking: (ferryBooking: FerryBooking) => void;

  // Member management
  addMember: (member: Omit<MemberDetails, "id">) => void;
  updateMember: (memberId: string, updates: Partial<MemberDetails>) => void;
  removeMember: (memberId: string) => void;
  getMemberById: (memberId: string) => MemberDetails | undefined;
  initializeMembersFromPassengerCount: () => void;

  // Terms & conditions
  setTermsAccepted: (accepted: boolean) => void;

  // Booking submission
  submitBooking: () => Promise<void>;

  // Utility actions
  reset: () => void;
  getTotalPassengers: () => number;
  getAdultCount: () => number;
  getTotalPrice: () => number;
  getPrimaryMember: () => MemberDetails | undefined;
}

type CheckoutStore = CheckoutState & CheckoutActions;

// Generate unique member ID
const generateMemberId = (): string => {
  return `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Initial state
const initialState: CheckoutState = {
  currentStep: 1,
  bookingType: "activity",
  checkoutItems: [],
  members: [],
  termsAccepted: false,
  bookingConfirmation: null,
  isSubmitting: false,
  isLoading: false,
  error: null,
};

// Create the Zustand store
export const useCheckoutStore = create<CheckoutStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // Flow navigation
      setCurrentStep: (step) => {
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

      // Initialize from activity cart
      initializeFromActivityCart: (cartItems) => {
        set((state) => {
          state.bookingType = "activity";
          state.checkoutItems = cartItems.map((cartItem) => ({
            type: "activity" as BookingType,
            activityBooking: {
              id: cartItem.id,
              activity: cartItem.activity,
              searchParams: cartItem.searchParams,
              quantity: cartItem.quantity,
              totalPrice: cartItem.totalPrice,
              activityOptionId: cartItem.activityOptionId,
            },
          }));
          state.currentStep = 1;
          state.error = null;
        });

        // Initialize members based on passenger count
        get().initializeMembersFromPassengerCount();
      },

      // Initialize from ferry booking (future implementation)
      initializeFromFerryBooking: (ferryBooking) => {
        set((state) => {
          state.bookingType = "ferry";
          state.checkoutItems = [
            {
              type: "ferry",
              ferryBooking,
            },
          ];
          state.currentStep = 1;
          state.error = null;
        });

        // Initialize members based on passenger count
        get().initializeMembersFromPassengerCount();
      },

      // Initialize members based on passenger count
      initializeMembersFromPassengerCount: () => {
        const totalPassengers = get().getTotalPassengers();
        const members: MemberDetails[] = [];

        for (let i = 0; i < totalPassengers; i++) {
          const isAdult = i < get().getAdultCount();
          members.push({
            id: generateMemberId(),
            fullName: "",
            age: isAdult ? 25 : 8, // Default age
            gender: "",
            nationality: "Indian", // Default as per requirements
            passportNumber: "",
            whatsappNumber: i === 0 ? "" : undefined, // Only primary member needs WhatsApp
            email: i === 0 ? "" : undefined, // Only primary member needs email
            isPrimary: i === 0,
          });
        }

        set((state) => {
          state.members = members;
        });
      },

      // Member management
      addMember: (memberData) => {
        set((state) => {
          const newMember: MemberDetails = {
            ...memberData,
            id: generateMemberId(),
          };
          state.members.push(newMember);
        });
      },

      updateMember: (memberId, updates) => {
        set((state) => {
          const memberIndex = state.members.findIndex((m) => m.id === memberId);
          if (memberIndex !== -1) {
            Object.assign(state.members[memberIndex], updates);
          }
        });
      },

      removeMember: (memberId) => {
        set((state) => {
          state.members = state.members.filter((m) => m.id !== memberId);
        });
      },

      getMemberById: (memberId) => {
        return get().members.find((m) => m.id === memberId);
      },

      // Terms & conditions
      setTermsAccepted: (accepted) => {
        set((state) => {
          state.termsAccepted = accepted;
        });
      },

      // Booking submission
      submitBooking: async () => {
        set((state) => {
          state.isSubmitting = true;
          state.error = null;
        });

        try {
          // TODO: Implement actual API call to submit booking
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

          const bookingConfirmation: BookingConfirmation = {
            bookingId: `BK${Date.now()}`,
            confirmationNumber: `AC${Math.random()
              .toString(36)
              .substr(2, 8)
              .toUpperCase()}`,
            bookingDate: new Date().toISOString(),
            status: "confirmed",
            paymentStatus: "paid",
          };

          set((state) => {
            state.bookingConfirmation = bookingConfirmation;
            state.currentStep = 3; // Move to confirmation step
            state.isSubmitting = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error
                ? error.message
                : "Booking submission failed";
            state.isSubmitting = false;
          });
        }
      },

      // Utility actions
      reset: () => {
        set(() => ({ ...initialState }));
      },

      getTotalPassengers: () => {
        const { checkoutItems, bookingType } = get();

        if (bookingType === "activity" && checkoutItems.length > 0) {
          const activityBooking = checkoutItems[0].activityBooking;
          if (activityBooking) {
            return (
              activityBooking.searchParams.adults +
              activityBooking.searchParams.children +
              activityBooking.searchParams.infants
            );
          }
        } else if (bookingType === "ferry" && checkoutItems.length > 0) {
          const ferryBooking = checkoutItems[0].ferryBooking;
          if (ferryBooking) {
            return (
              ferryBooking.adults + ferryBooking.children + ferryBooking.infants
            );
          }
        }

        return 0;
      },

      getAdultCount: () => {
        const { checkoutItems, bookingType } = get();

        if (bookingType === "activity" && checkoutItems.length > 0) {
          return checkoutItems[0].activityBooking?.searchParams.adults || 0;
        } else if (bookingType === "ferry" && checkoutItems.length > 0) {
          return checkoutItems[0].ferryBooking?.adults || 0;
        }

        return 0;
      },

      getTotalPrice: () => {
        return get().checkoutItems.reduce((total, item) => {
          if (item.activityBooking) {
            return total + item.activityBooking.totalPrice;
          } else if (item.ferryBooking) {
            return total + item.ferryBooking.totalPrice;
          }
          return total;
        }, 0);
      },

      getPrimaryMember: () => {
        return get().members.find((m) => m.isPrimary);
      },
    }))
  )
);

// Selectors for performance optimization
export const useCurrentStep = () =>
  useCheckoutStore((state) => state.currentStep);
export const useCheckoutItems = () =>
  useCheckoutStore((state) => state.checkoutItems);
export const useMembers = () => useCheckoutStore((state) => state.members);
export const useBookingConfirmation = () =>
  useCheckoutStore((state) => state.bookingConfirmation);
export const useCheckoutLoading = () =>
  useCheckoutStore((state) => ({
    isSubmitting: state.isSubmitting,
    isLoading: state.isLoading,
  }));
