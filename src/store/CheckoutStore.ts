"use client";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";
import type { Activity, ActivitySearchParams } from "./ActivityStore";
import type {
  FerryBookingSession,
  UnifiedFerryResult,
  FerryClass,
} from "@/types/FerryBookingSession.types";

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

// Ferry booking interface
export interface FerryBooking {
  id: string;
  sessionId: string;
  ferry: UnifiedFerryResult;
  selectedClass: FerryClass;
  selectedSeats: string[];
  // Structure needed for ReviewStep compatibility
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  totalPrice: number;
  bookingDate: string;
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

// Form data interface for persistence
export interface CheckoutFormData {
  members: MemberDetails[];
  termsAccepted: boolean;
}

// Activity metadata for form initialization
export interface ActivityMetadata {
  title: string;
  totalRequired: number;
  adults: number;
  children: number;
  infants: number;
  date: string;
  location: string;
}

// Ferry metadata for form initialization (similar to ActivityMetadata)
export interface FerryMetadata {
  title: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time: string;
  operator: string;
  className: string;
  totalRequired: number;
  adults: number;
  children: number;
  infants: number;
}

// Simplified checkout state - FORM-CENTRIC APPROACH
interface CheckoutState {
  currentStep: number; // 1=Details, 2=Review, 3=Payment
  bookingType: BookingType;

  // Business data (READ-ONLY for forms)
  activities: CheckoutItem[]; // All selected activities
  ferries: CheckoutItem[]; // All selected ferries

  // Form persistence (updated only on form submission)
  persistedFormData: CheckoutFormData | null;

  // Computed/derived state
  activityMetadata: ActivityMetadata[]; // Computed from activities for form use
  ferryMetadata: FerryMetadata[]; // Computed from ferries for form use

  termsAccepted: boolean; // Temporary - will be moved to form persistence
  bookingConfirmation: BookingConfirmation | null;

  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

// Form-centric checkout actions
interface CheckoutActions {
  // Initialization (from cart)
  initializeFromActivityCart: (cartItems: any[]) => void;
  updateFromActivityCart: (cartItems: any[]) => void;
  initializeFromFerryBooking: (ferryBooking: FerryBooking) => void;
  initializeFromMixedBookings: (
    activities: any[],
    ferries: FerryBooking[]
  ) => void;

  // Navigation (store responsibility)
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Form integration points (clear boundaries)
  getFormDefaults: () => CheckoutFormData;
  updateFormData: (formData: CheckoutFormData) => void;

  // Business logic & computed values
  getTotalActivities: () => number;
  getTotalFerries: () => number;
  getTotalPrice: () => number;
  getActivityMetadata: () => ActivityMetadata[];
  getFerryMetadata: () => FerryMetadata[];
  getAllMetadata: () => (ActivityMetadata | FerryMetadata)[];

  // Validation helpers
  getMinimumMembersNeeded: () => number;
  validateActivityAssignments: (members: MemberDetails[]) => {
    valid: boolean;
    errors: string[];
  };
  validateFerryAssignments: (members: MemberDetails[]) => {
    valid: boolean;
    errors: string[];
  };

  // Booking submission
  submitBooking: () => Promise<any>;

