"use client";

import { useContext } from "react";
import { BookingDataContext } from "@/context/BookingDataProvider";

export function useBookingData() {
  const context = useContext(BookingDataContext);

  if (!context) {
    throw new Error("useBookingData must be used within a BookingDataProvider");
  }

  return context;
}
