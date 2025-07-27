"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";

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
  infants: number;
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
  activity: Activity;
  quantity: number;
  totalPrice: number;
  activityOptionId?: string;
}

export interface ActivityState {
  // Search state
  searchParams: ActivitySearchParams;

  // Results state
  activities: Activity[];
  isLoading: boolean;
  error: string | null;

  // Cart state
  cart: CartItem[];

  // Form options
  formOptions: {
    locations: Array<{
      id: string;
      name: string;
      slug: string;
      value: string;
      label: string;
    }>;
    timeSlots: Array<{
      id: string;
      time: string;
      slug: string;
      value: string;
      label: string;
    }>;
    activityTypes: Array<{
      id: string;
      name: string;
      slug: string;
      value: string;
      label: string;
    }>;
    isLoading: boolean;
    error: string | null;
  };
}

// Actions
export enum ActivityActionTypes {
  SET_SEARCH_PARAMS = "SET_SEARCH_PARAMS",
  SET_LOADING = "SET_LOADING",
  SET_ACTIVITIES = "SET_ACTIVITIES",
  SET_ERROR = "SET_ERROR",
  ADD_TO_CART = "ADD_TO_CART",
  REMOVE_FROM_CART = "REMOVE_FROM_CART",
  UPDATE_CART_QUANTITY = "UPDATE_CART_QUANTITY",
  CLEAR_CART = "CLEAR_CART",
  SET_FORM_OPTIONS = "SET_FORM_OPTIONS",
  SET_FORM_OPTIONS_LOADING = "SET_FORM_OPTIONS_LOADING",
  SET_FORM_OPTIONS_ERROR = "SET_FORM_OPTIONS_ERROR",
}

type ActivityAction =
  | {
      type: ActivityActionTypes.SET_SEARCH_PARAMS;
      payload: Partial<ActivitySearchParams>;
    }
  | { type: ActivityActionTypes.SET_LOADING; payload: boolean }
  | { type: ActivityActionTypes.SET_ACTIVITIES; payload: Activity[] }
  | { type: ActivityActionTypes.SET_ERROR; payload: string | null }
  | {
      type: ActivityActionTypes.ADD_TO_CART;
      payload: {
        activity: Activity;
        quantity: number;
        activityOptionId?: string;
      };
    }
  | { type: ActivityActionTypes.REMOVE_FROM_CART; payload: string }
  | {
      type: ActivityActionTypes.UPDATE_CART_QUANTITY;
      payload: { activityId: string; quantity: number };
    }
  | { type: ActivityActionTypes.CLEAR_CART }
  | {
      type: ActivityActionTypes.SET_FORM_OPTIONS;
      payload: {
        locations?: Array<{
          id: string;
          name: string;
          slug: string;
          value: string;
          label: string;
        }>;
        timeSlots?: Array<{
          id: string;
          time: string;
          slug: string;
          value: string;
          label: string;
        }>;
        activityTypes?: Array<{
          id: string;
          name: string;
          slug: string;
          value: string;
          label: string;
        }>;
      };
    }
  | { type: ActivityActionTypes.SET_FORM_OPTIONS_LOADING; payload: boolean }
  | {
      type: ActivityActionTypes.SET_FORM_OPTIONS_ERROR;
      payload: string | null;
    };

