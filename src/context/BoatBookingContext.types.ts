// Define the boat interface
export interface Boat {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  price: number;
  totalPrice: number;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  from: string;
  to: string;
  operator: string;
  boatType: string;
  rating: number;
  availableSeats: number;
  classes: {
    economy: {
      price: number;
      availableSeats: number;
    };
    business?: {
      price: number;
      availableSeats: number;
    };
    premium?: {
      price: number;
      availableSeats: number;
    };
  };
}

// Define the action types
export enum BoatBookingActionTypes {
  SET_LOADING = "SET_LOADING",
  SET_BOATS = "SET_BOATS",
  SET_FILTERED_BOATS = "SET_FILTERED_BOATS",
  SET_TIME_FILTER = "SET_TIME_FILTER",
  SELECT_BOAT = "SELECT_BOAT",
  CLEAR_SELECTION = "CLEAR_SELECTION",
}

// Define the state interface
export interface BoatBookingState {
  loading: boolean;
  boats: Boat[];
  filteredBoats: Boat[];
  mainTimeGroup: Boat[];
  otherTimeGroups: Boat[];
  timeFilter: string | null;
  selectedBoat: string | null;
  selectedClass: string | null;
}

// Define the context interface
export interface BoatBookingContextType {
  boatState: BoatBookingState;
  loadBoats: (
    from: string,
    to: string,
    date: string,
    passengers: number
  ) => Promise<void>;
  setTimeFilter: (filter: string | null) => void;
  selectBoat: (boatId: string, classType?: string) => void;
  clearSelection: () => void;
}

// Define action interfaces
interface SetLoadingAction {
  type: BoatBookingActionTypes.SET_LOADING;
  payload: boolean;
}

interface SetBoatsAction {
  type: BoatBookingActionTypes.SET_BOATS;
  payload: Boat[];
}

interface SetFilteredBoatsAction {
  type: BoatBookingActionTypes.SET_FILTERED_BOATS;
  payload: {
    filteredBoats: Boat[];
    mainTimeGroup: Boat[];
    otherTimeGroups: Boat[];
  };
}

interface SetTimeFilterAction {
  type: BoatBookingActionTypes.SET_TIME_FILTER;
  payload: string | null;
}

interface SelectBoatAction {
  type: BoatBookingActionTypes.SELECT_BOAT;
  payload: {
    boatId: string;
    classType: string;
  };
}

interface ClearSelectionAction {
  type: BoatBookingActionTypes.CLEAR_SELECTION;
}

// Union of all actions
export type BoatBookingAction =
  | SetLoadingAction
  | SetBoatsAction
  | SetFilteredBoatsAction
  | SetTimeFilterAction
  | SelectBoatAction
  | ClearSelectionAction;
