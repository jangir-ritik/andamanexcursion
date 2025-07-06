"use client";

import React, { ReactNode } from "react";
import { BookingProvider } from "./BookingContext";
import { FerryBookingProvider } from "./FerryBookingContext";
import { BoatBookingProvider } from "./BoatBookingContext";
import { ActivityBookingProvider } from "./ActivityBookingContext";

// Types for the combined provider
interface BookingProvidersProps {
  children: ReactNode;
}

/**
 * Combined provider for all booking-related contexts
 * This allows us to nest providers in the correct order
 * and ensure they're all available to components that need them
 */
export const BookingProviders: React.FC<BookingProvidersProps> = ({
  children,
}) => {
  return (
    <BookingProvider>
      <FerryBookingProvider>
        <BoatBookingProvider>
          <ActivityBookingProvider>{children}</ActivityBookingProvider>
        </BoatBookingProvider>
      </FerryBookingProvider>
    </BookingProvider>
  );
};

export default BookingProviders;
