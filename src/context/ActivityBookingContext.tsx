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
  ActivityBookingContextType,
  ActivityBookingState,
  ActivityBookingActionTypes,
} from "./ActivityBookingContext.types";

import {
  activityBookingReducer,
  defaultActivityBookingState,
} from "./ActivityBookingReducer";

import {
  filterActivitiesByTime,
  groupActivitiesByTime,
} from "./ActivityBookingUtils";

import { fetchAvailableActivities } from "@/services/activityService";

// Create the context with undefined as default value
const ActivityBookingContext = createContext<
  ActivityBookingContextType | undefined
>(undefined);

export const ActivityBookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Use reducer for activity booking state
  const [activityState, dispatch] = useReducer(
    activityBookingReducer,
    defaultActivityBookingState
  );

  // Load activities based on search parameters
  const loadActivities = useCallback(
    async (
      activity: string,
      date: string,
      time: string,
      passengers: number
    ) => {
      // Set loading state
      dispatch({
        type: ActivityBookingActionTypes.SET_LOADING,
        payload: true,
      });

      try {
        // Fetch activities from service
        const data = await fetchAvailableActivities(
          activity,
          date,
          time,
          passengers
        );

        // Update activities in state
        dispatch({
          type: ActivityBookingActionTypes.SET_ACTIVITIES,
          payload: data,
        });

        // Apply current time filter
        const filteredActivities = filterActivitiesByTime(
          data,
          activityState.timeFilter
        );
        const { mainTimeGroup, otherTimeGroups } =
          groupActivitiesByTime(filteredActivities);

        // Update filtered activities in state
        dispatch({
          type: ActivityBookingActionTypes.SET_FILTERED_ACTIVITIES,
          payload: {
            filteredActivities,
            mainTimeGroup,
            otherTimeGroups,
          },
        });
      } catch (error) {
        console.error("Error loading activities:", error);
      } finally {
        // Set loading state to false
        dispatch({
          type: ActivityBookingActionTypes.SET_LOADING,
          payload: false,
        });
      }
    },
    [activityState.timeFilter]
  );

  // Set time filter
  const setTimeFilter = useCallback((filter: string | null) => {
    dispatch({
      type: ActivityBookingActionTypes.SET_TIME_FILTER,
      payload: filter,
    });
  }, []);

  // Update filtered activities when time filter or activities change
  useEffect(() => {
    const filteredActivities = filterActivitiesByTime(
      activityState.activities,
      activityState.timeFilter
    );
    const { mainTimeGroup, otherTimeGroups } =
      groupActivitiesByTime(filteredActivities);

    dispatch({
      type: ActivityBookingActionTypes.SET_FILTERED_ACTIVITIES,
      payload: {
        filteredActivities,
        mainTimeGroup,
        otherTimeGroups,
      },
    });
  }, [activityState.activities, activityState.timeFilter]);

  // Select activity
  const selectActivity = useCallback((activityId: string) => {
    dispatch({
      type: ActivityBookingActionTypes.SELECT_ACTIVITY,
      payload: activityId,
    });
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    dispatch({
      type: ActivityBookingActionTypes.CLEAR_SELECTION,
    });
  }, []);

  // Create context value
  const contextValue = useMemo<ActivityBookingContextType>(
    () => ({
      activityState,
      loadActivities,
      setTimeFilter,
      selectActivity,
      clearSelection,
    }),
    [
      activityState,
      loadActivities,
      setTimeFilter,
      selectActivity,
      clearSelection,
    ]
  );

  return (
    <ActivityBookingContext.Provider value={contextValue}>
      {children}
    </ActivityBookingContext.Provider>
  );
};

export const useActivityBookingContext = (): ActivityBookingContextType => {
  const context = useContext(ActivityBookingContext);
  if (context === undefined) {
    throw new Error(
      "useActivityBookingContext must be used within an ActivityBookingProvider"
    );
  }
  return context;
};
