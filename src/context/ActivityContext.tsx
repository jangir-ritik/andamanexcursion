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
  description: string;
  price: number;
  duration: string;
  images: Array<{ src: string; alt: string }>;
  availableSlots: number;
}

export interface CartItem {
  activity: Activity;
  quantity: number;
  totalPrice: number;
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
      payload: { activity: Activity; quantity: number };
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
      description:
        apiActivity.content?.shortDescription || "No description available",
      price: apiActivity.coreInfo?.price || 0,
      duration: apiActivity.coreInfo?.duration || "1 hour",
      images: apiActivity.media?.gallery?.map((img: any) => ({
        src: img.url || "/images/placeholder.png",
        alt: img.alt || apiActivity.title || "Activity image",
      })) || [{ src: "/images/placeholder.png", alt: "Placeholder image" }],
      availableSlots: apiActivity.coreInfo?.capacity || 10,
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
        error: null,
      };
    case ActivityActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case ActivityActionTypes.ADD_TO_CART:
      const existingItem = state.cart.find(
        (item) => item.activity.id === action.payload.activity.id
      );

      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.activity.id === action.payload.activity.id
              ? {
                  ...item,
                  quantity: item.quantity + action.payload.quantity,
                  totalPrice:
                    (item.quantity + action.payload.quantity) *
                    item.activity.price,
                }
              : item
          ),
        };
      }

      return {
        ...state,
        cart: [
          ...state.cart,
          {
            activity: action.payload.activity,
            quantity: action.payload.quantity,
            totalPrice: action.payload.quantity * action.payload.activity.price,
          },
        ],
      };
    case ActivityActionTypes.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter((item) => item.activity.id !== action.payload),
      };

    case ActivityActionTypes.UPDATE_CART_QUANTITY:
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.activity.id === action.payload.activityId
            ? {
                ...item,
                quantity: action.payload.quantity,
                totalPrice: action.payload.quantity * item.activity.price,
              }
            : item
        ),
      };

    case ActivityActionTypes.CLEAR_CART:
      return { ...state, cart: [] };

    case ActivityActionTypes.SET_FORM_OPTIONS:
      return {
        ...state,
        formOptions: {
          ...state.formOptions,
          ...action.payload,
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
  addToCart: (activity: Activity, quantity: number) => void;
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

  const searchActivities = useCallback(
    async (searchParams?: ActivitySearchParams) => {
      dispatch({ type: ActivityActionTypes.SET_LOADING, payload: true });

      try {
        // Use provided search params or fallback to state
        const params = searchParams || state.searchParams;

        // Validate required fields before proceeding
        const { activityType, location } = params;

        if (!activityType || !location) {
          throw new Error(
            "Please select both activity type and location to search"
          );
        }

        // Attempt to search using the API
        let results = [];

        try {
          results = await activityApi.search({
            activityType: params.activityType,
            location: params.location,
            date: params.date,
            time: params.time,
            adults: params.adults,
            children: params.children,
            infants: params.infants,
          });

          // Convert API results to match our Activity interface
          results = formatDataForSelect.apiActivities(results);
        } catch (apiError) {
          console.error("API search failed, using mock data:", apiError);

          // If API fails, use mock data
          results = [
            {
              id: "1",
              title: "Scuba Diving at Neil Island",
              description:
                "Explore the underwater world with professional instructors",
              price: 2500,
              duration: "2 hours",
              images: [{ src: "/images/scuba1.jpg", alt: "Scuba diving" }],
              availableSlots: 8,
            },
            {
              id: "2",
              title: "Snorkeling Adventure",
              description: "Perfect for beginners, explore coral reefs safely",
              price: 1500,
              duration: "1.5 hours",
              images: [{ src: "/images/snorkel1.jpg", alt: "Snorkeling" }],
              availableSlots: 12,
            },
          ];
        }

        dispatch({
          type: ActivityActionTypes.SET_ACTIVITIES,
          payload: results,
        });
      } catch (error) {
        dispatch({
          type: ActivityActionTypes.SET_ERROR,
          payload:
            error instanceof Error
              ? error.message
              : "Failed to load activities",
        });
      } finally {
        dispatch({ type: ActivityActionTypes.SET_LOADING, payload: false });
      }
    },
    [state.searchParams]
  );

  // Cart actions - memoized
  const addToCart = useCallback((activity: Activity, quantity: number = 1) => {
    dispatch({
      type: ActivityActionTypes.ADD_TO_CART,
      payload: { activity, quantity },
    });
  }, []);

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
