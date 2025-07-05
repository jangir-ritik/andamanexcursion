"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useReducer,
  useEffect,
} from "react";

import {
  FerryBookingContextType,
  FerryBookingState,
  FerryBookingActionTypes,
} from "./FerryBookingContext.types";

import {
  ferryBookingReducer,
  defaultFerryBookingState,
} from "./FerryBookingReducer";

import { filterFerriesByTime, groupFerriesByTime } from "./FerryBookingUtils";

import { fetchAvailableFerries } from "@/services/ferryService";

// Create the context with undefined as default value
const FerryBookingContext = createContext<FerryBookingContextType | undefined>(
  undefined
);

export const FerryBookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Use reducer for ferry booking state
  const [ferryState, dispatch] = useReducer(
    ferryBookingReducer,
    defaultFerryBookingState
  );

  // Load ferries based on search parameters
  const loadFerries = useCallback(
    async (from: string, to: string, date: string, passengers: number) => {
      // Set loading state
      dispatch({
        type: FerryBookingActionTypes.SET_LOADING,
        payload: true,
      });

      try {
        // Fetch ferries from service
        const data = await fetchAvailableFerries(from, to, date, passengers);

        // Update ferries in state
        dispatch({
          type: FerryBookingActionTypes.SET_FERRIES,
          payload: data,
        });

        // Apply current time filter
        const filteredFerries = filterFerriesByTime(
          data,
          ferryState.timeFilter
        );
        const { mainTimeGroup, otherTimeGroups } =
          groupFerriesByTime(filteredFerries);

        // Update filtered ferries in state
        dispatch({
          type: FerryBookingActionTypes.SET_FILTERED_FERRIES,
          payload: {
            filteredFerries,
            mainTimeGroup,
            otherTimeGroups,
          },
        });
      } catch (error) {
        console.error("Error loading ferries:", error);
      } finally {
        // Set loading state to false
        dispatch({
          type: FerryBookingActionTypes.SET_LOADING,
          payload: false,
        });
      }
    },
    [ferryState.timeFilter]
  );

  // Set time filter
  const setTimeFilter = useCallback((filter: string | null) => {
    dispatch({
      type: FerryBookingActionTypes.SET_TIME_FILTER,
      payload: filter,
    });
  }, []);

  // Update filtered ferries when time filter or ferries change
  useEffect(() => {
    const filteredFerries = filterFerriesByTime(
      ferryState.ferries,
      ferryState.timeFilter
    );
    const { mainTimeGroup, otherTimeGroups } =
      groupFerriesByTime(filteredFerries);

    dispatch({
      type: FerryBookingActionTypes.SET_FILTERED_FERRIES,
      payload: {
        filteredFerries,
        mainTimeGroup,
        otherTimeGroups,
      },
    });
  }, [ferryState.ferries, ferryState.timeFilter]);

  // Select ferry
  const selectFerry = useCallback((ferryId: string, classType: string) => {
    dispatch({
      type: FerryBookingActionTypes.SELECT_FERRY,
      payload: {
        ferryId,
        classType,
      },
    });
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    dispatch({
      type: FerryBookingActionTypes.CLEAR_SELECTION,
    });
  }, []);

  // Create context value
  const contextValue = useMemo<FerryBookingContextType>(
    () => ({
      ferryState,
      loadFerries,
      setTimeFilter,
      selectFerry,
      clearSelection,
    }),
    [ferryState, loadFerries, setTimeFilter, selectFerry, clearSelection]
  );

  return (
    <FerryBookingContext.Provider value={contextValue}>
      {children}
    </FerryBookingContext.Provider>
  );
};

export const useFerryBookingContext = (): FerryBookingContextType => {
  const context = useContext(FerryBookingContext);
  if (context === undefined) {
    throw new Error(
      "useFerryBookingContext must be used within a FerryBookingProvider"
    );
  }
  return context;
};
