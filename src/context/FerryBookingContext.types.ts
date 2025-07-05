import { FerryCardProps } from "@/components/molecules/Cards/FerryCard/FerryCard.types";

// Ferry booking specific state
export interface FerryBookingState {
  ferries: FerryCardProps[];
  filteredFerries: FerryCardProps[];
  mainTimeGroup: FerryCardProps[];
  otherTimeGroups: FerryCardProps[];
  loading: boolean;
  timeFilter: string | null;
  selectedFerryId: string | null;
  selectedClassType: string | null;
}

// Context type that will be provided to consumers
export interface FerryBookingContextType {
  ferryState: FerryBookingState;
  loadFerries: (
    from: string,
    to: string,
    date: string,
    passengers: number
  ) => Promise<void>;
  setTimeFilter: (filter: string | null) => void;
  selectFerry: (ferryId: string, classType: string) => void;
  clearSelection: () => void;
}

// Action types for the reducer
export enum FerryBookingActionTypes {
  SET_FERRIES = "SET_FERRIES",
  SET_FILTERED_FERRIES = "SET_FILTERED_FERRIES",
  SET_TIME_FILTER = "SET_TIME_FILTER",
  SET_LOADING = "SET_LOADING",
  SELECT_FERRY = "SELECT_FERRY",
  CLEAR_SELECTION = "CLEAR_SELECTION",
}

// Action interfaces
export interface SetFerriesAction {
  type: FerryBookingActionTypes.SET_FERRIES;
  payload: FerryCardProps[];
}

export interface SetFilteredFerriesAction {
  type: FerryBookingActionTypes.SET_FILTERED_FERRIES;
  payload: {
    filteredFerries: FerryCardProps[];
    mainTimeGroup: FerryCardProps[];
    otherTimeGroups: FerryCardProps[];
  };
}

export interface SetTimeFilterAction {
  type: FerryBookingActionTypes.SET_TIME_FILTER;
  payload: string | null;
}

export interface SetLoadingAction {
  type: FerryBookingActionTypes.SET_LOADING;
  payload: boolean;
}

export interface SelectFerryAction {
  type: FerryBookingActionTypes.SELECT_FERRY;
  payload: {
    ferryId: string;
    classType: string;
  };
}

export interface ClearSelectionAction {
  type: FerryBookingActionTypes.CLEAR_SELECTION;
}

export type FerryBookingAction =
  | SetFerriesAction
  | SetFilteredFerriesAction
  | SetTimeFilterAction
  | SetLoadingAction
  | SelectFerryAction
  | ClearSelectionAction;
