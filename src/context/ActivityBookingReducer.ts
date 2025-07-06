import {
  ActivityBookingState,
  ActivityBookingAction,
  ActivityBookingActionTypes,
} from "./ActivityBookingContext.types";

// Default state for activity booking
export const defaultActivityBookingState: ActivityBookingState = {
  activities: [],
  filteredActivities: [],
  mainTimeGroup: [],
  otherTimeGroups: [],
  loading: false,
  timeFilter: null,
  selectedActivityId: null,
};

/**
 * Reducer function for the activity booking state
 * @param state Current activity booking state
 * @param action Action to perform on the state
 * @returns New activity booking state
 */
export function activityBookingReducer(
  state: ActivityBookingState,
  action: ActivityBookingAction
): ActivityBookingState {
  switch (action.type) {
    case ActivityBookingActionTypes.SET_ACTIVITIES:
      return {
        ...state,
        activities: action.payload,
      };

    case ActivityBookingActionTypes.SET_FILTERED_ACTIVITIES:
      return {
        ...state,
        filteredActivities: action.payload.filteredActivities,
        mainTimeGroup: action.payload.mainTimeGroup,
        otherTimeGroups: action.payload.otherTimeGroups,
      };

    case ActivityBookingActionTypes.SET_TIME_FILTER:
      return {
        ...state,
        timeFilter: action.payload,
      };

    case ActivityBookingActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ActivityBookingActionTypes.SELECT_ACTIVITY:
      return {
        ...state,
        selectedActivityId: action.payload,
      };

    case ActivityBookingActionTypes.CLEAR_SELECTION:
      return {
        ...state,
        selectedActivityId: null,
      };

    default:
      return state;
  }
}
