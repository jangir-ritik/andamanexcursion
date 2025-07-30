"use client";
import { useEffect } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";

// Import client-side API services
import { locationApi } from "@/services/api/locations";
import { timeSlotApi } from "@/services/api/timeSlots";
import { activityApi } from "@/services/api/activities";
import { activityCategoryApi } from "@/services/api/activityCategories";
import { formatTimeForDisplay } from "@/utils/timeUtils";

// Types
export interface ActivitySearchParams {
  activityType: string;
  location: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  // Removed: infants: number; - now combined into children
}

export interface Activity {
  id: string;
  title: string;
  slug: string;
  coreInfo: {
    description: string;
    shortDescription?: string;
    category: Array<{
      id: string;
      name?: string;
      slug?: string;
    }>;
    location: Array<{
      id: string;
      name?: string;
      slug?: string;
    }>;
    basePrice: number;
    duration: string;
    maxCapacity?: number;
  };
  media: {
    featuredImage?: {
      id: string;
      url?: string;
    };
    gallery?: Array<{
      image: {
        id: string;
        url?: string;
      };
      alt: string;
    }>;
  };
  activityOptions: Array<{
    id?: string;
    optionTitle: string;
    optionDescription: string;
    price: number;
    duration?: string;
    maxCapacity?: number;
    isActive: boolean;
  }>;
  status: {
    isActive: boolean;
    isFeatured: boolean;
    priority: number;
  };
}

export interface CartItem {
  id: string; // Unique cart item ID
  activity: Activity;
  quantity: number;
  totalPrice: number;
  activityOptionId?: string;
  searchParams: ActivitySearchParams; // Store the search params for each item
  addedAt: string; // Timestamp when added
}

export interface FormOption {
  id: string;
  name: string;
  slug: string;
  value: string;
  label: string;
}

export interface TimeSlotOption extends FormOption {
  time: string;
}

export interface FormOptions {
  locations: FormOption[];
  timeSlots: TimeSlotOption[];
  activityTypes: FormOption[];
  isLoading: boolean;
  error: string | null;
}

// Activity Store State
interface ActivityState {
  // Search state
  searchParams: ActivitySearchParams;

  // Results state
  activities: Activity[];
  isLoading: boolean;
  error: string | null;

  // Cart state
  cart: CartItem[];

  // Form options
  formOptions: FormOptions;

  // Edit mode state
  editingItemId: string | null;
  editingSearchParams: ActivitySearchParams | null;
}

// Activity Store Actions
interface ActivityActions {
  // Search actions
  updateSearchParams: (params: Partial<ActivitySearchParams>) => void;
  searchActivities: (searchParams?: ActivitySearchParams) => Promise<void>;