// Helper functions for transforming data
const formatDataForSelect = {
  locations: (locations: any[]) =>
    locations.map((location) => ({
      id: location.id,
      name: location.name,
      slug: location.slug || location.id,
      value: location.slug || location.id,
      label: location.name,
    })),

  timeSlots: (timeSlots: any[]) =>
    timeSlots.map((slot) => ({
      id: slot.id,
      time: slot.startTime, // 24-hour format
      slug: slot.slug,
      value: slot.slug, // Use slug as value
      label: slot.twelveHourTime || formatTimeForDisplay(slot.startTime), // Display 12-hour format
    })),

  activities: (activities: any[]) =>
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

// Default values for the form options
const DEFAULT_ACTIVITY_TYPES = [
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

// Initial state - remove DEFAULT_ACTIVITY_TYPES
const initialState: ActivityState = {
  searchParams: {
    activityType: "",
    location: "",
    date: getTomorrow(),
    time: "",
    adults: 2,
    children: 0,
    infants: 0,
  },
  activities: [],
  isLoading: false,
  error: null,
  cart: [],
  formOptions: {
    locations: [],
    timeSlots: [],
    activityTypes: [], // Start with empty array instead of defaults
    isLoading: false,
    error: null,
  },
};

// Reducer
function activityReducer(
  state: ActivityState,
  action: ActivityAction
): ActivityState {
  switch (action.type) {
    case ActivityActionTypes.SET_SEARCH_PARAMS:
      return {
        ...state,
        searchParams: {
          ...state.searchParams,
          ...action.payload,
        },
      };
    case ActivityActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case ActivityActionTypes.SET_ACTIVITIES:
      return {
        ...state,
        activities: action.payload,
        isLoading: false,
        error: null,
      };
    case ActivityActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case ActivityActionTypes.ADD_TO_CART: {
      const { activity, quantity, activityOptionId } = action.payload;

      // Check if already in cart with same option
      const existingItemIndex = state.cart.findIndex(
        (item) =>
          item.activity.id === activity.id &&
          item.activityOptionId === activityOptionId
      );

      // Get the price from the selected option or base price
      const selectedOption = activityOptionId
        ? activity.activityOptions.find((opt) => opt.id === activityOptionId)
        : null;

      const price = selectedOption?.price || activity.coreInfo.basePrice;

      // Calculate total price based on adults and children counts
      const totalPrice =
        price * (state.searchParams.adults + state.searchParams.children * 0.5);

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex].quantity += quantity;
        updatedCart[existingItemIndex].totalPrice =
          updatedCart[existingItemIndex].quantity * totalPrice;
        return {
          ...state,
          cart: updatedCart,
        };
      } else {
        // Add new item
        return {
          ...state,
          cart: [
            ...state.cart,
            {
              activity,
              quantity,
              totalPrice,
              activityOptionId,
            },
          ],
        };
      }
    }
    case ActivityActionTypes.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter((item) => item.activity.id !== action.payload),
      };
    case ActivityActionTypes.UPDATE_CART_QUANTITY: {
      const { activityId, quantity } = action.payload;
      return {
        ...state,
        cart: state.cart.map((item) => {
          if (item.activity.id === activityId) {
            const basePrice = item.activity.coreInfo.basePrice;
            return {
              ...item,
              quantity,
              totalPrice:
                quantity *
                basePrice *
                (state.searchParams.adults + state.searchParams.children * 0.5),
            };
          }
          return item;
        }),
      };
    }
    case ActivityActionTypes.CLEAR_CART:
      return {
        ...state,
        cart: [],
      };
    case ActivityActionTypes.SET_FORM_OPTIONS:
      return {
        ...state,
        formOptions: {
          ...state.formOptions,
          ...action.payload,
          isLoading: false,
          error: null,
        },
      };
    case ActivityActionTypes.SET_FORM_OPTIONS_LOADING:
      return {
        ...state,
        formOptions: {
          ...state.formOptions,
          isLoading: action.payload,
        },
      };
    case ActivityActionTypes.SET_FORM_OPTIONS_ERROR:
      return {
        ...state,
        formOptions: {
          ...state.formOptions,
          error: action.payload,
          isLoading: false,
        },
      };
    default:
      return state;
  }
}

// Context Signatures
export interface ActivityContextType {
  state: ActivityState;

  // Search actions
  updateSearchParams: (params: Partial<ActivitySearchParams>) => void;
  searchActivities: (searchParams?: ActivitySearchParams) => Promise<void>;

  // cart actions
  addToCart: (
    activity: Activity,
    quantity: number,
    activityOptionId?: string
  ) => void;
  removeFromCart: (activityId: string) => void;
  updateCartQuantity: (activityId: string, quantity: number) => void;
  clearCart: () => void;

  // Form options actions
  loadFormOptions: () => Promise<void>;

  // Computed values
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getTotalPassengers: () => number;
}

const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined
);

