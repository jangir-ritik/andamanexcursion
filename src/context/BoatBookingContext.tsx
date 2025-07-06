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
  BoatBookingContextType,
  BoatBookingState,
  BoatBookingActionTypes,
} from "./BoatBookingContext.types";

import {
  boatBookingReducer,
  defaultBoatBookingState,
} from "./BoatBookingReducer";

import { filterBoatsByTime, groupBoatsByTime } from "./BoatBookingUtils";

import { fetchAvailableBoats } from "@/services/boatService";

// Create the context with undefined as default value
const BoatBookingContext = createContext<BoatBookingContextType | undefined>(
  undefined
);

export const BoatBookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Use reducer for boat booking state
  const [boatState, dispatch] = useReducer(
    boatBookingReducer,
    defaultBoatBookingState
  );

  // Load boats based on search parameters
  const loadBoats = useCallback(
    async (from: string, to: string, date: string, passengers: number) => {
      // Set loading state
      dispatch({
        type: BoatBookingActionTypes.SET_LOADING,
        payload: true,
      });

      try {
        // Fetch boats from service
        const data = await fetchAvailableBoats(from, to, date, passengers);

        // Update boats in state
        dispatch({
          type: BoatBookingActionTypes.SET_BOATS,
          payload: data,
        });

        // Apply current time filter
        const filteredBoats = filterBoatsByTime(data, boatState.timeFilter);
        const { mainTimeGroup, otherTimeGroups } =
          groupBoatsByTime(filteredBoats);

        // Update filtered boats in state
        dispatch({
          type: BoatBookingActionTypes.SET_FILTERED_BOATS,
          payload: {
            filteredBoats,
            mainTimeGroup,
            otherTimeGroups,
          },
        });
      } catch (error) {
        console.error("Error loading boats:", error);
      } finally {
        // Set loading state to false
        dispatch({
          type: BoatBookingActionTypes.SET_LOADING,
          payload: false,
        });
      }
    },
    [boatState.timeFilter]
  );

  // Set time filter
  const setTimeFilter = useCallback((filter: string | null) => {
    dispatch({
      type: BoatBookingActionTypes.SET_TIME_FILTER,
      payload: filter,
    });
  }, []);

  // Update filtered boats when time filter or boats change
  useEffect(() => {
    const filteredBoats = filterBoatsByTime(
      boatState.boats,
      boatState.timeFilter
    );
    const { mainTimeGroup, otherTimeGroups } = groupBoatsByTime(filteredBoats);

    dispatch({
      type: BoatBookingActionTypes.SET_FILTERED_BOATS,
      payload: {
        filteredBoats,
        mainTimeGroup,
        otherTimeGroups,
      },
    });
  }, [boatState.boats, boatState.timeFilter]);

  // Select boat
  const selectBoat = useCallback(
    (boatId: string, classType: string = "economy") => {
      dispatch({
        type: BoatBookingActionTypes.SELECT_BOAT,
        payload: { boatId, classType },
      });
    },
    []
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    dispatch({
      type: BoatBookingActionTypes.CLEAR_SELECTION,
    });
  }, []);

  // Create context value
  const contextValue = useMemo<BoatBookingContextType>(
    () => ({
      boatState,
      loadBoats,
      setTimeFilter,
      selectBoat,
      clearSelection,
    }),
    [boatState, loadBoats, setTimeFilter, selectBoat, clearSelection]
  );

  return (
    <BoatBookingContext.Provider value={contextValue}>
      {children}
    </BoatBookingContext.Provider>
  );
};

export const useBoatBookingContext = (): BoatBookingContextType => {
  const context = useContext(BoatBookingContext);
  if (context === undefined) {
    throw new Error(
      "useBoatBookingContext must be used within a BoatBookingProvider"
    );
  }
  return context;
};
