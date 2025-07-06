import {
  BoatBookingState,
  BoatBookingAction,
  BoatBookingActionTypes,
} from "./BoatBookingContext.types";

// Define the default state
export const defaultBoatBookingState: BoatBookingState = {
  loading: false,
  boats: [],
  filteredBoats: [],
  mainTimeGroup: [],
  otherTimeGroups: [],
  timeFilter: null,
  selectedBoat: null,
  selectedClass: null,
};

// Define the reducer function
export const boatBookingReducer = (
  state: BoatBookingState,
  action: BoatBookingAction
): BoatBookingState => {
  switch (action.type) {
    case BoatBookingActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case BoatBookingActionTypes.SET_BOATS:
      return {
        ...state,
        boats: action.payload,
      };

    case BoatBookingActionTypes.SET_FILTERED_BOATS:
      return {
        ...state,
        filteredBoats: action.payload.filteredBoats,
        mainTimeGroup: action.payload.mainTimeGroup,
        otherTimeGroups: action.payload.otherTimeGroups,
      };

    case BoatBookingActionTypes.SET_TIME_FILTER:
      return {
        ...state,
        timeFilter: action.payload,
      };

    case BoatBookingActionTypes.SELECT_BOAT:
      return {
        ...state,
        selectedBoat: action.payload.boatId,
        selectedClass: action.payload.classType,
      };

    case BoatBookingActionTypes.CLEAR_SELECTION:
      return {
        ...state,
        selectedBoat: null,
        selectedClass: null,
      };

    default:
      return state;
  }
};
