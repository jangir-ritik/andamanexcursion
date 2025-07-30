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
  selectedActivities: number[]; // Array of activity indices this member is assigned to
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

// Enhanced checkout state for multi-activity support
interface CheckoutState {
  currentStep: number;
  bookingType: BookingType;

  // Multi-activity support
  allCheckoutItems: CheckoutItem[]; // All items from cart
  currentActivityIndex: number; // Which activity we're processing

  // Unified member management - simpler approach
  allMembers: MemberDetails[]; // All members for all activities

  // Legacy - current activity being processed (for backward compatibility)
  checkoutItems: CheckoutItem[]; // Current single activity
  members: MemberDetails[]; // Current activity's members (kept in sync with allMembers)

  termsAccepted: boolean;
  bookingConfirmation: BookingConfirmation | null;
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
}

// Enhanced checkout actions
interface CheckoutActions {
  // Flow navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Multi-activity management
  initializeFromActivityCart: (cartItems: any[]) => void;
  getCurrentActivity: () => CheckoutItem | null;
  moveToNextActivity: () => boolean; // Returns true if more activities exist
  moveToPreviousActivity: () => boolean;
  getTotalActivities: () => number;
  getCurrentActivityIndex: () => number;
  isLastActivity: () => boolean;
  isFirstActivity: () => boolean;

  // Initialize checkout from ferry booking (future)
  initializeFromFerryBooking: (ferryBooking: FerryBooking) => void;

  // Member management (unified approach)
  addMember: (member: Omit<MemberDetails, "id">) => void;
  updateMember: (memberId: string, updates: Partial<MemberDetails>) => void;
  removeMember: (memberId: string) => void;
  getMemberById: (memberId: string) => MemberDetails | undefined;
  initializeMembersFromPassengerCount: () => void;

  // New unified member management
  getMinimumMembersNeeded: () => number; // Total passengers across all activities
  addExtraMember: () => void; // Add member beyond minimum required
  canRemoveMember: (memberId: string) => boolean; // Check if member can be removed

  // Terms & conditions
  setTermsAccepted: (accepted: boolean) => void;

  // Booking submission
  submitBooking: () => Promise<void>;

  // Utility actions
  reset: () => void;
  getTotalPassengers: () => number; // For current activity
  getAdultCount: () => number; // For current activity
  getTotalPrice: () => number; // For all activities
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

  // Multi-activity support
  allCheckoutItems: [],
  currentActivityIndex: 0,

  // Unified member management - simpler approach
  allMembers: [],