  // Utility actions
  reset: () => void;
  resetAfterBooking: () => void;
  completeReset: () => void;
}

type CheckoutStore = CheckoutState & CheckoutActions;

// Generate unique member ID
const generateMemberId = (): string => {
  return `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to create initial member defaults
const createInitialMembers = (
  activityMetadata: ActivityMetadata[]
): MemberDetails[] => {
  if (activityMetadata.length === 0) return [];

  // Calculate total passengers needed across all activities
  const totalPassengersNeeded = activityMetadata.reduce(
    (total, activity) => total + activity.totalRequired,
    0
  );

  // Create members with smart defaults
  const members: MemberDetails[] = [];

  for (let i = 0; i < totalPassengersNeeded; i++) {
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
      selectedActivities: activityMetadata.map((_, index) => index), // Assign to all activities initially
    });
  }

  return members;
};

// Helper to compute activity metadata from activities
const computeActivityMetadata = (
  activities: CheckoutItem[]
): ActivityMetadata[] => {
  return activities
    .map((item): ActivityMetadata | null => {
      if (item.activityBooking) {
        const { activity, searchParams } = item.activityBooking;
        return {
          title: activity.title || "Unknown Activity",
          totalRequired:
            (searchParams.adults || 0) + (searchParams.children || 0),
          adults: searchParams.adults || 0,
          children: searchParams.children || 0,
          infants: 0,
          date: searchParams.date || "Date TBD",
          location:
            activity.coreInfo.location[0]?.name ||
            searchParams.location ||
            "Location TBD",
        };
      }
      return null;
    })
    .filter((item): item is ActivityMetadata => item !== null);
};

// Helper to compute ferry metadata from ferries
const computeFerryMetadata = (ferries: CheckoutItem[]): FerryMetadata[] => {
  return ferries
    .map((item): FerryMetadata | null => {
      if (item.ferryBooking) {
        const { ferry, selectedClass, passengers } = item.ferryBooking;
        return {
          title: `${ferry.ferryName} - ${selectedClass.name}`,
          fromLocation: ferry.route.from.name,
          toLocation: ferry.route.to.name,
          date: item.ferryBooking.bookingDate,
          time: ferry.schedule.departureTime,
          operator: ferry.operator,
          className: selectedClass.name,
          totalRequired:
            passengers.adults + passengers.children + passengers.infants,
          adults: passengers.adults,
          children: passengers.children,
          infants: passengers.infants,
        };
      }
      return null;
    })
    .filter((item): item is FerryMetadata => item !== null);
};

// Helper to create initial members for mixed bookings
const createMixedInitialMembers = (
  activityMetadata: ActivityMetadata[],
  ferryMetadata: FerryMetadata[]
): MemberDetails[] => {
  const allMetadata = [...activityMetadata, ...ferryMetadata];
  if (allMetadata.length === 0) return [];

  // Calculate total passengers needed across all bookings
  const totalPassengersNeeded = allMetadata.reduce(
    (total, booking) => total + booking.totalRequired,
    0
  );

  // Create members with smart defaults
  const members: MemberDetails[] = [];

  for (let i = 0; i < totalPassengersNeeded; i++) {
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
      selectedActivities: allMetadata.map((_, index) => index), // Assign to all bookings initially
    });
  }

  return members;
};

// Initial state - FORM-CENTRIC
const initialState: CheckoutState = {
  currentStep: 1,
  bookingType: "activity",

  // Business data
  activities: [],
  ferries: [],

  // Form persistence
  persistedFormData: null,

  // Computed state
  activityMetadata: [],
  ferryMetadata: [],

  termsAccepted: false, // TODO: Move to form persistence
  bookingConfirmation: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

// Create the Form-Centric Zustand store
export const useCheckoutStore = create<CheckoutStore>()(
  subscribeWithSelector(
    immer(
      (set, get) =>
        ({
          ...initialState,

          // === INITIALIZATION ===
          initializeFromActivityCart: (cartItems) => {
            set((state) => {
              state.isLoading = true;
              state.isInitialized = false;
              state.bookingType = "activity";

              // Set business data
              state.activities = cartItems.map((cartItem) => ({
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

              // Compute metadata for forms
              state.activityMetadata = computeActivityMetadata(
                state.activities
              );

              // Clear any existing form data (fresh start)
              state.persistedFormData = null;
              state.currentStep = 1;
              state.error = null;

              state.isLoading = false;
              state.isInitialized = true;
            });
          },

          updateFromActivityCart: (cartItems) => {
            set((state) => {
              // Update business data
              state.activities = cartItems.map((cartItem) => ({
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

              // Update metadata
              state.activityMetadata = computeActivityMetadata(
                state.activities
              );

              // Clear form data if activity requirements changed significantly
              // Forms will re-initialize with new defaults
              state.persistedFormData = null;
            });
          },

          initializeFromFerryBooking: (ferryBooking: FerryBooking) => {
            set((state) => {
              state.isLoading = true;
              state.isInitialized = false;
              state.bookingType = "ferry";

              // Set business data
              state.ferries = [
                {
                  type: "ferry" as BookingType,
                  ferryBooking,
                },
              ];
              state.activities = []; // Clear activities

              // Compute metadata for forms
              state.ferryMetadata = computeFerryMetadata(state.ferries);
              state.activityMetadata = [];

              // Clear any existing form data (fresh start)
              state.persistedFormData = null;
              state.currentStep = 1;
              state.error = null;

              state.isLoading = false;
              state.isInitialized = true;
            });
          },

          initializeFromMixedBookings: (
            activities: any[],
            ferries: FerryBooking[]
          ) => {
            set((state) => {
              state.isLoading = true;
              state.isInitialized = false;
              state.bookingType = "activity"; // Default to activity for mixed

              // Set business data
              state.activities = activities.map((cartItem) => ({
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

              state.ferries = ferries.map((ferryBooking) => ({
                type: "ferry" as BookingType,
                ferryBooking,
              }));

              // Compute metadata for forms
              state.activityMetadata = computeActivityMetadata(
                state.activities
              );
              state.ferryMetadata = computeFerryMetadata(state.ferries);

              // Clear any existing form data (fresh start)
              state.persistedFormData = null;
              state.currentStep = 1;
              state.error = null;

              state.isLoading = false;
              state.isInitialized = true;
            });
          },

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

          // === FORM INTEGRATION ===
          getFormDefaults: (): CheckoutFormData => {
            const state = get();

            // Return persisted data if available
            if (state.persistedFormData) {
              return state.persistedFormData;
            }

            // Generate fresh defaults based on current bookings (activities + ferries)
            const defaultMembers = createMixedInitialMembers(
              state.activityMetadata,
              state.ferryMetadata
            );

            return {
              members: defaultMembers,
              termsAccepted: false,
            };
          },

          updateFormData: (formData: CheckoutFormData) => {
            set((state) => {
              state.persistedFormData = formData;
              // Also update legacy termsAccepted for backward compatibility
              state.termsAccepted = formData.termsAccepted;
            });
          },

          // === BUSINESS LOGIC & COMPUTED VALUES ===
          getTotalActivities: () => {
            return get().activities.length;
          },

          getTotalFerries: () => {
            return get().ferries.length;
          },

          getTotalPrice: () => {
            const state = get();
            const activityTotal = state.activities.reduce((total, item) => {
              return total + (item.activityBooking?.totalPrice || 0);
            }, 0);
            const ferryTotal = state.ferries.reduce((total, item) => {
              return total + (item.ferryBooking?.totalPrice || 0);
            }, 0);
            return activityTotal + ferryTotal;
          },

          getActivityMetadata: () => {
            return get().activityMetadata || [];
          },

          getFerryMetadata: () => {
            return get().ferryMetadata || [];
          },

          getAllMetadata: () => {
            const state = get();
            return [
              ...(state.activityMetadata || []),
              ...(state.ferryMetadata || []),
            ];
          },

          getMinimumMembersNeeded: () => {
            const state = get();
            const activityMembers = (state.activityMetadata || []).reduce(
              (total, activity) => total + activity.totalRequired,
              0
            );
            const ferryMembers = (state.ferryMetadata || []).reduce(
              (total, ferry) => total + ferry.totalRequired,
              0
            );
            return activityMembers + ferryMembers;
          },

          validateActivityAssignments: (members: MemberDetails[]) => {
            const state = get();
            const errors: string[] = [];
            const activityMetadata = state.activityMetadata || [];

            // Count assignments per activity
            const assignmentCounts = activityMetadata.map(() => 0);

            members.forEach((member) => {
              (member.selectedActivities || []).forEach((activityIndex) => {
                if (
                  activityIndex >= 0 &&
                  activityIndex < assignmentCounts.length
                ) {
                  assignmentCounts[activityIndex]++;
                }
              });
            });

            // Check each activity has enough passengers
            activityMetadata.forEach((activity, index) => {
              const required = activity.totalRequired;
              const assigned = assignmentCounts[index];

              if (assigned < required) {
                errors.push(
                  `${activity.title} needs ${
                    required - assigned
                  } more passengers`
                );
              }
            });

            return {
              valid: errors.length === 0,
              errors,
            };
          },

          validateFerryAssignments: (members: MemberDetails[]) => {
            const state = get();
            const errors: string[] = [];
            const activityMetadata = state.activityMetadata || [];
            const ferryMetadata = state.ferryMetadata || [];

            // For ferries, we need to validate against ferry metadata
            // Count assignments per ferry (using the same selectedActivities array for now)
            const totalMetadata = [...activityMetadata, ...ferryMetadata];
            const ferryStartIndex = activityMetadata.length;
            const assignmentCounts = totalMetadata.map(() => 0);

            members.forEach((member) => {
              (member.selectedActivities || []).forEach((index) => {
                if (index >= 0 && index < assignmentCounts.length) {
                  assignmentCounts[index]++;
                }
              });
            });

            // Check each ferry has enough passengers
            ferryMetadata.forEach((ferry, ferryIndex) => {
              const totalIndex = ferryStartIndex + ferryIndex;
              const required = ferry.totalRequired;
              const assigned = assignmentCounts[totalIndex];

              if (assigned < required) {
                errors.push(
                  `${ferry.title} needs ${required - assigned} more passengers`
                );
              }
            });

            return {
              valid: errors.length === 0,
              errors,
            };
          },

          // === BOOKING SUBMISSION ===
          submitBooking: async () => {
            const state = get();

            set((draft) => {
              draft.isLoading = true;
              draft.error = null;
            });

            try {
              if (!state.persistedFormData) {
                throw new Error("No form data to submit");
              }

              // Validate before submission (activities and ferries)
              const activityValidation = get().validateActivityAssignments(
                state.persistedFormData.members
              );
              const ferryValidation = get().validateFerryAssignments(
                state.persistedFormData.members
              );

              const allErrors = [
                ...activityValidation.errors,
                ...ferryValidation.errors,
              ];
              if (allErrors.length > 0) {
                throw new Error(`Validation failed: ${allErrors.join(", ")}`);
              }

              // Prepare booking data for payment
              const bookingData = {
                activities: state.activities,
                ferries: state.ferries,
                members: state.persistedFormData.members,
                termsAccepted: state.persistedFormData.termsAccepted,
                totalPrice: get().getTotalPrice(),
                bookingType: state.bookingType,
                hasActivities: state.activities.length > 0,
                hasFerries: state.ferries.length > 0,
              };

              // Set up payment success callback
              window.onPaymentSuccess = (paymentResult: any) => {
                set((draft) => {
                  draft.bookingConfirmation = {
                    bookingId: paymentResult.booking.bookingId,
                    confirmationNumber:
                      paymentResult.booking.confirmationNumber,
                    bookingDate: new Date().toISOString(),
                    status: paymentResult.booking.status,
                    paymentStatus: paymentResult.booking.paymentStatus,
                  };
                  draft.currentStep = 3;
                  // Keep loading for a brief moment to show transition feedback
                });

                // Call resetAfterBooking to clear form data but keep confirmation
                get().resetAfterBooking();

                // Set loading to false after a brief delay to show transition
                setTimeout(() => {
                  set((draft) => {
                    draft.isLoading = false;
                  });
                }, 1000);
              };

              // Set up payment error callback
              window.onPaymentError = (error: any) => {
                set((draft) => {
                  draft.error =
                    error instanceof Error ? error.message : "Payment failed";
                  draft.isLoading = false;
                });
              };

              // Set up payment cancel callback
              window.onPaymentCancel = () => {
                set((draft) => {
                  draft.error = "Payment was cancelled";
                  draft.isLoading = false;
                });
              };

              // Payment will be initiated by the component using useRazorpay hook
              // The booking submission is now complete - payment handling is separate
              set((draft) => {
                draft.isLoading = false;
              });

              // Return booking data for payment initiation
              return bookingData;
            } catch (error) {
              set((draft) => {
                draft.error =
                  error instanceof Error
                    ? error.message
                    : "Booking preparation failed";
                draft.isLoading = false;
              });
              throw error;
            }
          },

          // === UTILITY ===
          reset: () => {
            set(initialState);
          },

          // Reset after successful booking completion
          resetAfterBooking: () => {
            set((draft) => {
              // Selectively reset only non-essential fields
              // Keep: bookingConfirmation, persistedFormData, activities, currentStep

              // Reset form-related state
              draft.isLoading = false;
              draft.error = null;

              // Reset temporary state (but keep essential data)
              // DON'T reset: persistedFormData, activities, bookingConfirmation

              // Stay on confirmation step
              draft.currentStep = 3;
            });
          },

          // Complete reset (including confirmation) - for new booking session
          completeReset: () => {
            set(initialState);
          },

          // === LEGACY COMPATIBILITY (deprecated - remove gradually) ===
          members: [], // Computed from persistedFormData.members
          updateMember: () => {}, // No longer used - forms handle this
          addMember: () => {}, // No longer used - forms handle this
          removeMember: () => {}, // No longer used - forms handle this
          getMemberById: () => undefined, // No longer used
          initializeMembersFromPassengerCount: () => {}, // No longer used
          autoAssignMembersToActivities: () => {}, // No longer used
          addExtraMember: () => {}, // No longer used
          canRemoveMember: () => false, // No longer used
          setTermsAccepted: (accepted: boolean) => {
            // Legacy support - update persisted data if it exists
            set((state) => {
              state.termsAccepted = accepted;
              if (state.persistedFormData) {
                state.persistedFormData.termsAccepted = accepted;
              }
            });
          },
        } as CheckoutStore)
    )
  )
);

// Enhanced selectors for performance optimization
export const useCurrentStep = () =>
  useCheckoutStore((state) => state.currentStep);

export const useCheckoutItems = () =>
  useCheckoutStore((state) => [
    ...(state.activities || []),
    ...(state.ferries || []),
  ]);

export const useAllCheckoutItems = () =>
  useCheckoutStore((state) => [
    ...(state.activities || []),
    ...(state.ferries || []),
  ]);

export const useCurrentCheckoutItem = () =>
  useCheckoutStore((state) => [
    ...(state.activities || []),
    ...(state.ferries || []),
  ]);

export const useMembers = () =>
  useCheckoutStore((state) => {
    // Defensive programming: ensure we always return an array
    try {
      return state?.persistedFormData?.members || [];
    } catch (error) {
      console.warn("Error accessing members from store:", error);
      return [];
    }
  });

export const useBookingConfirmation = () =>
  useCheckoutStore((state) => state.bookingConfirmation);

export const useCheckoutLoading = () =>
  useCheckoutStore((state) => ({
    isLoading: state.isLoading,
  }));

// New form-centric selectors
export const useFormDefaults = () =>
  useCheckoutStore((state) => state.getFormDefaults());

export const useActivityMetadata = () =>
  useCheckoutStore((state) => state.getActivityMetadata());

export const useFerryMetadata = () =>
  useCheckoutStore((state) => state.getFerryMetadata());

export const useAllMetadata = () =>
  useCheckoutStore((state) => state.getAllMetadata());
