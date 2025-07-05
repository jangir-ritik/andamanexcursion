import {
  FerryBookingState,
  FerryBookingAction,
  FerryBookingActionTypes,
} from "./FerryBookingContext.types";

// Default state for ferry booking
export const defaultFerryBookingState: FerryBookingState = {
  ferries: [],
  filteredFerries: [],
  mainTimeGroup: [],
  otherTimeGroups: [],
  loading: false,
  timeFilter: null,
  selectedFerryId: null,
  selectedClassType: null,
};

/**
 * Reducer function for the ferry booking state
 * @param state Current ferry booking state
 * @param action Action to perform on the state
 * @returns New ferry booking state
 */
export function ferryBookingReducer(
  state: FerryBookingState,
  action: FerryBookingAction
): FerryBookingState {
  switch (action.type) {
    case FerryBookingActionTypes.SET_FERRIES:
      return {
        ...state,
        ferries: action.payload,
      };

    case FerryBookingActionTypes.SET_FILTERED_FERRIES:
      return {
        ...state,
        filteredFerries: action.payload.filteredFerries,
        mainTimeGroup: action.payload.mainTimeGroup,
        otherTimeGroups: action.payload.otherTimeGroups,
      };

    case FerryBookingActionTypes.SET_TIME_FILTER:
      return {
        ...state,
        timeFilter: action.payload,
      };

    case FerryBookingActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case FerryBookingActionTypes.SELECT_FERRY:
      return {
        ...state,
        selectedFerryId: action.payload.ferryId,
        selectedClassType: action.payload.classType,
      };

    case FerryBookingActionTypes.CLEAR_SELECTION:
      return {
        ...state,
        selectedFerryId: null,
        selectedClassType: null,
      };

    default:
      return state;
  }
}