  // Legacy - current activity being processed
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
    immer(
      (set, get) =>
        ({
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

          // Multi-activity management
          initializeFromActivityCart: (cartItems) => {
            set((state) => {
              state.bookingType = "activity";
              state.allCheckoutItems = cartItems.map((cartItem) => ({
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
              state.currentActivityIndex = 0;
              state.allMembers = []; // Clear all members
              state.currentStep = 1;
              state.error = null;

              // Set current activity to first one
              if (state.allCheckoutItems.length > 0) {
                state.checkoutItems = [state.allCheckoutItems[0]];
              }
            });

            // Initialize members for first activity
            get().initializeMembersFromPassengerCount();
          },

          getCurrentActivity: () => {
            const { allCheckoutItems, currentActivityIndex } = get();
            return allCheckoutItems[currentActivityIndex] || null;
          },

          moveToNextActivity: () => {
            const state = get();
            if (
              state.currentActivityIndex <
              state.allCheckoutItems.length - 1
            ) {
              set((draft) => {
                draft.currentActivityIndex += 1;
                draft.checkoutItems = [
                  draft.allCheckoutItems[draft.currentActivityIndex],
                ];
                draft.currentStep = 1; // Reset to member details for new activity
                // Keep members in sync
                draft.members = [...draft.allMembers];
              });

              return true;
            }
            return false;
          },

          moveToPreviousActivity: () => {
            const state = get();
            if (state.currentActivityIndex > 0) {
              set((draft) => {
                draft.currentActivityIndex -= 1;
                draft.checkoutItems = [
                  draft.allCheckoutItems[draft.currentActivityIndex],
                ];
                draft.currentStep = 1;
                // Keep members in sync
                draft.members = [...draft.allMembers];
              });

              return true;
            }
            return false;
          },

          getTotalActivities: () => {
            return get().allCheckoutItems.length;
          },

          getCurrentActivityIndex: () => {
            return get().currentActivityIndex;
          },

          isLastActivity: () => {
            const state = get();
            return (
              state.currentActivityIndex >= state.allCheckoutItems.length - 1
            );
          },

          isFirstActivity: () => {
            return get().currentActivityIndex === 0;
          },

          // Initialize from ferry booking (future implementation)
          initializeFromFerryBooking: (ferryBooking) => {
            set((state) => {
              state.bookingType = "ferry";
              state.allCheckoutItems = [
                {
                  type: "ferry",
                  ferryBooking,
                },
              ];
              state.checkoutItems = [state.allCheckoutItems[0]];
              state.currentActivityIndex = 0;
              state.allMembers = []; // Clear all members
              state.currentStep = 1;
              state.error = null;
            });

            // Initialize members based on passenger count
            get().initializeMembersFromPassengerCount();
          },

          // Initialize members based on passenger count
          initializeMembersFromPassengerCount: () => {
            const minRequired = get().getMinimumMembersNeeded();
            const adultCount = get().getAdultCount();
            const childCount = minRequired - adultCount; // Calculate children count

            const members: MemberDetails[] = [];

            // Create adult members first
            for (let i = 0; i < adultCount; i++) {
              members.push({
                id: generateMemberId(),
                fullName: "",
                age: 25, // Default adult age
                gender: "",
                nationality: "Indian",
                passportNumber: "",
                whatsappNumber: i === 0 ? "" : undefined, // Only primary member needs WhatsApp
                email: i === 0 ? "" : undefined, // Only primary member needs email
                isPrimary: i === 0,
                selectedActivities: [], // Initialize with empty array
              });
            }

            // Create child members
            for (let i = 0; i < childCount; i++) {
              members.push({
                id: generateMemberId(),
                fullName: "",
                age: 12, // Default child age
                gender: "",
                nationality: "Indian",
                passportNumber: "",
                whatsappNumber: undefined,
                email: undefined,
                isPrimary: false,
                selectedActivities: [], // Initialize with empty array
              });
            }

            set((state) => {
              state.allMembers = members;
              state.members = [...members]; // Keep legacy members in sync
            });
          },

          // Member management (unified approach)
          addMember: (memberData) => {
            set((state) => {
              const newMember: MemberDetails = {
                ...memberData,
                id: generateMemberId(),
                selectedActivities: [], // Initialize selectedActivities
              };
              state.allMembers.push(newMember);
              state.members.push(newMember); // Keep legacy members in sync
            });
          },

          updateMember: (memberId, updates) => {
            set((state) => {
              const memberIndex = state.allMembers.findIndex(
                (m) => m.id === memberId
              );
              if (memberIndex !== -1) {
                Object.assign(state.allMembers[memberIndex], updates);
              }
              // Keep legacy members in sync
              const legacyMemberIndex = state.members.findIndex(
                (m) => m.id === memberId
              );
              if (legacyMemberIndex !== -1) {
                Object.assign(state.members[legacyMemberIndex], updates);
              }
            });
          },

          removeMember: (memberId) => {
            set((state) => {
              state.allMembers = state.allMembers.filter(
                (m) => m.id !== memberId
              );
              state.members = state.members.filter((m) => m.id !== memberId); // Keep legacy members in sync
            });
          },

          getMemberById: (memberId) => {
            return get().allMembers.find((m) => m.id === memberId);
          },

          // New unified member management
          getMinimumMembersNeeded: () => {
            const { allCheckoutItems, bookingType } = get();
            let totalPassengers = 0;

            if (bookingType === "activity") {
              // Calculate total passengers across ALL activities
              // Each activity booking has specific passenger requirements
              for (const item of allCheckoutItems) {
                if (item.activityBooking) {
                  totalPassengers +=
                    item.activityBooking.searchParams.adults +
                    item.activityBooking.searchParams.children;
                }
              }
            } else if (bookingType === "ferry") {
              // For ferry, sum all ferry bookings
              for (const item of allCheckoutItems) {
                if (item.ferryBooking) {
                  totalPassengers +=
                    item.ferryBooking.adults + item.ferryBooking.children;
                }
              }
            }

            return totalPassengers;
          },

          addExtraMember: () => {
            const newMember: MemberDetails = {
              id: generateMemberId(),
              fullName: "",
              age: 25, // Default age for new members
              gender: "",
              nationality: "Indian",
              passportNumber: "",
              whatsappNumber: undefined,
              email: undefined,
              isPrimary: false,
              selectedActivities: [], // Initialize selectedActivities
            };
            set((state) => {
              state.allMembers.push(newMember);
              state.members.push(newMember); // Keep legacy members in sync
            });
          },

          canRemoveMember: (memberId) => {
            const memberToRemove = get().getMemberById(memberId);
            if (!memberToRemove) return false;

            const currentMin = get().getMinimumMembersNeeded();
            const currentTotal = get().allMembers.length;

            // If the member to remove is the primary member, we cannot remove it
            if (memberToRemove.isPrimary) return false;

            // If removing the member will result in fewer than the minimum required, return false
            if (currentTotal - 1 < currentMin) return false;

            return true;
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
              // Simulate booking API call
              await new Promise((resolve) => setTimeout(resolve, 2000));

              const bookingId = `booking-${Date.now()}`;
              const totalPrice = get().getTotalPrice();

              set((state) => {
                state.bookingConfirmation = {
                  bookingId: bookingId,
                  confirmationNumber: `AC${Math.random()
                    .toString(36)
                    .substr(2, 8)
                    .toUpperCase()}`,
                  bookingDate: new Date().toISOString(),
                  status: "confirmed",
                  paymentStatus: "paid",
                };
                state.isSubmitting = false;
                state.currentStep = 3;
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
            const { allCheckoutItems, bookingType } = get();
            let totalPassengers = 0;

            if (bookingType === "activity") {
              // Calculate total passengers across ALL activities
              for (const item of allCheckoutItems) {
                if (item.activityBooking) {
                  const itemPassengers =
                    item.activityBooking.searchParams.adults +
                    item.activityBooking.searchParams.children;
                  totalPassengers += itemPassengers;
                }
              }
            } else if (bookingType === "ferry") {
              // For ferry, sum all ferry passengers
              for (const item of allCheckoutItems) {
                if (item.ferryBooking) {
                  totalPassengers +=
                    item.ferryBooking.adults + item.ferryBooking.children;
                }
              }
            }

            return totalPassengers;
          },

          getAdultCount: () => {
            const { allCheckoutItems, bookingType } = get();
            let totalAdults = 0;

            if (bookingType === "activity") {
              // Calculate total adults across ALL activities
              for (const item of allCheckoutItems) {
                if (item.activityBooking) {
                  totalAdults += item.activityBooking.searchParams.adults;
                }
              }
            } else if (bookingType === "ferry") {
              // For ferry, sum all ferry adult passengers
              for (const item of allCheckoutItems) {
                if (item.ferryBooking) {
                  totalAdults += item.ferryBooking.adults;
                }
              }
            }

            return totalAdults;
          },

          getTotalPrice: () => {
            return get().allCheckoutItems.reduce((total, item) => {
              if (item.activityBooking) {
                return total + item.activityBooking.totalPrice;
              } else if (item.ferryBooking) {
                return total + item.ferryBooking.totalPrice;
              }
              return total;
            }, 0);
          },

          getPrimaryMember: () => {
            return get().allMembers.find((m) => m.isPrimary);
          },
        } as CheckoutStore)
    )
  )
);

// Selectors for performance optimization
export const useCurrentStep = () =>
  useCheckoutStore((state) => state.currentStep);
export const useCheckoutItems = () =>
  useCheckoutStore((state) => state.allCheckoutItems); // Changed from checkoutItems to allCheckoutItems
export const useAllCheckoutItems = () =>
  useCheckoutStore((state) => state.allCheckoutItems); // New explicit selector for all items
export const useCurrentCheckoutItem = () =>
  useCheckoutStore((state) => state.checkoutItems); // Single current activity
export const useMembers = () => useCheckoutStore((state) => state.members);
export const useBookingConfirmation = () =>
  useCheckoutStore((state) => state.bookingConfirmation);
export const useCheckoutLoading = () =>
  useCheckoutStore((state) => ({
    isSubmitting: state.isSubmitting,
    isLoading: state.isLoading,
  }));