  // Cart actions
  addToCart: (
    activity: Activity,
    quantity: number,
    activityOptionId?: string,
    customSearchParams?: ActivitySearchParams
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;

  // Edit actions
  startEditingItem: (cartItemId: string) => void;
  editItem: (item: CartItem) => void; // Backward compatibility method
  updateEditingSearchParams: (params: Partial<ActivitySearchParams>) => void;
  saveEditedItem: (
    cartItemId: string,
    newActivity?: Activity,
    newActivityOptionId?: string
  ) => void;
  cancelEditing: () => void;

  // Form options actions
  loadFormOptions: () => Promise<void>;

  // Utility actions
  reset: () => void;

  // Computed getters
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getTotalPassengers: () => number;
  getCartItemById: (cartItemId: string) => CartItem | undefined;
  isItemInCart: (
    activityId: string,
    searchParams: ActivitySearchParams
  ) => boolean;
}

type ActivityStore = ActivityState & ActivityActions;

// Helper functions for transforming data
const formatDataForSelect = {
  locations: (locations: any[]): FormOption[] =>
    locations.map((location) => ({
      id: location.id,
      name: location.name,
      slug: location.slug || location.id,
      value: location.slug || location.id,
      label: location.name,
    })),

  timeSlots: (timeSlots: any[]): TimeSlotOption[] =>
    timeSlots.map((slot) => ({
      id: slot.id,
      name: slot.startTime,
      time: slot.startTime, // 24-hour format
      slug: slot.slug,
      value: slot.slug, // Use slug as value
      label: slot.twelveHourTime || formatTimeForDisplay(slot.startTime), // Display 12-hour format
    })),

  activities: (activities: any[]): FormOption[] =>
    activities.map((activity) => ({
      id: activity.id,
      name: activity.name || activity.title,
      slug: activity.slug || activity.id,
      value: activity.slug || activity.id,
      label: activity.name || activity.title,
    })),

  apiActivities: (activities: any[]): Activity[] =>
    activities.map((apiActivity) => ({
      id: apiActivity.id,
      title: apiActivity.title || "Activity",
      slug: apiActivity.slug || `activity-${apiActivity.id}`,
      coreInfo: {
        description:
          apiActivity.coreInfo?.description || "No description available",
        shortDescription: apiActivity.coreInfo?.shortDescription || null,
        category: Array.isArray(apiActivity.coreInfo?.category)
          ? apiActivity.coreInfo.category
          : [{ id: "default-category", name: "Activity", slug: "activity" }],
        location: Array.isArray(apiActivity.coreInfo?.location)
          ? apiActivity.coreInfo.location
          : [{ id: "default-location", name: "Andaman", slug: "andaman" }],
        basePrice: apiActivity.coreInfo?.basePrice || 0,
        duration: apiActivity.coreInfo?.duration || "1 hour",
        maxCapacity: apiActivity.coreInfo?.maxCapacity || 10,
      },
      media: {
        featuredImage: apiActivity.media?.featuredImage || {
          id: "default-image",
          url: "/images/placeholder.png",
        },
        gallery: apiActivity.media?.gallery || [],
      },
      activityOptions: Array.isArray(apiActivity.activityOptions)
        ? apiActivity.activityOptions
        : [
            {
              id: `default-option-${apiActivity.id}`,
              optionTitle: "Standard Option",
              optionDescription: "Standard activity option",
              price: apiActivity.coreInfo?.basePrice || 0,
              duration: apiActivity.coreInfo?.duration || "1 hour",
              maxCapacity: apiActivity.coreInfo?.maxCapacity || 10,
              isActive: true,
            },
          ],
      status: {
        isActive: apiActivity.status?.isActive ?? true,
        isFeatured: apiActivity.status?.isFeatured ?? false,
        priority: apiActivity.status?.priority ?? 0,
      },
    })),
};

// Default values
const DEFAULT_ACTIVITY_TYPES: FormOption[] = [
  {
    id: "1",
    name: "Scuba Diving",
    slug: "scuba-diving",
    value: "scuba-diving",
    label: "Scuba Diving",
  },
  {
    id: "2",
    name: "Snorkeling",
    slug: "snorkeling",
    value: "snorkeling",
    label: "Snorkeling",
  },
  {
    id: "3",
    name: "Parasailing",
    slug: "parasailing",
    value: "parasailing",
    label: "Parasailing",
  },
  {
    id: "4",
    name: "Jet Ski",
    slug: "jet-ski",
    value: "jet-ski",
    label: "Jet Ski",
  },
];

// Get tomorrow's date in YYYY-MM-DD format
const getTomorrow = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

// Generate unique cart item ID
const generateCartItemId = (): string => {
  return `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate total price for cart item
const calculateTotalPrice = (
  activity: Activity,
  searchParams: ActivitySearchParams,
  activityOptionId?: string,
  quantity: number = 1
): number => {
  const selectedOption = activityOptionId
    ? activity.activityOptions.find((opt) => opt.id === activityOptionId)
    : null;

  const basePrice = selectedOption?.price || activity.coreInfo.basePrice;

  // Calculate price per person (adults full price, children half price, infants free)
  const pricePerBooking =
    basePrice * (searchParams.adults + searchParams.children * 0.5);

  return pricePerBooking * quantity;
};

// Initial state
const initialState: ActivityState = {
  searchParams: {
    activityType: "",
    location: "",
    date: getTomorrow(),
    time: "",
    adults: 2,
    children: 0,
    // Removed: infants: 0,
  },
  activities: [],
  isLoading: false,
  error: null,
  cart: [],
  formOptions: {
    locations: [],
    timeSlots: [],
    activityTypes: [],
    isLoading: false,
    error: null,
  },
  editingItemId: null,
  editingSearchParams: null,
};

// Create the Zustand store with Immer
export const useActivityStore = create<ActivityStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // Search actions
      updateSearchParams: (params) => {
        set((state) => {
          Object.assign(state.searchParams, params);

          // If we're in edit mode, also update the editing search params
          if (state.editingItemId && state.editingSearchParams) {
            Object.assign(state.editingSearchParams, params);
          }
        });
      },

      searchActivities: async (searchParams) => {
        const currentParams = searchParams || get().searchParams;

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          console.log("Searching with params:", currentParams);

          const activities = await activityApi.search({
            activityType: currentParams.activityType,
            location: currentParams.location,
            date: currentParams.date,
            time: currentParams.time,
            adults: currentParams.adults,
            children: currentParams.children,
            // Removed: infants: currentParams.infants,
          });

          set((state) => {
            state.activities = activities;
            state.isLoading = false;
            state.error = null;
          });
        } catch (error) {
          console.error("Error searching activities:", error);
          set((state) => {
            state.error =
              error instanceof Error
                ? error.message
                : "An error occurred while searching for activities";
            state.isLoading = false;
          });
        }
      },

      // Cart actions
      addToCart: (activity, quantity, activityOptionId, customSearchParams) => {
        const searchParams = customSearchParams || get().searchParams;
        const cartItemId = generateCartItemId();
        const totalPrice = calculateTotalPrice(
          activity,
          searchParams,
          activityOptionId,
          quantity
        );

        set((state) => {
          const newItem: CartItem = {
            id: cartItemId,
            activity,
            quantity,
            totalPrice,
            activityOptionId,
            searchParams: { ...searchParams },
            addedAt: new Date().toISOString(),
          };

          state.cart.push(newItem);
        });
      },

      removeFromCart: (cartItemId) => {
        set((state) => {
          const index = state.cart.findIndex((item) => item.id === cartItemId);
          if (index !== -1) {
            state.cart.splice(index, 1);
          }
        });
      },

      updateCartQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(cartItemId);
          return;
        }

        set((state) => {
          const item = state.cart.find((item) => item.id === cartItemId);
          if (item) {
            item.quantity = quantity;
            item.totalPrice = calculateTotalPrice(
              item.activity,
              item.searchParams,
              item.activityOptionId,
              quantity
            );
          }
        });
      },

      clearCart: () => {
        set((state) => {
          state.cart = [];
        });
      },

      // Edit actions
      startEditingItem: (cartItemId) => {
        const item = get().getCartItemById(cartItemId);
        if (item) {
          set((state) => {
            state.editingItemId = cartItemId;
            state.editingSearchParams = { ...item.searchParams };
          });
        }
      },

      editItem: (item) => {
        set((state) => {
          state.editingItemId = item.id;
          state.editingSearchParams = { ...item.searchParams };
        });
      },

      updateEditingSearchParams: (params) => {
        set((state) => {
          if (state.editingSearchParams) {
            Object.assign(state.editingSearchParams, params);
          }
        });
      },

      saveEditedItem: (cartItemId, newActivity, newActivityOptionId) => {
        const { editingSearchParams } = get();
        if (!editingSearchParams) return;

        set((state) => {
          const item = state.cart.find((item) => item.id === cartItemId);
          if (item) {
            // Update the item with new data
            if (newActivity) {
              item.activity = newActivity;
            }
            if (newActivityOptionId !== undefined) {
              item.activityOptionId = newActivityOptionId;
            }

            // Update search params
            item.searchParams = { ...editingSearchParams };

            // Recalculate total price
            item.totalPrice = calculateTotalPrice(
              item.activity,
              item.searchParams,
              item.activityOptionId,
              item.quantity
            );
          }

          // Clear editing state
          state.editingItemId = null;
          state.editingSearchParams = null;
        });
      },

      cancelEditing: () => {
        set((state) => {
          state.editingItemId = null;
          state.editingSearchParams = null;
        });
      },

      // Form options actions
      loadFormOptions: async () => {
        set((state) => {
          state.formOptions.isLoading = true;
          state.formOptions.error = null;
        });

        try {
          const [categories, locations, timeSlots] = await Promise.all([
            activityCategoryApi.getActive(),
            locationApi.getForActivities(),
            timeSlotApi.getForActivities(),
          ]);

          const formattedLocations = formatDataForSelect.locations(locations);
          const formattedTimeSlots = formatDataForSelect.timeSlots(timeSlots);

          let activityTypeOptions: FormOption[] = [];
          if (categories && categories.length > 0) {
            activityTypeOptions = formatDataForSelect.activities(categories);
          } else {
            console.warn(
              "No activity categories returned from API, using defaults"
            );
            activityTypeOptions = DEFAULT_ACTIVITY_TYPES;
          }

          set((state) => {
            state.formOptions.locations = formattedLocations;
            state.formOptions.timeSlots = formattedTimeSlots;
            state.formOptions.activityTypes = activityTypeOptions;
            state.formOptions.isLoading = false;
            state.formOptions.error = null;
          });
        } catch (error) {
          console.error("Failed to load form options:", error);
          set((state) => {
            state.formOptions.error =
              "Failed to load booking options. Please try again.";
            state.formOptions.isLoading = false;
          });
        }
      },

      // Utility actions
      reset: () => {
        set(() => ({ ...initialState }));
      },

      // Computed getters
      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.totalPrice, 0);
      },

      getCartItemCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },

      getTotalPassengers: () => {
        const { searchParams } = get();
        return (
          searchParams.adults + searchParams.children
          // Removed: + searchParams.infants
        );
      },

      getCartItemById: (cartItemId) => {
        return get().cart.find((item) => item.id === cartItemId);
      },

      isItemInCart: (activityId, searchParams) => {
        return get().cart.some(
          (item) =>
            item.activity.id === activityId &&
            item.searchParams.date === searchParams.date &&
            item.searchParams.time === searchParams.time &&
            item.searchParams.location === searchParams.location
        );
      },
    }))
  )
);

// Hook for easier usage (similar to your original useActivity)
export const useActivity = () => {
  const store = useActivityStore();

  // Auto-load form options if they haven't been loaded yet
  useEffect(() => {
    const shouldLoad =
      store.formOptions.activityTypes.length === 0 &&
      store.formOptions.locations.length === 0 &&
      store.formOptions.timeSlots.length === 0 &&
      !store.formOptions.isLoading &&
      !store.formOptions.error;

    if (shouldLoad) {
      store.loadFormOptions();
    }
  }, [store.formOptions, store.loadFormOptions]);

  return {
    state: {
      searchParams: store.searchParams,
      activities: store.activities,
      isLoading: store.isLoading,
      error: store.error,
      cart: store.cart,
      formOptions: store.formOptions,
      editingItemId: store.editingItemId,
      editingSearchParams: store.editingSearchParams,
    },

    // Actions
    updateSearchParams: store.updateSearchParams,
    searchActivities: store.searchActivities,
    addToCart: store.addToCart,
    removeFromCart: store.removeFromCart,
    updateCartQuantity: store.updateCartQuantity,
    clearCart: store.clearCart,
    startEditingItem: store.startEditingItem,
    editItem: store.editItem,
    updateEditingSearchParams: store.updateEditingSearchParams,
    saveEditedItem: store.saveEditedItem,
    cancelEditing: store.cancelEditing,
    loadFormOptions: store.loadFormOptions,
    reset: store.reset,

    // Computed values
    getCartTotal: store.getCartTotal,
    getCartItemCount: store.getCartItemCount,
    getTotalPassengers: store.getTotalPassengers,
    getCartItemById: store.getCartItemById,
    isItemInCart: store.isItemInCart,
  };
};

// Selectors for performance optimization
export const useSearchParams = () =>
  useActivityStore((state) => state.searchParams);
export const useActivities = () =>
  useActivityStore((state) => state.activities);
export const useCart = () => useActivityStore((state) => state.cart);
export const useFormOptions = () =>
  useActivityStore((state) => state.formOptions);
export const useIsLoading = () => useActivityStore((state) => state.isLoading);
export const useError = () => useActivityStore((state) => state.error);
export const useEditingState = () =>
  useActivityStore((state) => ({
    editingItemId: state.editingItemId,
    editingSearchParams: state.editingSearchParams,
  }));
