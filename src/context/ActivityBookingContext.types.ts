import { ActivityCardProps } from "@/components/molecules/BookingResults/ActivityResults";

// Activity booking specific state
export interface ActivityBookingState {
  activities: ActivityCardProps[];
  filteredActivities: ActivityCardProps[];
  mainTimeGroup: ActivityCardProps[];
  otherTimeGroups: ActivityCardProps[];
  loading: boolean;
  timeFilter: string | null;
  selectedActivityId: string | null;
}

// Context type that will be provided to consumers
export interface ActivityBookingContextType {
  activityState: ActivityBookingState;
  loadActivities: (
    activity: string,
    date: string,
    time: string,
    passengers: number
  ) => Promise<void>;
  setTimeFilter: (filter: string | null) => void;
  selectActivity: (activityId: string) => void;
  clearSelection: () => void;
}

// Action types for the reducer
export enum ActivityBookingActionTypes {
  SET_ACTIVITIES = "SET_ACTIVITIES",
  SET_FILTERED_ACTIVITIES = "SET_FILTERED_ACTIVITIES",
  SET_TIME_FILTER = "SET_TIME_FILTER",
  SET_LOADING = "SET_LOADING",
  SELECT_ACTIVITY = "SELECT_ACTIVITY",
  CLEAR_SELECTION = "CLEAR_SELECTION",
}

// Action interfaces
export interface SetActivitiesAction {
  type: ActivityBookingActionTypes.SET_ACTIVITIES;
  payload: ActivityCardProps[];
}

export interface SetFilteredActivitiesAction {
  type: ActivityBookingActionTypes.SET_FILTERED_ACTIVITIES;
  payload: {
    filteredActivities: ActivityCardProps[];
    mainTimeGroup: ActivityCardProps[];
    otherTimeGroups: ActivityCardProps[];
  };
}

export interface SetTimeFilterAction {
  type: ActivityBookingActionTypes.SET_TIME_FILTER;
  payload: string | null;
}

export interface SetLoadingAction {
  type: ActivityBookingActionTypes.SET_LOADING;
  payload: boolean;
}

export interface SelectActivityAction {
  type: ActivityBookingActionTypes.SELECT_ACTIVITY;
  payload: string;
}

export interface ClearSelectionAction {
  type: ActivityBookingActionTypes.CLEAR_SELECTION;
}

export type ActivityBookingAction =
  | SetActivitiesAction
  | SetFilteredActivitiesAction
  | SetTimeFilterAction
  | SetLoadingAction
  | SelectActivityAction
  | ClearSelectionAction;