// Provider
export const ActivityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(activityReducer, initialState);

  // Load form options on mount
  useEffect(() => {
    loadFormOptions();
  }, []);

  // Form options loading function - memoized
  const loadFormOptions = useCallback(async () => {
    try {
      dispatch({
        type: ActivityActionTypes.SET_FORM_OPTIONS_LOADING,
        payload: true,
      });

      // Fetch data in parallel using client-side API services
      const [categories, locations, timeSlots] = await Promise.all([
        activityCategoryApi.getActive(),
        locationApi.getForActivities(),
        timeSlotApi.getForActivities(),
      ]);

      // Transform data using our helper functions
      const formattedLocations = formatDataForSelect.locations(locations);
      const formattedTimeSlots = formatDataForSelect.timeSlots(timeSlots);

      // Transform categories, use defaults only if empty
      let activityTypeOptions = [];
      if (categories && categories.length > 0) {
        activityTypeOptions = formatDataForSelect.activities(categories);
      } else {
        console.warn(
          "No activity categories returned from API, using defaults"
        );
        activityTypeOptions = DEFAULT_ACTIVITY_TYPES;
      }

      // Update state with form options
      dispatch({
        type: ActivityActionTypes.SET_FORM_OPTIONS,
        payload: {
          locations: formattedLocations,
          timeSlots: formattedTimeSlots,
          activityTypes: activityTypeOptions,
        },
      });
    } catch (error) {
      console.error("Failed to load form options:", error);
      dispatch({
        type: ActivityActionTypes.SET_FORM_OPTIONS_ERROR,
        payload: "Failed to load booking options. Please try again.",
      });
    } finally {
      dispatch({
        type: ActivityActionTypes.SET_FORM_OPTIONS_LOADING,
        payload: false,
      });
    }
  }, []);

  // Search actions - memoized
  const updateSearchParams = useCallback(
    (params: Partial<ActivitySearchParams>) => {
      dispatch({
        type: ActivityActionTypes.SET_SEARCH_PARAMS,
        payload: params,
      });
    },
    []
  );

  // Search for activities
  const searchActivities = useCallback(
    async (params?: ActivitySearchParams): Promise<void> => {
      dispatch({ type: ActivityActionTypes.SET_LOADING, payload: true });
      try {
        // Use provided params or current state
        const searchParams = params || state.searchParams;

        // Log for debugging
        console.log("Searching with params:", searchParams);

        // Call API service to search activities
        const activities = await activityApi.search({
          activityType: searchParams.activityType,
          location: searchParams.location,
          date: searchParams.date,
          time: searchParams.time,
          adults: searchParams.adults,
          children: searchParams.children,
          infants: searchParams.infants,
        });

        // Update state with activities
        dispatch({
          type: ActivityActionTypes.SET_ACTIVITIES,
          payload: activities,
        });
      } catch (error) {
        console.error("Error searching activities:", error);
        dispatch({
          type: ActivityActionTypes.SET_ERROR,
          payload:
            error instanceof Error
              ? error.message
              : "An error occurred while searching for activities",
        });
      }
    },
    [state.searchParams]
  ); // Add dependencies

  // Add activity to cart
  const addToCart = useCallback(
    (activity: Activity, quantity: number, activityOptionId?: string) => {
      dispatch({
        type: ActivityActionTypes.ADD_TO_CART,
        payload: { activity, quantity, activityOptionId },
      });
    },
    [dispatch]
  );

  const removeFromCart = useCallback((activityId: string) => {
    dispatch({
      type: ActivityActionTypes.REMOVE_FROM_CART,
      payload: activityId,
    });
  }, []);

  const updateCartQuantity = useCallback(
    (activityId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(activityId);
        return;
      }
      dispatch({
        type: ActivityActionTypes.UPDATE_CART_QUANTITY,
        payload: { activityId, quantity },
      });
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    dispatch({ type: ActivityActionTypes.CLEAR_CART });
  }, []);

  // Computed values - memoized
  const getTotalPassengers = useCallback(() => {
    return (
      state.searchParams.adults +
      state.searchParams.children +
      state.searchParams.infants
    );
  }, [state.searchParams]);

  const getCartTotal = useCallback(() => {
    return state.cart.reduce((total, item) => total + item.totalPrice, 0);
  }, [state.cart]);

  const getCartItemCount = useCallback(() => {
    return state.cart.reduce((count, item) => count + item.quantity, 0);
  }, [state.cart]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      state,
      updateSearchParams,
      searchActivities,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      loadFormOptions,
      getTotalPassengers,
      getCartTotal,
      getCartItemCount,
    }),
    [
      state,
      updateSearchParams,
      searchActivities,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      loadFormOptions,
      getTotalPassengers,
      getCartTotal,
      getCartItemCount,
    ]
  );

  return (
    <ActivityContext.Provider value={contextValue}>
      {children}
    </ActivityContext.Provider>
  );
};

// Hook
export const useActivity = (): ActivityContextType => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
};
