"use client";

import React, { createContext, useContext } from "react";

// Create a context to store and provide the prefetched data
export const BookingDataContext = React.createContext<{
  locations: any[];
  activityTimeSlots: any[];
  ferryTimeSlots: any[];
  activities: any[];
}>({
  locations: [],
  activityTimeSlots: [],
  ferryTimeSlots: [],
  activities: [],
});

// Client component that provides the data
export function BookingDataProvider({
  children,
  initialData = {
    locations: [],
    activityTimeSlots: [],
    ferryTimeSlots: [],
    activities: [],
  },
}: {
  children: React.ReactNode;
  initialData?: {
    locations: any[];
    activityTimeSlots: any[];
    ferryTimeSlots: any[];
    activities: any[];
  };
}) {
  return (
    <BookingDataContext.Provider value={initialData}>
      {children}
    </BookingDataContext.Provider>
  );
}
