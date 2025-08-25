// Static boat data with the 3 provided boat routes
export interface BoatRoute {
  id: string;
  from: string;
  to: string;
  timing: string[];
  fare: number;
  minTimeAllowed: string;
  isRoundTrip: boolean;
  description?: string;
}

export const BOAT_ROUTES: BoatRoute[] = [
  {
    id: "port-blair-ross-island",
    from: "Port Blair",
    to: "Ross Island",
    timing: ["09:00", "11:30", "12:30"],
    fare: 470,
    minTimeAllowed: "02 Hrs",
    isRoundTrip: true,
    description:
      "Explore the historical Ross Island with its British colonial ruins and beautiful beaches.",
  },
  {
    id: "port-blair-ross-north-bay",
    from: "Port Blair",
    to: "Ross Island & North Bay Island",
    timing: ["09:00"],
    fare: 870,
    minTimeAllowed: "01:30 hrs at Ross Island, 02:00 hrs at North Bay Island",
    isRoundTrip: true,
    description:
      "Combined trip to both Ross Island and North Bay Island. Experience history at Ross and underwater coral viewing at North Bay.",
  },
  {
    id: "havelock-elephant-beach",
    from: "Havelock Island",
    to: "Elephant Beach",
    timing: ["09:00"],
    fare: 1000,
    minTimeAllowed: "02:30 hrs",
    isRoundTrip: true,
    description:
      "Visit the pristine Elephant Beach known for its crystal clear waters, coral reefs, and water sports activities.",
  },
];

export const BOAT_LOCATIONS = [
  {
    id: "port-blair",
    name: "Port Blair",
    slug: "port-blair",
  },
  {
    id: "ross-island",
    name: "Ross Island",
    slug: "ross-island",
  },
  {
    id: "north-bay-island",
    name: "North Bay Island",
    slug: "north-bay-island",
  },
  {
    id: "havelock-island",
    name: "Havelock Island",
    slug: "havelock-island",
  },
  {
    id: "elephant-beach",
    name: "Elephant Beach",
    slug: "elephant-beach",
  },
];

export const BOAT_TIME_SLOTS = [
  {
    id: "09-00",
    startTime: "09:00",
    endTime: "17:00",
    displayTime: "9:00 AM",
    twelveHourTime: "9:00 AM",
  },
  {
    id: "11-30",
    startTime: "11:30",
    endTime: "17:30",
    displayTime: "11:30 AM",
    twelveHourTime: "11:30 AM",
  },
  {
    id: "12-30",
    startTime: "12:30",
    endTime: "18:30",
    displayTime: "12:30 PM",
    twelveHourTime: "12:30 PM",
  },
];
